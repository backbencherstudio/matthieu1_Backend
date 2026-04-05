import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Color,
  Prisma,
  productcategory,
  saddlecountry,
  tackSubcategory,
} from '@prisma/client';
import { ProductUploadService } from './product-upload.service';
import { CreateTackproductDto } from './dto/create-tackproduct.dto';
import { UpdateTackproductDto } from './dto/update-tackproduct.dto';
import { resolveCurrencyFromCountry } from 'src/common/utils/currency.util';
import { resolveRegionFromCountry } from 'src/common/utils/region.util';

@Injectable()
export class TackproductService {
  constructor(
    private prisma: PrismaService,
    private fileSvc: ProductUploadService,
  ) {}

  private formatVariantPrice(variant: any, country?: string) {
    const currency = resolveCurrencyFromCountry(country);
    const region = resolveRegionFromCountry(country);

    if (currency === 'USD') {
      return {
        price: variant.price_usd,
        currency: 'USD',
      };
    }

    return {
      price: variant.price_eur,
      currency: 'EUR',
    };
  }

  /* ---------------- SKU ---------------- */

  private generateSku(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return `BR${result}`;
  }

  private async generateUniqueSku(): Promise<string> {
    try {
      let sku = '';
      let exists = true;
      while (exists) {
        sku = this.generateSku();
        const found = await this.prisma.tackProduct.findUnique({
          where: { sku },
        });
        exists = !!found;
      }
      return sku;
    } catch {
      throw new BadRequestException('Failed to generate unique SKU');
    }
  }

  /* ---------------- CREATE ---------------- */

  async create(createDto: CreateTackproductDto) {
    if (!Array.isArray(createDto.variants) || createDto.variants.length === 0) {
      throw new BadRequestException('At least one variant is required');
    }

    const hasEmptyVariant = createDto.variants.some(
      (v) => !v.colorId && !v.sizeId,
    );

    if (hasEmptyVariant && createDto.variants.length > 1) {
      throw new BadRequestException(
        'If variant has no size and color, product can contain only ONE variant.',
      );
    }

    if (!Object.values(productcategory).includes(createDto.category)) {
      throw new BadRequestException('Invalid category');
    }

    if (
      createDto.subcategory &&
      !Object.values(tackSubcategory).includes(createDto.subcategory)
    ) {
      throw new BadRequestException('Invalid subcategory');
    }

    const sku = await this.generateUniqueSku();

    return this.prisma.tackProduct.create({
      data: {
        name: createDto.name,
        sku,
        benefits: createDto.benefits,
        description: createDto.description,
        leatherCareGuide: createDto.leatherCareGuide,
        thumbnailImage: createDto.thumbnailImage,
        category: createDto.category,
        country: createDto.country,
        subcategory: createDto.subcategory,

        variants: {
          create: await Promise.all(
            createDto.variants.map(async (v) => {
              let colorName: string | undefined;
              let sizeName: string | undefined;

              if (v.colorId) {
                const color = await this.prisma.color.findUnique({
                  where: { id: v.colorId },
                });
                if (!color) throw new BadRequestException('Invalid colorId');
                colorName = color.name;
              }

              if (v.sizeId) {
                const size = await this.prisma.size.findUnique({
                  where: { id: v.sizeId },
                });
                if (!size) throw new BadRequestException('Invalid sizeId');
                sizeName = size.name;
              }

              return {
                colorId: v.colorId ?? null,
                sizeId: v.sizeId ?? null,
                color: colorName,
                size: sizeName,
                price_usd: Number(v.price_usd),
                price_eur: Number(v.price_eur),
                stockQuantity: Number(v.stockQuantity),
                isDefault: !!v.isDefault,
                images: v.images?.length
                  ? {
                      create: v.images.map((url: string) => ({ url })),
                    }
                  : undefined,
              };
            }),
          ),
        },
      },
      include: {
        variants: {
          include: { images: true, colorRef: true, sizeRef: true },
        },
      },
    });
  }

  /* ---------------- FIND ALL ---------------- */

