// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { CreateSadlleDto } from './dto/create-sadlle.dto';
// import { UpdateSadlleDto } from './dto/update-sadlle.dto';
// import { productcategory, saddleSubcategory } from '@prisma/client';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class SadllesService {
//   constructor(private readonly prisma: PrismaService) {}

//   private generateSku(): string {
//     const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let result = '';
//     for (let i = 0; i < 5; i++) {
//       result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
//     }
//     return `SD${result}`; // e.g. SD7D2NS
//   }

//   private async generateUniqueSku(): Promise<string> {
//     let sku: string;
//     let exists = true;

//     while (exists) {
//       sku = this.generateSku();

//       const found = await this.prisma.saddlesProduct.findUnique({
//         where: { sku },
//       });

//       exists = !!found;
//     }

//     return sku!;
//   }

//   async create(dto: CreateSadlleDto) {
//     // Enforce category
//     if (dto.category && dto.category !== productcategory.SADDLES) {
//       throw new BadRequestException('Category must be SADDLES');
//     }

//     // Count products for this subcategory
//     const count = await this.prisma.saddlesProduct.count({
//       where: {
//         subcategory: dto.subcategory,
//       },
//     });

//     // Enforce LESS THAN 4
//     if (count >= 4) {
//       throw new BadRequestException(
//         `Each subcategory can have less than 4 products. (${dto.subcategory}) limit reached.`,
//       );
//     }

//     // ALWAYS auto-generate a unique SKU at create time
//     const sku = await this.generateUniqueSku();

//     // Create product
//     return this.prisma.saddlesProduct.create({
//       data: {
//         name: dto.name,
//         sku: sku,
//         header_title: dto.header_title,
//         header_description: dto.header_description,
//         price: dto.price,
//         description: dto.description,
//         colors: dto.colors ?? [],
//         piping_color: dto.piping_color ?? [],
//         leather_type: dto.leather_type ?? [],
//         category: productcategory.SADDLES,
//         subcategory: dto.subcategory,
//       },
//     });
//   }

//   async findAll(subcategory?: saddleSubcategory) {
//     // CASE 1: Filtered → flat list
//     if (subcategory) {
//       const products = await this.prisma.saddlesProduct.findMany({
//         // where: { subcategory },
//         // include: { images: true },
//         where: { subcategory },
//         select: {
//           id: true,
//           name: true,
//           price: true,
//           images: {
//             take: 1,
//             select: {
//               url: true,
//             },
//           },
//         },
//       });

//       // 🔥 NEW PART
//       if (products.length === 0) {
//         return 'Comming Soon';
//       }

//       return products.map((p) => ({
//         id: p.id,
//         name: p.name,
//         image: p.images[0]?.url || null,
//         price: p.price,
//       }));
//     }

//     // CASE 2: Not filtered → grouped, "Comming Soon" if empty
//     const products = await this.prisma.saddlesProduct.findMany({
//       // include: { images: true },
//       select: {
//         id: true,
//         name: true,
//         subcategory: true,
//         price: true,
//         images: {
//           take: 1,
//           select: {
//             url: true,
//           },
//         },
//       },
//     });

//     const grouped: Record<saddleSubcategory, any[] | string> = {
//       ARION: 'Comming Soon',
//       ATLAS: 'Comming Soon',
//       ATHENA: 'Comming Soon',
//     };


//     for (const product of products) {
//       if (grouped[product.subcategory] === 'Comming Soon') {
//         grouped[product.subcategory] = [];
//       }

//       (grouped[product.subcategory] as any[]).push({
//         id: product.id,
//         name: product.name,
//         image: product.images[0]?.url || null,
//         price: product.price,
//       });
//     }

//     return grouped;
//   }

//   async findOne(id: string) {
//     const product = await this.prisma.saddlesProduct.findUnique({
//       where: { id },
//       include: { images: true },
//     });

//     if (!product) {
//       throw new NotFoundException('Saddle product not found');
//     }

//     return product;
//   }

//   // -------- UPDATE --------
//   async update(id: string, dto: UpdateSadlleDto) {
//     const product = await this.prisma.saddlesProduct.findUnique({
//       where: { id },
//     });

//     if (!product) {
//       throw new NotFoundException('Saddle product not found');
//     }

//     if (dto.category && dto.category !== productcategory.SADDLES) {
//       throw new BadRequestException('Category cannot be changed');
//     }

//     return this.prisma.saddlesProduct.update({
//       where: { id },
//       data: {
//         name: dto.name,
//         header_title: dto.header_title,
//         header_description: dto.header_description,
//         price: dto.price,
//         description: dto.description,
//         colors: dto.colors ?? [],
//         piping_color: dto.piping_color ?? [],
//         leather_type: dto.leather_type ?? [],
//         subcategory: dto.subcategory,
//       },
//     });
//   }

//   // -------- IMAGES --------
//   async addImages(saddleId: string, urls: string[]) {
//     const saddle = await this.prisma.saddlesProduct.findUnique({
//       where: { id: saddleId },
//     });

//     if (!saddle) {
//       throw new NotFoundException('Saddle product not found');
//     }

//     await this.prisma.saddleProductImage.createMany({
//       data: urls.map((url) => ({
//         url,
//         SaddlesProductId: saddleId,
//       })),
//     });
//   }
// }


import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSadlleDto } from './dto/create-sadlle.dto';
import { UpdateSadlleDto } from './dto/update-sadlle.dto';
import { productcategory, saddleSubcategory } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SadllesService {
  constructor(private readonly prisma: PrismaService) {}

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
  async create(dto: CreateSadlleDto) {
    if (dto.category && dto.category !== productcategory.SADDLES) {
      throw new BadRequestException('Category must be SADDLES');
    }

    const count = await this.prisma.saddlesProduct.count({
      where: { subcategory: dto.subcategory },
    });

    if (count >= 4) {
      throw new BadRequestException(
        `Each subcategory can have less than 4 products. (${dto.subcategory}) limit reached.`,
      );
    }

    const sku = await this.generateUniqueSku();

    return this.prisma.saddlesProduct.create({
      data: {
        name: dto.name,
        sku,
        header_title: dto.header_title,
        header_description: dto.header_description,
        price: dto.price,
        description: dto.description,
        colors: dto.colors ?? [],
        piping_color: dto.piping_color ?? [],
        leather_type: dto.leather_type ?? [],
        category: productcategory.SADDLES,
        subcategory: dto.subcategory,
      },
    });
  }

  // ================= FIND ALL =================
  async findAll(subcategory?: saddleSubcategory) {
    if (subcategory) {
      const products = await this.prisma.saddlesProduct.findMany({
        where: { subcategory },
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

    const products = await this.prisma.saddlesProduct.findMany({
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
  async findOne(id: string) {
    const product = await this.prisma.saddlesProduct.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException('Saddle product not found');
    }

    return product;
  }

  // ================= UPDATE =================
  async update(id: string, dto: UpdateSadlleDto) {
    const product = await this.prisma.saddlesProduct.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Saddle product not found');
    }

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
      },
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
  }

  // ================= DELETE IMAGE =================
  async deleteImage(imageId: string) {
    const image = await this.prisma.saddleProductImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.saddleProductImage.delete({
      where: { id: imageId },
    });
  }
}

