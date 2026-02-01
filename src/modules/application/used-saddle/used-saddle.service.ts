import { Injectable, NotFoundException } from '@nestjs/common';
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
  async create(dto: CreateUsedSaddleDto) {
    const sku = this.generateSku();

    const finalPrice = this.calculatePrice(dto.basePrice, dto.trialPeriod);

    return this.prisma.usedSaddle.create({
      data: {
        sku,
        title: dto.title,
        description: dto.description,
        seatSize: dto.seatSize,
        category: dto.category,
        usedsaddlecategory: dto.usedsaddlecategory,
        basePrice: dto.basePrice,
        trialPeriod: dto.trialPeriod,
      },
    });
  }

  // ================= FIND ALL =================
  async findAll() {
    return this.prisma.usedSaddle.findMany({
      include: { images: true },
      orderBy: { created_at: 'desc' },
    });
  }

  // ================= FIND ONE =================
  async findOne(id: string) {
    const saddle = await this.prisma.usedSaddle.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!saddle) {
      throw new NotFoundException('Used saddle not found');
    }

    return saddle;
  }

  // ================= UPDATE =================
  async update(id: string, dto: UpdateUsedSaddleDto) {
    await this.findOne(id);

    return this.prisma.usedSaddle.update({
      where: { id },
      data: dto,
      include: { images: true },
    });
  }

  // ================= ADD IMAGES =================
  async addImages(id: string, urls: string[]) {
    await this.findOne(id);

    await this.prisma.usedSaddleImage.createMany({
      data: urls.map((url) => ({
        url,
        UsedSaddleId: id,
      })),
    });

    return { message: 'Images added successfully' };
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

    return { message: 'Image deleted' };
  }

  // ================= DELETE =================
  async remove(id: string) {
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
  }
}
