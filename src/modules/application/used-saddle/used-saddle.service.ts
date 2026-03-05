// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { Prisma } from '@prisma/client';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { UsedSaddleUploadService } from './used-saddle-upload.service';
// import { CreateUsedSaddleDto } from './dto/create-used-saddle.dto';
// import { UpdateUsedSaddleDto } from './dto/update-used-saddle.dto';
// import { TRIAL_PRICE_MAP } from './used-saddle.constants';

// @Injectable()
// export class UsedSaddleService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly upload: UsedSaddleUploadService,
//   ) {}

//   // 🔐 SKU
//   private generateSku(): string {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let out = '';
//     for (let i = 0; i < 6; i++) {
//       out += chars[Math.floor(Math.random() * chars.length)];
//     }
//     return `US-${out}`;
//   }

//   // 📊 Price range calculator
//   private calculatePriceRange(base: number) {
//     const prices = Object.values(TRIAL_PRICE_MAP).map((delta) => base + delta);

//     return {
//       min: Math.min(...prices),
//       max: Math.max(...prices),
//     };
//   }

//   // 🧾 Trial-wise prices (for UI)
//   private getTrialOptions(base: number) {
//     return Object.entries(TRIAL_PRICE_MAP).map(([trial, delta]) => ({
//       trialPeriod: trial,
//       price: base + delta,
//     }));
//   }

//   // ================= CREATE =================
//   async create(dto: CreateUsedSaddleDto) {
//     const sku = this.generateSku();

//     try {
//       return await this.prisma.usedSaddle.create({
//         data: {
//           sku,
//           title: dto.title,
//           description: dto.description,
//           seatSize: dto.seatSize,
//           category: dto.category,
//           usedsaddlecategory: dto.usedsaddlecategory,
//           basePrice: dto.basePrice,
//           isAvailable: true,
//         },
//       });
//     } catch (error: any) {
//       if (error instanceof Prisma.PrismaClientKnownRequestError) {
//         throw new BadRequestException(error.message);
//       }
//       throw new InternalServerErrorException('Failed to create used saddle');
//     }
//   }

//   // ================= FIND ALL =================
//   async findAll() {
//     const saddles = await this.prisma.usedSaddle.findMany({
//       select: {
//         id: true,
//         title: true,
//         basePrice: true,
//         images: {
//           take: 1,
//           select: {
//             url: true,
//           },
//         },
//       },
//       orderBy: { created_at: 'desc' },
//     });

//     return saddles.map((saddle) => ({
//       id: saddle.id,
//       title: saddle.title,
//       thumbnail: saddle.images[0]?.url || null,
//       priceRange: this.calculatePriceRange(saddle.basePrice),
//     }));
//   }

//   // ================= FIND ONE =================
//   async findOne(id: string) {
//     const saddle = await this.prisma.usedSaddle.findUnique({
//       where: { id },
//       include: { images: true },
//     });

//     if (!saddle) {
//       throw new NotFoundException('Used saddle not found');
//     }

//      const { basePrice, ...rest } = saddle;

//     return {
//       ...rest,
//       priceRange: this.calculatePriceRange(saddle.basePrice),
//       trialOptions: this.getTrialOptions(saddle.basePrice),
//     };
//   }

//   // ================= UPDATE =================
//   async update(id: string, dto: UpdateUsedSaddleDto) {
//     await this.findOne(id);

//     return this.prisma.usedSaddle.update({
//       where: { id },
//       data: dto,
//       include: { images: true },
//     });
//   }

//   // ================= ADD IMAGES =================
//   async addImages(id: string, urls: string[]) {
//     await this.findOne(id);

//     await this.prisma.usedSaddleImage.createMany({
//       data: urls.map((url) => ({
//         url,
//         UsedSaddleId: id,
//       })),
//     });

//     return { message: 'Images added successfully' };
//   }

//   // ================= DELETE IMAGE =================
//   async deleteImage(imageId: string) {
//     const image = await this.prisma.usedSaddleImage.findUnique({
//       where: { id: imageId },
//     });

//     if (!image) {
//       throw new NotFoundException('Image not found');
//     }

//     await this.upload.deleteOne(image.url);

//     await this.prisma.usedSaddleImage.delete({
//       where: { id: imageId },
//     });

//     return { message: 'Image deleted' };
//   }

//   // ================= DELETE =================
//   async remove(id: string) {
//     const saddle = await this.findOne(id);

//     for (const img of saddle.images) {
//       await this.upload.deleteOne(img.url);
//     }

//     await this.prisma.usedSaddleImage.deleteMany({
//       where: { UsedSaddleId: id },
//     });

//     await this.prisma.usedSaddle.delete({
//       where: { id },
//     });

