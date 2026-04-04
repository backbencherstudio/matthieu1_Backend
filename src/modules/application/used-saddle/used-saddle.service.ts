// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { Prisma, saddlecountry } from '@prisma/client';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { UsedSaddleUploadService } from './used-saddle-upload.service';
// import { CreateUsedSaddleDto } from './dto/create-used-saddle.dto';
// import { UpdateUsedSaddleDto } from './dto/update-used-saddle.dto';
// import { TRIAL_PRICE_MAP } from './used-saddle.constants';
// import { resolveCurrencyFromCountry } from 'src/common/utils/currency.util';

// @Injectable()
// export class UsedSaddleService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly upload: UsedSaddleUploadService,
//   ) {}

//   private resolveRegion(country?: string): saddlecountry {
//     return country?.toUpperCase() === 'USA'
//       ? saddlecountry.USA
//       : saddlecountry.EUROPE;
//   }

//   private formatPriceRange(product: any, country?: string) {
//     const currency = resolveCurrencyFromCountry(country);

//     if (currency === 'USD') {
//       return {
//         priceRange: this.calculatePriceRange(product.basePrice_usd),
//         currency: 'USD',
//       };
//     }

//     return {
//       priceRange: this.calculatePriceRange(product.basePrice_eur),
//       currency: 'EUR',
//     };
//   }

//   private generateSku(): string {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let out = '';
//     for (let i = 0; i < 6; i++) {
//       out += chars[Math.floor(Math.random() * chars.length)];
//     }
//     return `US-${out}`;
//   }

//   private calculatePriceRange(base: number) {
//     const prices = Object.values(TRIAL_PRICE_MAP).map((delta) => base + delta);

//     return {
//       min: Math.min(...prices),
//       max: Math.max(...prices),
//     };
//   }

//   // ================= CREATE =================
//   async create(dto: CreateUsedSaddleDto) {
//     try {
//       return await this.prisma.usedSaddle.create({
//         data: {
//           sku: this.generateSku(),
//           title: dto.title,
//           description: dto.description,
//           seatSize: dto.seatSize,
//           country: dto.country,
//           stockQuantity: dto.stockQuantity,
//           category: dto.category,
//           usedsaddlecategory: dto.usedsaddlecategory,
//           basePrice_usd: dto.basePrice_usd,
//           basePrice_eur: dto.basePrice_eur,
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

//   async findAll(
//     isAdmin: boolean,
//     page: number,
//     limit: number,
//     country?: string,
//   ) {
//     const skip = (page - 1) * limit;

//     if (isAdmin) {
//       const [items, total] = await Promise.all([
//         this.prisma.usedSaddle.findMany({
//           where: {
//             country: this.resolveRegion(country),
//             isAvailable: true,
//           },
//           select: {
//             id: true,
//             title: true,
//             basePrice_usd: true,
//             basePrice_eur: true,
//             images: {
//               take: 1,
//               select: { url: true },
//             },
//           },
//           orderBy: { created_at: 'desc' },
//           skip,
//           take: limit,
//         }),
//         this.prisma.usedSaddle.count(),
//       ]);

//       return {
//         data: items.map((saddle) => ({
//           ...saddle,
//           priceRange_usd: this.calculatePriceRange(saddle.basePrice_usd),
//           priceRange_eur: this.calculatePriceRange(saddle.basePrice_eur),
//         })),
//         meta: {
//           page,
//           limit,
//           total,
//           totalPages: Math.ceil(total / limit),
//         },
//       };
//     }

//     const [items, total] = await Promise.all([
//       this.prisma.usedSaddle.findMany({
//         select: {
//           id: true,
//           title: true,
//           basePrice_usd: true,
//           basePrice_eur: true,

//           images: {
//             take: 1,
//             select: { url: true },
//           },
//         },
//         orderBy: { created_at: 'desc' },
//         skip,
//         take: limit,
//       }),
//       this.prisma.usedSaddle.count(),
//     ]);

