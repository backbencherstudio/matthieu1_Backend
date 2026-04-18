import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSadlleDto } from './dto/create-sadlle.dto';
import { UpdateSadlleDto } from './dto/update-sadlle.dto';
import { productcategory, saddleSubcategory } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaddleUploadService } from './saddle-upload.service';

@Injectable()
export class SadllesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: SaddleUploadService,
  ) {}

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

  // ================= CREATE =================
  // async create(dto: CreateSadlleDto) {
  //   if (dto.category && dto.category !== productcategory.SADDLES) {
  //     throw new BadRequestException('Category must be SADDLES');
  //   }

  //   const count = await this.prisma.saddlesProduct.count({
  //     where: { subcategory: dto.subcategory },
  //   });

  //   if (count >= 4) {
  //     throw new BadRequestException(
  //       `Each subcategory can have less than 4 products. (${dto.subcategory}) limit reached.`,
  //     );
  //   }

  //   const sku = await this.generateUniqueSku();

  //   return this.prisma.saddlesProduct.create({
  //     data: {
  //       name: dto.name,
  //       sku,
  //       header_title: dto.header_title,
  //       header_description: dto.header_description,
  //       price: dto.price,
  //       description: dto.description,
  //       colors: dto.colors ?? [],
  //       piping_color: dto.piping_color ?? [],
  //       leather_type: dto.leather_type ?? [],
  //       category: productcategory.SADDLES,
  //       subcategory: dto.subcategory,
  //     },
  //   });
  // }

  async create(dto: CreateSadlleDto) {
    // ================= LEADLINE =================
    if (dto.category === productcategory.LEADLINE) {
      // only one leadline product
      const existing = await this.prisma.saddlesProduct.count({
        where: { category: productcategory.LEADLINE },
      });

      if (existing >= 1) {
        throw new BadRequestException('Only one LEADLINE product is allowed');
      }

      if (
        dto.subcategory ||
        dto.colors?.length ||
        dto.piping_color?.length ||
        dto.leather_type?.length ||
        dto.header_title ||
        dto.header_description ||
        dto.description
      ) {
        throw new BadRequestException(
          'LEADLINE product supports only name, price, sizes and images',
        );
      }
    }

    // ================= SADDLES =================
    if (dto.category === productcategory.SADDLES) {
      if (!dto.subcategory) {
        throw new BadRequestException('Subcategory is required for SADDLES');
      }

      const count = await this.prisma.saddlesProduct.count({
        where: { subcategory: dto.subcategory },
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
        price: dto.price,

        // ✅ ARRAY sizes (Leadline only)
        sizes:
          dto.category === productcategory.LEADLINE ? (dto.sizes ?? []) : [],

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

  // ================= FIND ALL =================
  // async findAll(subcategory?: saddleSubcategory) {
  //   if (subcategory) {
  //     const products = await this.prisma.saddlesProduct.findMany({
  //       where: { subcategory },
  //       select: {
  //         id: true,
  //         name: true,
  //         price: true,
  //         images: {
  //           take: 1,
  //           select: { url: true },
  //         },
  //       },
  //     });

  //     if (products.length === 0) return 'Comming Soon';

  //     return products.map((p) => ({
  //       id: p.id,
  //       name: p.name,
  //       image: p.images[0]?.url || null,
  //       price: p.price,
  //     }));
  //   }

  //   const products = await this.prisma.saddlesProduct.findMany({
  //     select: {
  //       id: true,
  //       name: true,
  //       subcategory: true,
  //       price: true,
  //       images: {
  //         take: 1,
  //         select: { url: true },
  //       },
  //     },
  //   });

  //   const grouped: Record<saddleSubcategory, any[] | string> = {
  //     ARION: 'Comming Soon',
  //     ATLAS: 'Comming Soon',
  //     ATHENA: 'Comming Soon',
  //   };

  //   for (const product of products) {
  //     if (grouped[product.subcategory] === 'Comming Soon') {
  //       grouped[product.subcategory] = [];
  //     }

  //     (grouped[product.subcategory] as any[]).push({
  //       id: product.id,
  //       name: product.name,
  //       image: product.images[0]?.url || null,
  //       price: product.price,
  //     });
  //   }

  //   return grouped;
  // }

  // ================= FIND ALL SADDLES =================
  async findAll(subcategory?: saddleSubcategory) {
    const baseWhere = {
      category: productcategory.SADDLES,
    };

    // -------- Filtered by subcategory --------
    if (subcategory) {
      const products = await this.prisma.saddlesProduct.findMany({
        where: {
          ...baseWhere,
          subcategory,
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: {
            take: 1,
            select: { url: true },
          },
        },
      });

      if (products.length === 0) return 'Comming Soon';

      return products.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.images[0]?.url || null,
        price: p.price,
      }));
    }

    // -------- Grouped --------
    const products = await this.prisma.saddlesProduct.findMany({
      where: baseWhere,
      select: {
        id: true,
        name: true,
        subcategory: true,
        price: true,
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
        price: product.price,
      });
    }

    return grouped;
  }

  // ================= FIND ONE =================
  // async findOne(id: string) {
  //   const product = await this.prisma.saddlesProduct.findUnique({
  //     where: { id },
  //     include: { images: true },
  //   });

  //   if (!product) {
  //     throw new NotFoundException('Saddle product not found');
  //   }

  //   return product;
  // }

  // ================= FIND ONE SADDLE =================
  async findOne(id: string) {
    const product = await this.prisma.saddlesProduct.findFirst({
      where: {
        id,
        category: productcategory.SADDLES,
      },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Saddle product not found');
    }

    return product;
  }

  // ================= GET LEADLINE PRODUCT =================
  async getLeadlineProduct() {
    const product = await this.prisma.saddlesProduct.findFirst({
      where: {
        category: productcategory.LEADLINE,
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
      price: product.price,
      size: product.sizes,
      images: product.images,
    };
  }

  // ================= UPDATE =================
  // async update(id: string, dto: UpdateSadlleDto) {
  //   const product = await this.prisma.saddlesProduct.findUnique({
  //     where: { id },
  //   });

  //   if (!product) {
  //     throw new NotFoundException('Saddle product not found');
  //   }

  //   return this.prisma.saddlesProduct.update({
  //     where: { id },
  //     data: {
  //       name: dto.name ?? product.name,
  //       header_title: dto.header_title ?? product.header_title,
  //       header_description:
  //         dto.header_description ?? product.header_description,
  //       price: dto.price ?? product.price,
  //       description: dto.description ?? product.description,
  //       colors: dto.colors ?? product.colors,
  //       piping_color: dto.piping_color ?? product.piping_color,
  //       leather_type: dto.leather_type ?? product.leather_type,
  //     },
  //     include: { images: true },
  //   });
  // }

  async update(id: string, dto: UpdateSadlleDto) {
    const product = await this.prisma.saddlesProduct.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException('Saddle product not found');
    }

    // ================= LEADLINE =================
    if (product.category === productcategory.LEADLINE) {
      // ❌ block forbidden fields
      if (
        dto.colors?.length ||
        dto.piping_color?.length ||
        dto.leather_type?.length ||
        dto.header_title ||
        dto.header_description ||
        dto.description ||
        (dto as any).subcategory
      ) {
        throw new BadRequestException(
          'LEADLINE product supports only name, price, sizes and images',
        );
      }

      return this.prisma.saddlesProduct.update({
        where: { id },
        data: {
          name: dto.name ?? product.name,
          price: dto.price ?? product.price,

          // ✅ ARRAY update
          sizes: dto.sizes ?? product.sizes,
        },
        include: { images: true },
      });
    }

    // ================= SADDLES =================
    return this.prisma.saddlesProduct.update({
      where: { id },
      data: {
        name: dto.name ?? product.name,
        header_title: dto.header_title ?? product.header_title,
        header_description:
          dto.header_description ?? product.header_description,
        price: dto.price ?? product.price,
        description: dto.description ?? product.description,

        colors: dto.colors ?? product.colors,
        piping_color: dto.piping_color ?? product.piping_color,
        leather_type: dto.leather_type ?? product.leather_type,

        // ❌ subcategory intentionally NOT updated
      },
      include: { images: true },
    });
  }

  // ================= ADD IMAGES =================
  async addImages(saddleId: string, urls: string[]) {
    await this.prisma.saddleProductImage.createMany({
      data: urls.map((url) => ({
        url,
        SaddlesProductId: saddleId,
      })),
    });
    return { message: 'Images added successfully' };
  }

  // ================= DELETE PRODUCT =================
  async delete(id: string) {
    const product = await this.prisma.saddlesProduct.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException('Saddle product not found');
    }

    // 🔥 DELETE FILES FROM STORAGE
    for (const image of product.images) {
      await this.uploadService.deleteOne(image.url);
    }

    // 🔥 DELETE DB RECORDS
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

  // ================= DELETE IMAGE =================
  async deleteImage(imageId: string) {
    const image = await this.prisma.saddleProductImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    // 🔥 DELETE FILE FROM STORAGE
    await this.uploadService.deleteOne(image.url);

    // 🔥 DELETE DB RECORD
    await this.prisma.saddleProductImage.delete({
      where: { id: imageId },
    });

    return {
      message: 'Image deleted successfully',
      data: image.url,
    };
  }
}