//     return { message: 'Used saddle deleted' };
//   }
// }

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsedSaddleUploadService } from './used-saddle-upload.service';
import { CreateUsedSaddleDto } from './dto/create-used-saddle.dto';
import { UpdateUsedSaddleDto } from './dto/update-used-saddle.dto';
import { TRIAL_PRICE_MAP } from './used-saddle.constants';
import { resolveCurrencyFromCountry } from 'src/common/utils/currency.util';

@Injectable()
export class UsedSaddleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: UsedSaddleUploadService,
  ) {}

  private formatPriceRange(product: any, country?: string) {
    const currency = resolveCurrencyFromCountry(country);

    if (currency === 'USD') {
      return {
        priceRange: this.calculatePriceRange(product.basePrice_usd),
        currency: 'USD',
      };
    }

    return {
      priceRange: this.calculatePriceRange(product.basePrice_eur),
      currency: 'EUR',
    };
  }

  private generateSku(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let out = '';
    for (let i = 0; i < 6; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return `US-${out}`;
  }

  private calculatePriceRange(base: number) {
    const prices = Object.values(TRIAL_PRICE_MAP).map((delta) => base + delta);

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  // ================= CREATE =================
  async create(dto: CreateUsedSaddleDto) {
    try {
      return await this.prisma.usedSaddle.create({
        data: {
          sku: this.generateSku(),
          title: dto.title,
          description: dto.description,
          seatSize: dto.seatSize,
          stockQuantity: dto.stockQuantity,
          category: dto.category,
          usedsaddlecategory: dto.usedsaddlecategory,
          basePrice_usd: dto.basePrice_usd,
          basePrice_eur: dto.basePrice_eur,
          isAvailable: true,
        },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to create used saddle');
    }
  }

  // ================= FIND ALL =================

  async findAll(
    isAdmin: boolean,
    page: number,
    limit: number,
    country?: string,
  ) {
    const skip = (page - 1) * limit;

    if (isAdmin) {
      const [items, total] = await Promise.all([
        this.prisma.usedSaddle.findMany({
          include: { images: true },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.usedSaddle.count(),
      ]);

      return {
        data: items.map((saddle) => ({
          ...saddle,
          priceRange_usd: this.calculatePriceRange(saddle.basePrice_usd),
          priceRange_eur: this.calculatePriceRange(saddle.basePrice_eur),
        })),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.usedSaddle.findMany({
        select: {
          id: true,
          title: true,
          basePrice_usd: true,
          basePrice_eur: true,

          images: {
            take: 1,
            select: { url: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.usedSaddle.count(),
    ]);

    return {
      data: items.map((saddle) => ({
        id: saddle.id,
        title: saddle.title,
        image: saddle.images[0]?.url || null,
        ...this.formatPriceRange(saddle, country),
        // priceRange_usd: this.calculatePriceRange(saddle.basePrice_usd),
        // priceRange_eur: this.calculatePriceRange(saddle.basePrice_eur),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ================= FIND ONE =================
  async findOne(id: string, isAdmin: boolean, country?: string) {
    const saddle = await this.prisma.usedSaddle.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!saddle) {
      throw new NotFoundException('Used saddle not found');
    }

    if (isAdmin) {
      return {
        ...saddle,
        // priceRange_usd: this.calculatePriceRange(saddle.basePrice_usd),
        // priceRange_eur: this.calculatePriceRange(saddle.basePrice_eur),
        ...this.formatPriceRange(saddle, country),
      };
    }

    const { basePrice_usd, basePrice_eur, ...rest } = saddle;

    return {
      ...rest,
      ...this.formatPriceRange({ basePrice_usd, basePrice_eur }, country),
      // priceRange_usd: this.calculatePriceRange(basePrice_usd),
      // priceRange_eur: this.calculatePriceRange(basePrice_eur),
    };
  }

  // ================= UPDATE =================
  async update(id: string, dto: UpdateUsedSaddleDto) {
    return this.prisma.usedSaddle.update({
      where: { id },
      data: dto,
      include: { images: true },
    });
  }

  // ================= ADD IMAGES =================
  async addImages(id: string, urls: string[]) {
    await this.prisma.usedSaddleImage.createMany({
      data: urls.map((url) => ({
        url,
        UsedSaddleId: id,
      })),
    });
  }

  // ================= DELETE IMAGE =================
  async deleteImage(imageId: string) {
    const image = await this.prisma.usedSaddleImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.upload.deleteOne(image.url);

    await this.prisma.usedSaddleImage.delete({
      where: { id: imageId },
    });
  }

  // ================= DELETE =================
  async remove(id: string) {
    const saddle = await this.prisma.usedSaddle.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!saddle) {
      throw new NotFoundException('Used saddle not found');
    }

    for (const img of saddle.images) {
      await this.upload.deleteOne(img.url);
    }

    await this.prisma.usedSaddleImage.deleteMany({
      where: { UsedSaddleId: id },
    });

    await this.prisma.usedSaddle.delete({
      where: { id },
    });

    return { data: saddle };
  }
}