//     return {
//       data: items.map((saddle) => ({
//         id: saddle.id,
//         title: saddle.title,
//         image: saddle.images[0]?.url || null,
//         ...this.formatPriceRange(saddle, country),
//         // priceRange_usd: this.calculatePriceRange(saddle.basePrice_usd),
//         // priceRange_eur: this.calculatePriceRange(saddle.basePrice_eur),
//       })),
//       meta: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   async findAllAdmin(page: number, limit: number) {
//     const skip = (page - 1) * limit;

//     const [items, total] = await Promise.all([
//       this.prisma.usedSaddle.findMany({
//         include: { images: true },
//         orderBy: { created_at: 'desc' },
//         skip,
//         take: limit,
//       }),
//       this.prisma.usedSaddle.count(),
//     ]);

//     return {
//       data: items,
//       meta: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   // ================= FIND ONE =================
//   async findOne(id: string, isAdmin: boolean, country?: string) {
//     const saddle = await this.prisma.usedSaddle.findUnique({
//       where: { id },
//       include: { images: true },
//     });

//     if (!saddle) {
//       throw new NotFoundException('Used saddle not found');
//     }

//     const region = this.resolveRegion(country);
//     if (!isAdmin && saddle.country !== region) {
//       throw new NotFoundException('Used saddle not available in your region');
//     }

//     if (isAdmin) {
//       return {
//         ...saddle,
//         // priceRange_usd: this.calculatePriceRange(saddle.basePrice_usd),
//         // priceRange_eur: this.calculatePriceRange(saddle.basePrice_eur),
//         ...this.formatPriceRange(saddle, country),
//       };
//     }

//     const { basePrice_usd, basePrice_eur, ...rest } = saddle;

//     return {
//       ...rest,
//       ...this.formatPriceRange({ basePrice_usd, basePrice_eur }, country),
//       // priceRange_usd: this.calculatePriceRange(basePrice_usd),
//       // priceRange_eur: this.calculatePriceRange(basePrice_eur),
//     };
//   }

//   async findOneAdmin(id: string) {
//     const saddle = await this.prisma.usedSaddle.findUnique({
//       where: { id },
//       include: { images: true },
//     });

//     if (!saddle) {
//       throw new NotFoundException('Used saddle not found');
//     }

//     return saddle;
//   }

//   // ================= UPDATE =================
//   async update(id: string, dto: UpdateUsedSaddleDto) {
//     return this.prisma.usedSaddle.update({
//       where: { id },
//       data: dto,
//       include: { images: true },
//     });
//   }

//   // ================= ADD IMAGES =================
//   async addImages(id: string, urls: string[]) {
//     await this.prisma.usedSaddleImage.createMany({
//       data: urls.map((url) => ({
//         url,
//         UsedSaddleId: id,
//       })),
//     });
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
//   }

//   // ================= DELETE =================
//   async remove(id: string) {
//     const saddle = await this.prisma.usedSaddle.findUnique({
//       where: { id },
//       include: { images: true },
//     });

//     if (!saddle) {
//       throw new NotFoundException('Used saddle not found');
//     }

//     for (const img of saddle.images) {
//       await this.upload.deleteOne(img.url);
//     }

//     await this.prisma.usedSaddleImage.deleteMany({
//       where: { UsedSaddleId: id },
//     });

//     await this.prisma.usedSaddle.delete({
//       where: { id },
//     });

//     return { data: saddle };
//   }
// }

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma, saddlecountry } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsedSaddleUploadService } from './used-saddle-upload.service';
import { CreateUsedSaddleDto } from './dto/create-used-saddle.dto';
import { UpdateUsedSaddleDto } from './dto/update-used-saddle.dto';
import { TRIAL_PRICE_MAP } from './used-saddle.constants';
import { resolveCurrencyFromCountry } from 'src/common/utils/currency.util';
import { resolveRegionFromCountry } from 'src/common/utils/region.util';

