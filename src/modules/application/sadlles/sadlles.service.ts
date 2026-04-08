import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSadlleDto } from './dto/create-sadlle.dto';
import { UpdateSadlleDto } from './dto/update-sadlle.dto';
import {
  productcategory,
  saddleSubcategory,
  saddleSize,
  saddlecountry,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaddleUploadService } from './saddle-upload.service';
import { resolveCurrencyFromCountry } from 'src/common/utils/currency.util';
import { resolveRegionFromCountry } from 'src/common/utils/region.util';

@Injectable()
export class SadllesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: SaddleUploadService,
  ) {}

  private formatPrice(product: any, country?: string) {
    const currency = resolveCurrencyFromCountry(country);

    const price = currency === 'USD' ? product.price_usd : product.price_eur;

    return {
      price,
      currency,
    };
  }

  private generateSku(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < 5; i++) {
      result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return `SD${result}`;
  }

  private async generateUniqueSku(): Promise<string> {
    let sku: string;
    let exists = true;

    while (exists) {
      sku = this.generateSku();

      const found = await this.prisma.saddlesProduct.findUnique({
        where: { sku },
      });

      exists = !!found;
    }

    return sku!;
  }

  private mapSize(size: string): saddleSize {
    if (size === '12.5') return saddleSize.SIZE_12_5;
    if (size === '14.5') return saddleSize.SIZE_14_5;

    throw new BadRequestException(
      'Invalid size. Allowed values are 12.5 and 14.5',
    );
  }

  /* ------------------------------------------------ */
  /* CREATE */
  /* ------------------------------------------------ */

  async create(dto: CreateSadlleDto) {
    let mappedSize: saddleSize | null = null;

    if (dto.category === productcategory.LEADLINE) {
      if (dto.stockQuantity === undefined || dto.stockQuantity === null) {
        throw new BadRequestException(
          'stockQuantity is required for LEADLINE product',
        );
      }

      if (dto.stockQuantity < 0) {
        throw new BadRequestException('stockQuantity must be 0 or greater');
      }

      if (!dto.size) {
        throw new BadRequestException('size is required for LEADLINE product');
      }

      mappedSize = this.mapSize(dto.size);

      const existingCount = await this.prisma.saddlesProduct.count({
        where: {
          category: productcategory.LEADLINE,
        },
      });

      if (existingCount >= 4) {
        throw new BadRequestException(
          'Maximum 4 LEADLINE products are allowed',
        );
      }

      const duplicateLeadline = await this.prisma.saddlesProduct.findFirst({
        where: {
          category: productcategory.LEADLINE,
          country: dto.country,
          size: mappedSize,
        },
      });

      if (duplicateLeadline) {
        throw new BadRequestException(
          `LEADLINE product already exists for country ${dto.country} and size ${dto.size}`,
        );
      }
    }

    if (dto.category === productcategory.SADDLES) {
      if (dto.stockQuantity !== undefined && dto.stockQuantity !== null) {
        throw new BadRequestException(
          'SADDLES product does not support stockQuantity',
        );
      }

      if (!dto.subcategory) {
        throw new BadRequestException('Subcategory is required for SADDLES');
      }

      const count = await this.prisma.saddlesProduct.count({
        where: {
          subcategory: dto.subcategory,
        },
      });

      if (count >= 4) {
        throw new BadRequestException(
          'Each subcategory can have less than 4 products',
        );
      }
    }

    const sku = await this.generateUniqueSku();

    return this.prisma.saddlesProduct.create({
      data: {
        name: dto.name,
        sku,
        price_usd: dto.price_usd,
        price_eur: dto.price_eur,
        country: dto.country,

        stockQuantity:
          dto.category === productcategory.LEADLINE ? dto.stockQuantity : null,

        size: dto.category === productcategory.LEADLINE ? mappedSize : null,

        category: dto.category,

        subcategory:
          dto.category === productcategory.SADDLES ? dto.subcategory : null,

        header_title:
          dto.category === productcategory.SADDLES ? dto.header_title : null,

        header_description:
          dto.category === productcategory.SADDLES
            ? dto.header_description
            : null,

        description:
          dto.category === productcategory.SADDLES ? dto.description : null,

        colors:
          dto.category === productcategory.SADDLES ? (dto.colors ?? []) : [],

        piping_color:
          dto.category === productcategory.SADDLES
            ? (dto.piping_color ?? [])
            : [],

        leather_type:
          dto.category === productcategory.SADDLES
            ? (dto.leather_type ?? [])
            : [],
      },
    });
  }

  /* ------------------------------------------------ */
  /* FIND ALL */
  /* ------------------------------------------------ */

  async findAll(subcategory?: saddleSubcategory, country?: string) {
    const region = resolveRegionFromCountry(country);

    const baseWhere = {
      category: productcategory.SADDLES,
      country: region,
    };

    if (subcategory) {
      const products = await this.prisma.saddlesProduct.findMany({
        where: {
          ...baseWhere,
          subcategory,
        },
        select: {
          id: true,
          name: true,
          price_usd: true,
          price_eur: true,
          images: {
            take: 1,
            select: { url: true },
          },
        },
      });

      if (products.length === 0) {
        return 'Comming Soon';
      }

      return products.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.images[0]?.url || null,
        ...this.formatPrice(p, country),
      }));
    }

    const products = await this.prisma.saddlesProduct.findMany({
      where: baseWhere,
      select: {
        id: true,
        name: true,
        subcategory: true,
        price_usd: true,
        price_eur: true,
        images: {
          take: 1,
          select: { url: true },
        },
      },
    });

    const grouped: Record<saddleSubcategory, any[] | string> = {
      ARION: 'Comming Soon',
      ATLAS: 'Comming Soon',
      ATHENA: 'Comming Soon',
    };

    for (const product of products) {
      if (grouped[product.subcategory] === 'Comming Soon') {
        grouped[product.subcategory] = [];
      }

      (grouped[product.subcategory] as any[]).push({
        id: product.id,
        name: product.name,
        image: product.images[0]?.url || null,
        ...this.formatPrice(product, country),
      });
    }

    return grouped;
  }

  async getAllSaddlesForAdmin(page: number, limit: number) {
    // Calculate the offset (skip) based on the current page
    const skip = (page - 1) * limit;

    // Fetch the products with pagination
    const products = await this.prisma.saddlesProduct.findMany({
      where: {
        category: productcategory.SADDLES, // Only fetch saddle category
      },
      select: {
        id: true,
        name: true,
        header_title: true,
        header_description: true,
        price_usd: true,
        price_eur: true,
        stockQuantity: true,
        description: true,
        subcategory: true,
        piping_color: true,
        leather_type: true,
        colors: true,
        images: {
          take: 1,
          select: { url: true },
        },
      },
      skip, // Skip products based on the page
      take: limit, // Limit the number of products per page
    });

    // Count the total number of products (without pagination) for pagination metadata
    const totalProducts = await this.prisma.saddlesProduct.count({
      where: { category: productcategory.SADDLES },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Group products by subcategory
    const grouped: Record<saddleSubcategory, any[]> = {
      ARION: [],
      ATLAS: [],
      ATHENA: [],
    };

    for (const product of products) {
      if (!grouped[product.subcategory]) {
        grouped[product.subcategory] = []; // Initialize if not already present
      }
      grouped[product.subcategory].push({
        id: product.id,
        name: product.name,
        header_title: product.header_title,
        header_description: product.header_description,
        price_usd: product.price_usd,
        price_eur: product.price_eur,
        stockQuantity: product.stockQuantity,
        description: product.description,
        subcategory: product.subcategory,
        piping_color: product.piping_color,
        leather_type: product.leather_type,
        colors: product.colors,
        image: product.images[0]?.url || null, // Take the first image URL
      });
    }

    // Return the paginated data along with pagination metadata
    return {
      products: grouped,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  /* ------------------------------------------------ */
  /* FIND ONE */
  /* ------------------------------------------------ */

  async findOne(id: string, country?: string) {
    const region = resolveRegionFromCountry(country);

    const product = await this.prisma.saddlesProduct.findFirst({
      where: {
        id,
        category: productcategory.SADDLES,
        country: region,
      },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Saddle product not found');
    }

    return {
      ...product,
      ...this.formatPrice(product, country),
    };
  }

  /* ------------------------------------------------ */
  /* LEADLINE PRODUCT */
  /* ------------------------------------------------ */

  // ================= GET ALL LEADLINE FOR ADMIN =================
  async getAllLeadlinesForAdmin() {
    // Fetch all products where category is 'LEADLINE'
    const products = await this.prisma.saddlesProduct.findMany({
      where: { category: productcategory.LEADLINE }, // Only fetch LEADLINE category
    });

    if (!products.length) {
      throw new NotFoundException('No LEADLINE products found');
    }

    return products;
  }

  async getLeadlineProduct(country?: string) {
    const region = resolveRegionFromCountry(country);

    const product = await this.prisma.saddlesProduct.findFirst({
      where: {
        category: productcategory.LEADLINE,
        country: region,
      },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Leadline product not found');
    }

    return {
      id: product.id,
      name: product.name,
      size: product.size,
      images: product.images,
      stockQuantity: product.stockQuantity,
      ...this.formatPrice(product, country),
    };
  }

  async getSpecificLeadlineforUser(id: string, country?: string) {
    const region = resolveRegionFromCountry(country); // Resolve region from the provided country

    // Fetch the specific leadline product by ID, with country filtering
    const product = await this.prisma.saddlesProduct.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!product || product.category !== productcategory.LEADLINE) {
      throw new NotFoundException('Leadline product not found');
    }

    // Country filter: Check if the product's country matches the region
    if (product.country !== region) {
      throw new BadRequestException(
        'This product is not available in the selected country',
      );
    }

    // Return the product details along with price formatting for the country
    return {
      id: product.id,
      name: product.name,
      size: product.size,
      images: product.images,
      stockQuantity: product.stockQuantity,
      ...this.formatPrice(product, country), // Add price formatting for the region
    };
  }

  /* ------------------------------------------------ */
  /* UPDATE */
  /* ------------------------------------------------ */

  async update(id: string, dto: UpdateSadlleDto) {
    const product = await this.prisma.saddlesProduct.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException('Saddle product not found');
    }

    return this.prisma.saddlesProduct.update({
      where: { id },
      data: {
        name: dto.name ?? product.name,
        price_usd: dto.price_usd ?? product.price_usd,
        price_eur: dto.price_eur ?? product.price_eur,
        header_title: dto.header_title ?? product.header_title,
        header_description:
          dto.header_description ?? product.header_description,
        description: dto.description ?? product.description,
        colors: dto.colors ?? product.colors,
        piping_color: dto.piping_color ?? product.piping_color,
        leather_type: dto.leather_type ?? product.leather_type,
        // size:
        //   dto.size !== undefined && dto.size !== null
        //     ? this.mapSize(dto.size)
        //     : product.size,
        stockQuantity: dto.stockQuantity ?? product.stockQuantity,
      },
      include: { images: true },
    });
  }

  /* ------------------------------------------------ */
  /* IMAGE MANAGEMENT */
  /* ------------------------------------------------ */

  async addImages(saddleId: string, urls: string[]) {
    await this.prisma.saddleProductImage.createMany({
      data: urls.map((url) => ({
        url,
        SaddlesProductId: saddleId,
      })),
    });

    return { message: 'Images added successfully' };
  }

  async delete(id: string) {
    const product = await this.prisma.saddlesProduct.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException('Saddle product not found');
    }

    for (const image of product.images) {
      await this.uploadService.deleteOne(image.url);
    }

    await this.prisma.saddleProductImage.deleteMany({
      where: { SaddlesProductId: id },
    });

    await this.prisma.saddlesProduct.delete({
      where: { id },
    });

    return {
      message: 'Saddle product deleted successfully',
      data: product,
    };
  }

  async deleteImage(imageId: string) {
    const image = await this.prisma.saddleProductImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.uploadService.deleteOne(image.url);

    await this.prisma.saddleProductImage.delete({
      where: { id: imageId },
    });

    return {
      message: 'Image deleted successfully',
      data: image.url,
    };
  }

  // ================= DELETE LEADLINE PRODUCT =================
  async deleteLeadline(id: string) {
    const product = await this.prisma.saddlesProduct.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.category !== productcategory.LEADLINE) {
      throw new BadRequestException('This is not a LEADLINE product');
    }

    // Proceed with deletion of the LEADLINE product
    await this.prisma.saddlesProduct.delete({
      where: { id },
    });

    return {
      id: product.id,
      name: product.name,
    };
  }

  // ================= GET SPECIFIC LEADLINE =================
  async getSpecificLeadline(id: string) {
    const product = await this.prisma.saddlesProduct.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product || product.category !== productcategory.LEADLINE) {
      throw new NotFoundException('Leadline product not found');
    }

    return product;
  }

  // ================= UPDATE LEADLINE =================
  async updateLeadline(
    id: string,
    dto: UpdateSadlleDto,
    files: Express.Multer.File[],
  ) {
    const product = await this.prisma.saddlesProduct.findUnique({
      where: { id },
    });

    if (!product || product.category !== productcategory.LEADLINE) {
      throw new NotFoundException('Leadline product not found');
    }

    // Handle file uploads if there are any
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      imageUrls = await this.uploadService.uploadMany('saddles/images', files); // Assuming you have an upload service
    }

    // // The `size` field is already validated in the DTO as an enum value, so no need for further mapping
    // let mappedSize: saddleSize | undefined;
    // if (dto.size) {
    //   mappedSize = dto.size; // Since it's already an enum, no need to map to string
    // }

    // // If 'country' is provided, update it
    // let updatedCountry: saddlecountry | undefined;
    // if (dto.country) {
    //   updatedCountry =
    //     dto.country === 'USA' ? saddlecountry.USA : saddlecountry.EUROPE;
    // }

    return this.prisma.saddlesProduct.update({
      where: { id },
      data: {
        name: dto.name ?? product.name,
        price_usd: dto.price_usd ?? product.price_usd,
        price_eur: dto.price_eur ?? product.price_eur,
        stockQuantity: dto.stockQuantity ?? product.stockQuantity,
        // size: mappedSize ?? product.size, // Directly update size with enum value
        // country: updatedCountry ?? product.country, // Update country if provided
        images: { create: imageUrls.map((url) => ({ url })) }, // Upload images if provided
      },
    });
  }
}