  async findAll(options?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options?.category) where.category = options.category;
    if (options?.search) {
      where.OR = [
        { sku: { contains: options.search, mode: 'insensitive' } },
        { name: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    try {
      const totalCount = await this.prisma.tackProduct.count({ where });
      const products = await this.prisma.tackProduct.findMany({
        where,
        include: {
          variants: {
            include: { images: true, colorRef: true, sizeRef: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const formattedData = products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        country: product.country,
        category: product.subcategory
          ? `${product.category} → ${product.subcategory}`
          : product.category,
        Total_variant: product.variants.length,
        thumbnailImage: product.thumbnailImage,
        created_at: product.createdAt,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          color: variant.color,
          size: variant.size,
          price_usd: variant.price_usd,
          price_eur: variant.price_eur,
          stockQuantity: variant.stockQuantity,
          isDefault: variant.isDefault,
          images: variant.images.map((img) => ({
            id: img.id,
            url: img.url,
          })),
        })),
      }));

      return {
        data: formattedData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to list tack products');
    }
  }

  async getProductsGroupedBySubcategoryForUser(
    category: productcategory,
    country?: string,
  ) {
    const region = resolveRegionFromCountry(country);
    const products = await this.prisma.tackProduct.findMany({
      where: { category, country: region },
      include: {
        variants: {
          where: { isDefault: true }, // 👈 user only default variant
          include: { images: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 🔹 group by subcategory
    const grouped: Record<string, any[]> = {};

    for (const product of products) {
      const subcat = product.subcategory ?? 'OTHERS';

      if (!grouped[subcat]) {
        grouped[subcat] = [];
      }

      const defaultVariant = product.variants[0];

      grouped[subcat].push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        // price_usd: defaultVariant?.price_usd ?? null,
        // price_eur: defaultVariant?.price_eur ?? null,
        // image: defaultVariant?.images?.[0]?.url ?? null,
        ...(defaultVariant
          ? this.formatVariantPrice(defaultVariant, country)
          : { price: null, currency: null }),
        thumbnailImage: product.thumbnailImage,
      });
    }

    // 🔹 format response
    return Object.entries(grouped).map(([subcategory, items]) => ({
      subcategory,
      products: items,
    }));
  }

  /* ---------------- FIND ONE ---------------- */

  async findOne(id: string) {
    try {
      const product = await this.prisma.tackProduct.findUnique({
        where: { id },
        include: {
          variants: {
            include: { images: true, colorRef: true, sizeRef: true },
          },
        },
      });

      if (!product) {
        throw new BadRequestException('Tack product not found');
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        country: product.country,
        description: product.description,
        benefits: product.benefits,
        leatherCareGuide: product.leatherCareGuide,
        thumbnailImage: product.thumbnailImage,
        category: product.subcategory
          ? `${product.category} → ${product.subcategory}`
          : product.category,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          colorId: variant.colorId,
          color: variant.color,
          sizeid: variant.sizeId,
          size: variant.size,
          price_usd: variant.price_usd,
          price_eur: variant.price_eur,
          stockQuantity: variant.stockQuantity,
          status: this.getStockStatus(variant.stockQuantity),
          isDefault: variant.isDefault,
          images: variant.images.map((img) => ({
            id: img.id,
            url: img.url,
          })),
        })),
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch base product');
    }
  }

  // async getProductForUser(
  //   productId: string,
  //   colorId?: string,
  //   sizeId?: string,
  //   country?: string,
  // ) {
  //   // 1️⃣ Check product exists
  //   const region = resolveRegionFromCountry(country);
  //   const product = await this.prisma.tackProduct.findUnique({
  //     where: { id: productId, country: region },
  //     select: {
  //       id: true,
  //       name: true,
  //       sku: true,
  //       description: true,
  //       category: true,
  //       subcategory: true,
  //       country: true,
  //     },
  //   });

  //   if (!product) {
  //     throw new NotFoundException('Product not found');
  //   }

  //   // 2️⃣ Find specific variant if filters provided
  //   let variant;

  //   if (colorId || sizeId) {
  //     variant = await this.prisma.variant.findFirst({
  //       where: {
  //         TackProductId: productId,
  //         ...(colorId && { colorId }),
  //         ...(sizeId && { sizeId }),
  //       },
  //       include: {
  //         images: true,
  //       },
  //     });

  //     if (!variant) {
  //       throw new NotFoundException('Selected variant not available');
  //     }
  //   } else {
  //     // 3️⃣ Otherwise return default variant
  //     variant = await this.prisma.variant.findFirst({
  //       where: {
  //         TackProductId: productId,
  //         isDefault: true,
  //       },
  //       include: {
  //         images: true,
  //       },
  //     });

  //     if (!variant) {
  //       throw new NotFoundException('No default variant available');
  //     }
  //   }

  //   // 🔥 Remove null/undefined fields helper
  //   const removeNullFields = (obj: any) =>
  //     Object.fromEntries(
  //       Object.entries(obj).filter(
  //         ([_, value]) => value !== null && value !== undefined,
  //       ),
  //     );

  //   const cleanedProduct = removeNullFields({
  //     id: product.id,
  //     name: product.name,
  //     sku: product.sku,
  //     country: product.country,
  //     description: product.description,
  //     category: product.subcategory
  //       ? `${product.category} → ${product.subcategory}`
  //       : product.category,
  //   });

  //   const cleanedVariant = removeNullFields({
  //     id: variant.id,
  //     colorId: variant.colorId,
  //     color: variant.color,
  //     sizeId: variant.sizeId,
  //     size: variant.size,
  //     // price: variant.price,
  //     ...this.formatVariantPrice(variant, country),
  //     stockQuantity: variant.stockQuantity,
  //     images: variant.images?.length
  //       ? variant.images.map((img) => img.url)
  //       : undefined,
  //   });

  //   return {
  //     ...cleanedProduct,
  //     variant: cleanedVariant,
  //   };
  // }

  async getProductForUser(
    productId: string,
    colorId?: string,
    sizeId?: string,
    country?: string,
  ) {
    const region = resolveRegionFromCountry(country);

    // 1️⃣ Check product exists
    const product = await this.prisma.tackProduct.findFirst({
      where: {
        id: productId,
        country: region,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        category: true,
        subcategory: true,
        country: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2️⃣ Get all variants
    const variants = await this.prisma.variant.findMany({
      where: {
        TackProductId: productId,
      },
      include: {
        images: true,
      },
    });

    if (!variants.length) {
      throw new NotFoundException('No variants available for this product');
    }

    // 🔥 Remove null/undefined fields helper
    const removeNullFields = (obj: any) =>
      Object.fromEntries(
        Object.entries(obj).filter(
          ([_, value]) => value !== null && value !== undefined,
        ),
      );

    const cleanedProduct = removeNullFields({
      id: product.id,
      name: product.name,
      sku: product.sku,
      country: product.country,
      description: product.description,
      category: product.subcategory
        ? `${product.category} → ${product.subcategory}`
        : product.category,
    });

    const cleanedVariants = variants.map((variant) =>
      removeNullFields({
        id: variant.id,
        colorId: variant.colorId,
        color: variant.color,
        sizeId: variant.sizeId,
        size: variant.size,
        isDefault: variant.isDefault,
        ...this.formatVariantPrice(variant, country),
        stockQuantity: variant.stockQuantity,
        images: variant.images?.length
          ? variant.images.map((img) => img.url)
          : undefined,
      }),
    );

    // 3️⃣ Selected Variant Logic (as per your requirement)
    let selectedVariant;

    if (colorId || sizeId) {
      // 👉 Query based selection
      selectedVariant = cleanedVariants.find(
        (variant) =>
          (!colorId || variant.colorId === colorId) &&
          (!sizeId || variant.sizeId === sizeId),
      );

      if (!selectedVariant) {
        throw new NotFoundException('Selected variant not available');
      }
    } else {
      // 👉 Only default variant
      selectedVariant = cleanedVariants.find(
        (variant) => variant.isDefault === true,
      );

      if (!selectedVariant) {
        throw new NotFoundException('Default variant not found');
      }
    }

    return {
      ...cleanedProduct,
      selectedVariant,
      variants: cleanedVariants,
    };
  }

  /* ---------------- UPDATE / DELETE / VARIANT METHODS ---------------- */

  private getStockStatus(stockQuantity: number): string {
    if (stockQuantity === 0) return 'Out of Stock';
    if (stockQuantity < 10) return 'Low Stock';
    return 'In Stock';
  }

  async update(
    id: string,
    updateDto: UpdateTackproductDto & { thumbnailFile?: Express.Multer.File },
  ) {
    const current = await this.prisma.tackProduct.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!current) {
      throw new BadRequestException('Tack product not found');
    }

    let thumbnailImage: string | undefined;

    if (updateDto.thumbnailFile) {
      if (current.thumbnailImage) {
        await this.fileSvc.deleteOne(current.thumbnailImage);
      }
      thumbnailImage = await this.fileSvc.uploadOne(
        'tack-products',
        updateDto.thumbnailFile,
      );
    }

    if (updateDto.variantsCreate?.length) {
      const existingVariants = current.variants;

      const hasEmptyVariantInExisting = existingVariants.some(
        (v) => !v.colorId && !v.sizeId,
      );

      const hasEmptyVariantInNew = updateDto.variantsCreate.some(
        (v) => !v.colorId && !v.sizeId,
      );

      if (hasEmptyVariantInExisting) {
        throw new BadRequestException(
          'Product already contains single variant. Cannot add more variants.',
        );
      }

      if (hasEmptyVariantInNew && existingVariants.length > 0) {
        throw new BadRequestException(
          'Cannot add single variant to product that already has variants.',
        );
      }

      if (hasEmptyVariantInNew && updateDto.variantsCreate.length > 1) {
        throw new BadRequestException(
          'Single variant product can contain only one variant.',
        );
      }

      for (const v of updateDto.variantsCreate) {
        await this.createVariant(id, v);
      }
    }

    return this.prisma.tackProduct.update({
      where: { id },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.benefits && { benefits: updateDto.benefits }),
        ...(updateDto.description && {
          description: updateDto.description,
        }),
        ...(updateDto.leatherCareGuide && {
          leatherCareGuide: updateDto.leatherCareGuide,
        }),
        ...(thumbnailImage && { thumbnailImage }),
      },
      include: { variants: true },
    });
  }

  remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const images = await tx.variantImage.findMany({
        where: { variant: { TackProductId: id } },
        select: { url: true },
      });

      for (const img of images) {
        await this.fileSvc.deleteOne(img.url);
      }

      return tx.tackProduct.delete({ where: { id } });
    });
  }

