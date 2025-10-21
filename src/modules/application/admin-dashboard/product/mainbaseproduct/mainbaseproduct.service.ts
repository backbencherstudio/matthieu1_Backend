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
            create: (createDto.variants || []).map(v => ({
              color: v.color,
              size: v.size,
              price: Number(v.price),
              discountPrice: v.discountPrice !== undefined ? Number(v.discountPrice) : undefined,
              stockQuantity: Number(v.stockQuantity),
              isDefault: !!v.isDefault,
              images: v.images?.length ? { create: v.images.map(url => ({ url })) } : undefined,
            })),
          },
        },
        include: {
          variants: { include: { images: true } },
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
          category: true,
          subcategory: true,
          variants: { include: { images: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      return {
        data: baseProducts,
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

  async findByCategory(options: { subcategoryId?: string; categoryId: string }) {
    if (!options?.categoryId) {
      throw new BadRequestException('categoryId is required');
    }
    const where: any = { categoryId: options.categoryId };
    if (options?.subcategoryId) where.subcategoryId = options.subcategoryId;

    try {
      const baseProducts = await this.prisma.baseProduct.findMany({
        where,
        include: {
          category: true,
          subcategory: true,
          variants: { include: { images: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return baseProducts;
    } catch (error) {
      throw new BadRequestException('Failed to fetch base products by category');
    }
  }

  async findOne(id: string) {
    try {
      const baseProduct = await this.prisma.baseProduct.findUnique({
        where: { id },
        include: {
          category: true,
          subcategory: true,
          variants: { include: { images: true } },
        },
      });
      return baseProduct;
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
          await this.prisma.variant.create({
            data: {
              Baseproduct: { connect: { id } },
              color: v.color,
              size: v.size,
              price: Number(v.price),
              discountPrice: v.discountPrice !== undefined ? Number(v.discountPrice) : undefined,
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

      const updated = await this.prisma.variant.update({
        where: { id: variantId },
        data: {
          ...(dto.color !== undefined && { color: dto.color }),
          ...(dto.size !== undefined && { size: dto.size }),
          ...(dto.price !== undefined && { price: Number(dto.price) }),
          ...(dto.stockQuantity !== undefined && { stockQuantity: Number(dto.stockQuantity) }),
          ...(Object.keys(nestedImages).length > 0 && { images: nestedImages }),
        },
        include: { images: true },
      });
      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Variant with same color/size already exists');
      }
      throw error;
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