@Injectable()
export class UsedSaddleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: UsedSaddleUploadService,
  ) {}

  /* ------------------------------------------------ */
  /* REGION RESOLVE */
  /* ------------------------------------------------ */

  private resolveRegion(country?: string): saddlecountry {
    const region = resolveRegionFromCountry(country);
    return region === 'USA' ? saddlecountry.USA : saddlecountry.EUROPE;
  }

  /* ------------------------------------------------ */
  /* PRICE RANGE */
  /* ------------------------------------------------ */

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

  private calculatePriceRange(base: number) {
    const prices = Object.values(TRIAL_PRICE_MAP).map((delta) => base + delta);

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  /* ------------------------------------------------ */
  /* SKU GENERATOR */
  /* ------------------------------------------------ */

  private generateSku(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let out = '';

    for (let i = 0; i < 6; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }

    return `US-${out}`;
  }

  /* ------------------------------------------------ */
  /* CREATE */
  /* ------------------------------------------------ */

  async create(dto: CreateUsedSaddleDto) {
    try {
      return await this.prisma.usedSaddle.create({
        data: {
          sku: this.generateSku(),
          title: dto.title,
          description: dto.description,
          // discipline: dto.discipline,
          seatSize: dto.seatSize,
          country: dto.country,
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

  /* ------------------------------------------------ */
  /* FIND ALL (USER + ADMIN) */
  /* ------------------------------------------------ */

  async findAll(
    isAdmin: boolean,
    page: number,
    limit: number,
    country?: string,
  ) {
    const skip = (page - 1) * limit;
    const region = this.resolveRegion(country);

    if (isAdmin) {
      const [items, total] = await Promise.all([
        this.prisma.usedSaddle.findMany({
          where: {
            country: region,
            isAvailable: true,
          },
          include: { images: true },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.usedSaddle.count({
          where: {
            country: region,
            isAvailable: true,
          },
        }),
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
        where: {
          country: region,
          isAvailable: true,
        },
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
      this.prisma.usedSaddle.count({
        where: {
          country: region,
          isAvailable: true,
        },
      }),
    ]);

    return {
      data: items.map((saddle) => ({
        id: saddle.id,
        title: saddle.title,
        image: saddle.images[0]?.url || null,
        ...this.formatPriceRange(saddle, country),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /* ------------------------------------------------ */
  /* ADMIN FIND ALL */
  /* ------------------------------------------------ */

  async findAllAdmin(page: number, limit: number) {
    const skip = (page - 1) * limit;

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
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /* ------------------------------------------------ */
  /* FIND ONE */
  /* ------------------------------------------------ */

  async findOne(id: string, isAdmin: boolean, country?: string) {
    const saddle = await this.prisma.usedSaddle.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!saddle) {
      throw new NotFoundException('Used saddle not found');
    }

    const region = this.resolveRegion(country);

    if (!isAdmin && saddle.country !== region) {
      throw new NotFoundException('Used saddle not available in your region');
    }

    if (isAdmin) {
      return {
        ...saddle,
        ...this.formatPriceRange(saddle, country),
      };
    }

    const { basePrice_usd, basePrice_eur, ...rest } = saddle;

    return {
      ...rest,
      ...this.formatPriceRange({ basePrice_usd, basePrice_eur }, country),
    };
  }

  /* ------------------------------------------------ */
  /* ADMIN FIND ONE */
  /* ------------------------------------------------ */

  async findOneAdmin(id: string) {
    const saddle = await this.prisma.usedSaddle.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!saddle) {
      throw new NotFoundException('Used saddle not found');
    }

    return saddle;
  }

  /* ------------------------------------------------ */
  /* UPDATE */
  /* ------------------------------------------------ */

  async update(id: string, dto: UpdateUsedSaddleDto) {
    return this.prisma.usedSaddle.update({
      where: { id },
      data: dto,
      include: { images: true },
    });
  }

  /* ------------------------------------------------ */
  /* ADD IMAGES */
  /* ------------------------------------------------ */

  async addImages(id: string, urls: string[]) {
    await this.prisma.usedSaddleImage.createMany({
      data: urls.map((url) => ({
        url,
        UsedSaddleId: id,
      })),
    });
  }

  /* ------------------------------------------------ */
  /* DELETE IMAGE */
  /* ------------------------------------------------ */

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

  /* ------------------------------------------------ */
  /* DELETE PRODUCT */
  /* ------------------------------------------------ */

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