  /* ---------------- VARIANT HELPERS (UNCHANGED) ---------------- */

  private async ensureVariantBelongsToBase(
    tackProductId: string,
    variantId: string,
  ) {
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
      select: { TackProductId: true },
    });
    if (!variant) throw new BadRequestException('Variant not found');
    if (variant.TackProductId !== tackProductId) {
      throw new BadRequestException(
        'Variant does not belong to the specified product',
      );
    }
  }

  async createVariant(tackProductId: string, dto: any) {
    // 🔒 ensure product exists
    const product = await this.prisma.tackProduct.findUnique({
      where: { id: tackProductId },
    });

    if (!product) {
      throw new BadRequestException('Tack product not found');
    }

    // ❌ prevent duplicate variant (color + size)
    const exists = await this.prisma.variant.findFirst({
      where: {
        TackProductId: tackProductId,
        colorId: dto.colorId ?? null,
        sizeId: dto.sizeId ?? null,
      },
    });

    if (exists) {
      throw new BadRequestException(
        'Variant with same color and size already exists',
      );
    }

    let colorName: string | undefined;
    let sizeName: string | undefined;

    if (dto.colorId) {
      const color = await this.prisma.color.findUnique({
        where: { id: dto.colorId },
        select: { name: true },
      });
      if (!color) throw new BadRequestException('Invalid colorId');
      colorName = color.name;
    }

    if (dto.sizeId) {
      const size = await this.prisma.size.findUnique({
        where: { id: dto.sizeId },
        select: { name: true },
      });
      if (!size) throw new BadRequestException('Invalid sizeId');
      sizeName = size.name;
    }

    // 🔁 if isDefault → reset others
    if (dto.isDefault) {
      await this.prisma.variant.updateMany({
        where: { TackProductId: tackProductId },
        data: { isDefault: false },
      });
    }

    // ✅ create variant
    const createdVariant = await this.prisma.variant.create({
      data: {
        TackProductId: tackProductId,
        colorId: dto.colorId,
        sizeId: dto.sizeId,
        color: colorName,
        size: sizeName,
        price_usd: Number(dto.price_usd),
        price_eur: Number(dto.price_eur),
        stockQuantity: Number(dto.stockQuantity),
        isDefault: !!dto.isDefault,
        images: dto.images?.length
          ? {
              create: dto.images.map((url: string) => ({ url })),
            }
          : undefined,
      },
      include: {
        images: true,
        colorRef: true,
        sizeRef: true,
      },
    });

    // 🔥 sync thumbnail if default variant
    if (createdVariant.isDefault && createdVariant.images.length > 0) {
      await this.prisma.tackProduct.update({
        where: { id: tackProductId },
        data: {
          thumbnailImage: createdVariant.images[0].url,
        },
      });
    }

    return createdVariant;
  }

  async updateVariant(tackProductId: string, variantId: string, dto: any) {
    await this.ensureVariantBelongsToBase(tackProductId, variantId);

    const nestedImages: any = {};
    if (Array.isArray(dto.imagesAdd) && dto.imagesAdd.length) {
      nestedImages.create = dto.imagesAdd.map((url: string) => ({ url }));
    }

    const updateData: any = {};

    if (dto.colorId !== undefined) {
      if (!dto.colorId) {
        updateData.colorId = null;
        updateData.color = null;
      } else {
        const color = await this.prisma.color.findUnique({
          where: { id: dto.colorId },
        });
        if (!color) throw new BadRequestException('Invalid colorId');
        updateData.colorId = color.id;
        updateData.color = color.name;
      }
    }

    if (dto.sizeId !== undefined) {
      if (!dto.sizeId) {
        updateData.sizeId = null;
        updateData.size = null;
      } else {
        const size = await this.prisma.size.findUnique({
          where: { id: dto.sizeId },
        });
        if (!size) throw new BadRequestException('Invalid sizeId');
        updateData.sizeId = size.id;
        updateData.size = size.name;
      }
    }

    return this.prisma.variant.update({
      where: { id: variantId },
      data: {
        ...updateData,
        ...(dto.price !== undefined && { price: Number(dto.price) }),
        ...(dto.stockQuantity !== undefined && {
          stockQuantity: Number(dto.stockQuantity),
        }),
        ...(Object.keys(nestedImages).length && { images: nestedImages }),
      },
      include: { images: true, colorRef: true, sizeRef: true },
    });
  }

  async setDefaultVariant(tackProductId: string, variantId: string) {
    await this.ensureVariantBelongsToBase(tackProductId, variantId);

    await this.prisma.$transaction([
      this.prisma.variant.updateMany({
        where: { TackProductId: tackProductId },
        data: { isDefault: false },
      }),
      this.prisma.variant.update({
        where: { id: variantId },
        data: { isDefault: true },
      }),
    ]);

    return {
      message: 'Default variant set successfully',
      variantId,
    };
  }

  async deleteVariant(tackProductId: string, variantId: string) {
    await this.ensureVariantBelongsToBase(tackProductId, variantId);

    const images = await this.prisma.variantImage.findMany({
      where: { variantId },
      select: { url: true },
    });

    const deleted = await this.prisma.variant.delete({
      where: { id: variantId },
    });

    for (const img of images) {
      await this.fileSvc.deleteOne(img.url);
    }

    return deleted;
  }

  async deleteVariantImage(
    tackProductId: string,
    variantId: string,
    imageId: string,
  ) {
    await this.ensureVariantBelongsToBase(tackProductId, variantId);

    const image = await this.prisma.variantImage.findUnique({
      where: { id: imageId },
    });
    if (!image) throw new BadRequestException('Image not found');

    await this.fileSvc.deleteOne(image.url);
    return this.prisma.variantImage.delete({ where: { id: imageId } });
  }
}
