import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateMainproductDto } from './dto/create-mainproduct.dto';
import { UpdateMainproductDto } from './dto/update-mainproduct.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MainproductService {
  constructor(private prisma: PrismaService) { }

  private generateSku(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return `BR${result}`; // e.g., BR7D2NS
  }

  private async generateUniqueSku(): Promise<string> {
    let sku = '';
    let exists = true;
    while (exists) {
      sku = this.generateSku();
      const found = await this.prisma.product.findUnique({ where: { sku } });
      exists = !!found;
    }
    return sku;
  }

  async createProduct(
    createMainproductDto: CreateMainproductDto,
    images: Express.Multer.File[],
    user_id: string
  ) {
    // ALWAYS auto-generate a unique SKU at create time
    const sku = await this.generateUniqueSku();

    return this.prisma.product.create({
      data: {
        name: createMainproductDto.name,
        sku: sku,
        stockQuantity: Number(createMainproductDto.stockQuantity), // convert to Int
        benefits: createMainproductDto.benefits,
        description: createMainproductDto.description,
        leatherCareGuide: createMainproductDto.leatherCareGuide,
        price: Number(createMainproductDto.price), // convert to Float/Int
        discountPrice: Number(createMainproductDto.discountPrice), // convert to Float/Int
        color: createMainproductDto.color,
        size: createMainproductDto.size,
        //category: { connect: { id: createMainproductDto.categoryId } },
        category: createMainproductDto.category,
        subcategory: { connect: { id: createMainproductDto.subcategoryId } },

        images: images?.length
          ? {
            create: images.map((file) => ({
              url: file.originalname, // replace with actual upload path or cloud URL
            })),
          }
          : undefined,
      },
      include: {
        subcategory: true,
        images: true,
      },
    });
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

    // Build where clause for filtering and search
    const where: any = {};

    // Category filter
    if (options?.category) {
      where.category = options.category;
    }

    // Keyword search for SKU, Name, and category
    if (options?.search) {
      where.OR = [
        { sku: { contains: options.search, mode: 'insensitive' } },
        { name: { contains: options.search, mode: 'insensitive' } },
        { category: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination metadata
    const totalCount = await this.prisma.product.count({ where });

    // Get paginated products
    const products = await this.prisma.product.findMany({
      where,
      include: {
        subcategory: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Add stock status and select only required fields
    const productsWithStockStatus = products.map(product => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
      Status: this.getStockStatus(product.stockQuantity),
      images: product.images
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: productsWithStockStatus,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPreviousPage,
      },
    };
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

  findOne(id: string) {
    const product = this.prisma.product.findUnique({
      where: { id: id },
      include: {
        subcategory: true,
        images: true,
      },
    });
    return product;

  }

  async update(id: string, updateMainproductDto: UpdateMainproductDto, images: Express.Multer.File[] = []) {
    // NOTE: SKU cannot be edited. Any provided sku will be ignored.

    const data: any = {
      ...(updateMainproductDto.name && { name: updateMainproductDto.name }),
      // no sku updates here
      ...(updateMainproductDto.stockQuantity !== undefined && { stockQuantity: Number(updateMainproductDto.stockQuantity) }),
      ...(updateMainproductDto.benefits !== undefined && { benefits: updateMainproductDto.benefits }),
      ...(updateMainproductDto.description !== undefined && { description: updateMainproductDto.description }),
      ...(updateMainproductDto.leatherCareGuide !== undefined && { leatherCareGuide: updateMainproductDto.leatherCareGuide }),
      ...(updateMainproductDto.price !== undefined && { price: Number(updateMainproductDto.price) }),
      ...(updateMainproductDto.discountPrice !== undefined && { discountPrice: Number(updateMainproductDto.discountPrice) }),
      ...(updateMainproductDto.color !== undefined && { color: updateMainproductDto.color }),
      ...(updateMainproductDto.size !== undefined && { size: updateMainproductDto.size }),
      ...(updateMainproductDto.category !== undefined && { category: updateMainproductDto.category }),
      ...(updateMainproductDto.subcategoryId !== undefined && { subcategory: { connect: { id: updateMainproductDto.subcategoryId } } }),
      ...(images && images.length > 0 && {
        images: {
          deleteMany: {}, // delete all existing images
          create: images.map((file) => ({ url: file.originalname })),
        },
      }),
    };

    try {
      return await this.prisma.product.update({
        where: { id },
        data,
        include: {
          subcategory: true,
          images: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Unique constraint failed
        throw new BadRequestException('Unique constraint failed. Please choose different values.');
      }
      throw error;
    }
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
