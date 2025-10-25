import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMainbaseproductDto } from './dto/create-mainbaseproduct.dto';
import { UpdateMainbaseproductDto } from './dto/update-mainbaseproduct.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ProductUploadService } from './product-upload.service';

@Injectable()
export class MainbaseproductService {
  constructor(private prisma: PrismaService, private fileSvc: ProductUploadService) { }

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
        const found = await this.prisma.baseProduct.findUnique({ where: { sku } });
        exists = !!found;
      }
      return sku;
    } catch (error) {
      throw new BadRequestException('Failed to generate unique SKU');
    }
  }

  async create(createDto: CreateMainbaseproductDto) {
    // hard guard: variants must be present and non-empty
    if (!Array.isArray((createDto as any).variants) || (createDto as any).variants.length === 0) {
      throw new BadRequestException('At least one variant is required');
    }
    for (let i = 0; i < (createDto as any).variants.length; i++) {
      const v: any = (createDto as any).variants[i];
      if (v == null || v.price === undefined || Number.isNaN(Number(v.price))) {
        throw new BadRequestException(`Variant[${i}] price is required and must be a number`);
      }
      if (v.stockQuantity === undefined || Number.isNaN(Number(v.stockQuantity))) {
        throw new BadRequestException(`Variant[${i}] stockQuantity is required and must be a number`);
      }
    }
    try {
      const category = await this.prisma.category.findUnique({
        where: { id: createDto.categoryId },
        select: { id: true, type: true },
      });
      if (!category) {
        throw new BadRequestException('Invalid categoryId');
      }

      if (createDto.subcategoryId) {
        const subcategory = await this.prisma.subcategory.findUnique({
          where: { id: createDto.subcategoryId },
          select: { id: true, categoryId: true },
        });
        if (!subcategory) {
          throw new BadRequestException('Invalid subcategoryId');
        }
        if (subcategory.categoryId !== createDto.categoryId) {
          throw new BadRequestException('subcategoryId does not belong to the provided categoryId');
        }
      }

      if (category.type === 'SADDLES') {
        const allowedSaddleNames = ['JUMPING', 'DRESSAGE', 'CROSS_COUNTRY', 'KIDS'];
        const normalizedName = (createDto.name || '').trim().toUpperCase();
        if (!allowedSaddleNames.includes(normalizedName)) {
          throw new BadRequestException('For SADDLES category, name must be one of: JUMPING, DRESSAGE, CROSS_COUNTRY, KIDS');
        }
        createDto.name = normalizedName;
      }

      const sku = await this.generateUniqueSku();

      const created = await this.prisma.baseProduct.create({
        data: {
          name: createDto.name,
          sku,
          benefits: createDto.benefits,
          description: createDto.description,
          leatherCareGuide: createDto.leatherCareGuide,
          category: { connect: { id: createDto.categoryId } },
          ...(createDto.subcategoryId && { subcategory: { connect: { id: createDto.subcategoryId } } }),
          variants: {
            create: await Promise.all((createDto.variants || []).map(async v => {
              let colorName: string | undefined;
              let sizeName: string | undefined;
              if (v.colorId) {
                const color = await this.prisma.color.findUnique({ where: { id: v.colorId }, select: { name: true } });
                if (!color) throw new BadRequestException('Invalid colorId');

                colorName = color.name;
              }
              if (v.sizeId) {
                const size = await this.prisma.size.findUnique({ where: { id: v.sizeId }, select: { name: true } });
                if (!size) throw new BadRequestException('Invalid sizeId');
                sizeName = size.name;
              }
              return {
                colorId: v.colorId,
                sizeId: v.sizeId,
                color: colorName,
                size: sizeName,
                price: Number(v.price),
                stockQuantity: Number(v.stockQuantity),
                isDefault: !!v.isDefault,
                images: v.images?.length ? { create: v.images.map(url => ({ url })) } : undefined,
              };
            })),
          },
        },
        include: {
          variants: { include: { images: true, colorRef: true, sizeRef: true } },
          category: true,
          subcategory: true,
        },
      });
      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Unique constraint failed. Please choose different values.');
      }
      throw error;
    }
  }

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

    if (options?.category) {
      where.category = options.category;
    }

    if (options?.search) {
      where.OR = [
        { sku: { contains: options.search, mode: 'insensitive' } },
        { name: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    try {
      const totalCount = await this.prisma.baseProduct.count({ where });
      const baseProducts = await this.prisma.baseProduct.findMany({
        where,
        include: {
          category: { select: { name: true } },
          subcategory: { select: { name: true } },
          variants: {
            include: { images: true, colorRef: true, sizeRef: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      // Transform response
      const formattedData = baseProducts.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        category: product.category
          ? `${product.category.name} → ${product.subcategory?.name || ''}`
          : null,
        Total_variant: product.variants?.length || 0,
        created_at: product.createdAt,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          color: variant.color,
          size: variant.size,
          price: variant.price,
          stockQuantity: variant.stockQuantity,
          isDefault: variant.isDefault,
          images: variant.images.map((image) => ({ id: image.id, url: image.url })),
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
      throw new BadRequestException('Failed to list base products');
    }
  }


  // async findByCategory(options: { subcategoryId?: string; categoryId: string }) {
  //   if (!options?.categoryId) {
  //     throw new BadRequestException('categoryId is required');
  //   }
  //   const where: any = { categoryId: options.categoryId };
  //   if (options?.subcategoryId) where.subcategoryId = options.subcategoryId;

  //   try {
  //     const baseProducts = await this.prisma.baseProduct.findMany({
  //       where,
  //       include: {
  //         category: true,
  //         subcategory: true,
  //         variants: { select: { isDefault: true, price: true } },
  //       },
  //       orderBy: { createdAt: 'desc' },
  //     });

  //     const formatted = baseProducts.map((product) => {
  //       const defaultVariant = product.variants.find((v) => v.isDefault);

  //       // 🚨 Validation: if category.type = 'SADDLES' and subcategoryId exists, hide price
  //       const shouldHidePrice =
  //         product.category?.type === 'SADDLES' && product.subcategory?.id;

  //       return {
  //         id: product.id,
  //         name: product.name,
  //         sku: product.sku,
  //         categoryId: product.categoryId,
  //         categoryName: product.category ? product.category.name : null,
  //         subcategoryId: product.subcategoryId,
  //         subcategoryName: product.subcategory ? product.subcategory.name : null,
  //         price: shouldHidePrice ? null : defaultVariant?.price ?? null,
  //       };
  //     });
  //     return formatted;
  //   } catch (error) {
  //     throw new BadRequestException('Failed to fetch base products by category');
  //   }
  // }

  async findByCategory(options: {
    subcategoryId?: string;
    categoryId: string;
    minPrice?: number;
    maxPrice?: number;
    sizeId?: string;
    colorId?: string;
  }) {
    if (!options?.categoryId) {
      throw new BadRequestException('categoryId is required');
    }

    const where: any = {
      categoryId: options.categoryId,
    };

    // optional filters
    if (options.subcategoryId) where.subcategoryId = options.subcategoryId;


    try {
      const baseProducts = await this.prisma.baseProduct.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, type: true } },
          subcategory: { select: { id: true, name: true } },
          variants: {
            where: {
              ...(options.colorId && { colorId: options.colorId }),
              ...(options.sizeId && { sizeId: options.sizeId }),
              ...(options.minPrice !== undefined || options.maxPrice !== undefined
                ? {
                  price: {
                    ...(options.minPrice !== undefined && { gte: Number(options.minPrice) }),
                    ...(options.maxPrice !== undefined && { lte: Number(options.maxPrice) }),
                  },
                }
                : {}),
            },
            select: { id: true, isDefault: true, price: true, color: true, size: true, images: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = baseProducts.map((product) => {
        const defaultVariant = product.variants.find((v) => v.isDefault);

        // 🚨 Validation: if category.type = 'SADDLES' and subcategoryId exists, hide price
        const shouldHidePrice =
          product.category?.type === 'SADDLES' && product.subcategory?.id;

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          categoryName: product.category ? product.category.name : null,
          subcategoryId: product.subcategoryId,
          subcategoryName: product.subcategory ? product.subcategory.name : null,
          price: shouldHidePrice ? null : defaultVariant?.price ?? null,
          variants: product.variants.map((v) => ({
            id: v.id,
            color: v.color,
            size: v.size,
            price: v.price,
          })),
        };
      });

      return formatted;
    } catch (error) {
      throw new BadRequestException('Failed to fetch base products by category');
    }
  }


  private getStockStatus(stockQuantity: number): string {
    if (stockQuantity === 0) {
      return 'Out of Stock';
    } else if (stockQuantity < 10) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  }

  async findOne(id: string) {
    try {
      const baseProduct = await this.prisma.baseProduct.findUnique({
        where: { id },
        include: {
          category: true,
          subcategory: true,
          variants: { include: { images: true, colorRef: true, sizeRef: true } },
        },
      });
      if (!baseProduct) {
        throw new BadRequestException('Base product not found');
      }

      return {
        id: baseProduct.id,
        name: baseProduct.name,
        sku: baseProduct.sku,
        description: baseProduct.description,
        benefits: baseProduct.benefits,
        leatherCareGuide: baseProduct.leatherCareGuide,
        category: baseProduct.category
          ? `${baseProduct.category.name} → ${baseProduct.subcategory?.name || ''}`
          : null,
        variants: baseProduct.variants.map((variant) => ({
          id: variant.id,
          color: variant.color,
          size: variant.size,
          price: variant.price,
          stockQuantity: variant.stockQuantity,
          status: this.getStockStatus(variant.stockQuantity),
          isDefault: variant.isDefault,
          images: variant.images.map((image) => ({ id: image.id, url: image.url })),
        })),
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch base product');
    }
  }

  //find the product  default variant for user....

  async findOnebyuser(id: string) {
    try {
      const baseProduct = await this.prisma.baseProduct.findUnique({
        where: { id },
        include: {
          category: true,
          subcategory: true,
          variants: { include: { images: true, colorRef: true, sizeRef: true } },
        },
      });

      if (!baseProduct) {
        throw new BadRequestException('Base product not found');
      }

      const defaultVariants = baseProduct.variants.filter(v => v.isDefault === true);

      return {
        id: baseProduct.id,
        name: baseProduct.name,
        sku: baseProduct.sku,
        description: baseProduct.description,
        benefits: baseProduct.benefits,
        leatherCareGuide: baseProduct.leatherCareGuide,
        category: baseProduct.category
          ? `${baseProduct.category.name} → ${baseProduct.subcategory?.name || ''}`
          : null,
        variants: defaultVariants.map((variant) => ({
          id: variant.id,
          colorId: variant.colorRef?.id,
          color: variant.color,
          sizeId: variant.sizeRef?.id,
          size: variant.size,
          price: variant.price,
          stockQuantity: variant.stockQuantity,
          status: this.getStockStatus(variant.stockQuantity),
          isDefault: variant.isDefault,
          images: variant.images.map((image) => ({ id: image.id, url: image.url })),
        })),
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch base product');
    }
  }


  async update(id: string, updateDto: UpdateMainbaseproductDto) {
    // Load current to validate with its existing category
    const current = await this.prisma.baseProduct.findUnique({
      where: { id },
      select: { name: true, categoryId: true },
    });
    if (!current) {
      throw new BadRequestException('Base product not found');
    }

    // Enforce SADDLES name normalization against current category (category cannot be changed)
    if (updateDto.name !== undefined) {
      if (!current.categoryId) {
        throw new BadRequestException('Invalid category on base product');
      }
      const category = await this.prisma.category.findUnique({
        where: { id: current.categoryId },
        select: { id: true, type: true },
      });
      if (!category) {
        throw new BadRequestException('Invalid category on base product');
      }
      if (category.type === 'SADDLES') {
        const allowedSaddleNames = ['JUMPING', 'DRESSAGE', 'CROSS_COUNTRY', 'KIDS'];
        const normalizedName = (updateDto.name || '').trim().toUpperCase();
        if (!allowedSaddleNames.includes(normalizedName)) {
          throw new BadRequestException('For SADDLES category, name must be one of: JUMPING, DRESSAGE, CROSS_COUNTRY, KIDS');
        }
        updateDto.name = normalizedName;
      }
    }

    // Ignore category and subcategory updates explicitly
    const { /* categoryId, subcategoryId, */ variantsCreate, ...rest } = updateDto as any;
    const data: any = {
      ...(rest.name !== undefined && { name: rest.name }),
      ...(rest.benefits !== undefined && { benefits: rest.benefits }),
      ...(rest.description !== undefined && { description: rest.description }),
      ...(rest.leatherCareGuide !== undefined && { leatherCareGuide: rest.leatherCareGuide }),
    };

    try {
      // Update scalar fields first
      await this.prisma.baseProduct.update({ where: { id }, data });

      // Process variant creations
      if (Array.isArray(variantsCreate) && variantsCreate.length > 0) {
        for (const v of variantsCreate) {
          let colorName: string | undefined;
          let sizeName: string | undefined;
          if (v.colorId) {
            const color = await this.prisma.color.findUnique({ where: { id: v.colorId }, select: { name: true } });
            if (!color) throw new BadRequestException('Invalid colorId');
            colorName = color.name;
          }
          if (v.sizeId) {
            const size = await this.prisma.size.findUnique({ where: { id: v.sizeId }, select: { name: true } });
            if (!size) throw new BadRequestException('Invalid sizeId');
            sizeName = size.name;
          }

          await this.prisma.variant.create({
            data: {
              BaseproductId: id,
              colorId: v.colorId,
              sizeId: v.sizeId,
              color: colorName,
              size: sizeName,
              price: Number(v.price),
              stockQuantity: Number(v.stockQuantity),
              isDefault: !!v.isDefault,
              images: v.images?.length ? { create: v.images.map((url: string) => ({ url })) } : undefined,
            }
          });
        }
      }

      // Return updated full entity
      return await this.prisma.baseProduct.findUnique({
        where: { id },
        include: {
          category: true,
          subcategory: true,
          variants: { include: { images: true } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Unique constraint failed. Please choose different values.');
      }
      throw error;
    }
  }

  remove(id: string) {
    try {
      return this.prisma.$transaction(async (tx) => {
        // collect all variant image URLs for this base product
        const images = await tx.variantImage.findMany({
          where: { variant: { BaseproductId: id } },
          select: { url: true },
        });

        // best-effort storage cleanup
        for (const img of images) {
          await this.fileSvc.deleteOne(img.url);
        }

        // delete base product (cascades to variants and images)
        const deleted = await tx.baseProduct.delete({ where: { id } });
        return deleted;
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete base product');
    }
  }

  // Variant edits handled by VariantController
  private async ensureVariantBelongsToBase(baseProductId: string, variantId: string) {
    const variant = await this.prisma.variant.findUnique({
      where: { id: variantId },
      select: { BaseproductId: true },
    });
    if (!variant) {
      throw new BadRequestException('Variant not found');
    }
    if (variant.BaseproductId !== baseProductId) {
      throw new BadRequestException('Variant does not belong to the specified base product');
    }
  }

  async updateVariant(baseProductId: string, variantId: string, dto: any) {
    await this.ensureVariantBelongsToBase(baseProductId, variantId);
    try {
      const nestedImages: any = {};
      if (Array.isArray(dto.imagesAdd) && dto.imagesAdd.length > 0) {
        nestedImages.create = dto.imagesAdd.map((url: string) => ({ url }));
      }

      // Map colorId/sizeId to names if provided
      const updateData: any = {};
      if (dto.colorId !== undefined) {
        if (dto.colorId === null || dto.colorId === '') {
          updateData.colorId = null;
          updateData.color = null;
        } else {
          const color = await this.prisma.color.findUnique({ where: { id: dto.colorId }, select: { name: true, id: true } });
          if (!color) throw new BadRequestException('Invalid colorId');
          updateData.colorId = color.id;
          updateData.color = color.name;
        }
      }
      if (dto.sizeId !== undefined) {
        if (dto.sizeId === null || dto.sizeId === '') {
          updateData.sizeId = null;
          updateData.size = null;
        } else {
          const size = await this.prisma.size.findUnique({ where: { id: dto.sizeId }, select: { name: true, id: true } });
          if (!size) throw new BadRequestException('Invalid sizeId');
          updateData.sizeId = size.id;
          updateData.size = size.name;
        }
      }

      const updated = await this.prisma.variant.update({
        where: { id: variantId },
        data: {
          ...updateData,
          ...(dto.price !== undefined && { price: Number(dto.price) }),
          ...(dto.stockQuantity !== undefined && { stockQuantity: Number(dto.stockQuantity) }),
          ...(Object.keys(nestedImages).length > 0 && { images: nestedImages }),
        },
        include: { images: true, colorRef: true, sizeRef: true },
      });
      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Variant with same color/size already exists');
      }
      throw error;
    }
  }

  async setDefaultVariantByColorAndSize(baseProductId: string, colorId: string, sizeId: string) {
    try {
      // find all variants for this product
      const variants = await this.prisma.variant.findMany({
        where: { BaseproductId: baseProductId },
      });

      if (!variants || variants.length === 0) {
        throw new BadRequestException('No variants found for this base product');
      }

      // find the target variant
      const targetVariant = variants.find(
        (v) => v.colorId === colorId && v.sizeId === sizeId,
      );

      if (!targetVariant) {
        throw new BadRequestException('No variant found with the given color and size');
      }

      // update all variants in a single transaction
      await this.prisma.$transaction(async (tx) => {
        // make all variants isDefault = false
        await tx.variant.updateMany({
          where: { BaseproductId: baseProductId },
          data: { isDefault: false },
        });

        // set target variant isDefault = true
        await tx.variant.update({
          where: { id: targetVariant.id },
          data: { isDefault: true },
        });
      });

      return {
        message: 'Default variant updated successfully',
        variantId: targetVariant.id,
        colorId,
        sizeId,
      };
    } catch (error) {
      throw new BadRequestException('Failed to update default variant');
    }
  }


  async deleteVariant(baseProductId: string, variantId: string) {
    await this.ensureVariantBelongsToBase(baseProductId, variantId);
    try {
      // capture image URLs before DB delete
      const images = await this.prisma.variantImage.findMany({
        where: { variantId },
        select: { url: true },
      });

      const deleted = await this.prisma.variant.delete({ where: { id: variantId } });

      // best-effort file cleanup
      for (const img of images) {
        await this.fileSvc.deleteOne(img.url);
      }

      return deleted;
    } catch (error) {
      throw new BadRequestException('Failed to delete variant');
    }
  }

  async deleteVariantImage(baseProductId: string, variantId: string, imageId: string) {
    await this.ensureVariantBelongsToBase(baseProductId, variantId);
    const image = await this.prisma.variantImage.findUnique({ where: { id: imageId } });
    if (!image) throw new BadRequestException('Image not found');
    try {
      // best effort delete in storage first
      await this.fileSvc.deleteOne(image.url);
      // then remove db record
      return await this.prisma.variantImage.delete({ where: { id: imageId } });
    } catch (error) {
      throw new BadRequestException('Failed to delete variant image');
    }
  }
}
