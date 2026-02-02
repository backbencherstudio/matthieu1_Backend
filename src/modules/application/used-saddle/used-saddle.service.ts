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

@Injectable()
export class UsedSaddleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upload: UsedSaddleUploadService,
  ) {}

  // 🔐 SKU
  private generateSku(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let out = '';
    for (let i = 0; i < 6; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return `US-${out}`;
  }

  // 🧮 Price calculator
  private calculatePrice(base: number, trial: keyof typeof TRIAL_PRICE_MAP) {
    return base + TRIAL_PRICE_MAP[trial];
  }

  // ================= CREATE =================
  // async create(dto: CreateUsedSaddleDto) {
  //   const sku = this.generateSku();

  //   const finalPrice = this.calculatePrice(dto.basePrice, dto.trialPeriod);

  //   return this.prisma.usedSaddle.create({
  //     data: {
  //       sku,
  //       title: dto.title,
  //       description: dto.description,
  //       seatSize: dto.seatSize,
  //       category: dto.category,
  //       usedsaddlecategory: dto.usedsaddlecategory,
  //       basePrice: dto.basePrice,
  //       isAvailable: true,
  //     },
  //   });
  // }

  // ================= CREATE =================
  async create(dto: CreateUsedSaddleDto) {
    if (!dto) {
      throw new BadRequestException('Request body is missing');
    }

    // defensive check (extra safety)
    if (!dto.trialPeriod) {
      throw new BadRequestException('Trial period is required');
    }

    let finalPrice: number;

    try {
      finalPrice = this.calculatePrice(dto.basePrice, dto.trialPeriod);
    } catch (err) {
      throw new BadRequestException('Invalid trial period value');
    }

    const sku = this.generateSku();

    try {
      return await this.prisma.usedSaddle.create({
        data: {
          sku,
          title: dto.title,
          description: dto.description,
          seatSize: dto.seatSize,
          category: dto.category,
          usedsaddlecategory: dto.usedsaddlecategory,
          basePrice: finalPrice,
          isAvailable: true,
        },
      });
    } catch (error: any) {
      // Prisma known errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Duplicate value detected (SKU already exists)',
          );
        }
        // other known request errors can be treated as bad request
        throw new BadRequestException(error.message);
      }

      if (error?.name === 'PrismaClientValidationError') {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException('Failed to create used saddle.');
    }
  }

  // ================= FIND ALL =================
  async findAll() {
    try {
      return await this.prisma.usedSaddle.findMany({
        include: { images: true },
        orderBy: { created_at: 'desc' },
      });
    } catch (error: any) {
      if (error?.name === 'PrismaClientValidationError') {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to fetch used saddles');
    }
  }

  // ================= FIND ONE =================
  async findOne(id: string) {
    try {
      const saddle = await this.prisma.usedSaddle.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!saddle) {
        throw new NotFoundException('Used saddle not found');
      }

      return saddle;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error?.name === 'PrismaClientValidationError') {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to fetch used saddle');
    }
  }

  // ================= UPDATE =================
  async update(id: string, dto: UpdateUsedSaddleDto) {
    await this.findOne(id);

    try {
      return await this.prisma.usedSaddle.update({
        where: { id },
        data: dto,
        include: { images: true },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error?.name === 'PrismaClientValidationError') {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to update used saddle');
    }
  }

  // ================= ADD IMAGES =================
  async addImages(id: string, urls: string[]) {
    await this.findOne(id);

    try {
      await this.prisma.usedSaddleImage.createMany({
        data: urls.map((url) => ({
          url,
          UsedSaddleId: id,
        })),
      });

      return { message: 'Images added successfully' };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error?.name === 'PrismaClientValidationError') {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to add images');
    }
  }

  // ================= DELETE IMAGE =================
  async deleteImage(imageId: string) {
    try {
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

      return { message: 'Image deleted' };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error?.name === 'PrismaClientValidationError') {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to delete image');
    }
  }

  // ================= DELETE =================
  async remove(id: string) {
    try {
      const saddle = await this.findOne(id);

      for (const img of saddle.images) {
        await this.upload.deleteOne(img.url);
      }

      await this.prisma.usedSaddleImage.deleteMany({
        where: { UsedSaddleId: id },
      });

      await this.prisma.usedSaddle.delete({
        where: { id },
      });

      return { message: 'Used saddle deleted' };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error?.name === 'PrismaClientValidationError') {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to delete used saddle');
    }
  }
}
