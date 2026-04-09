import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTrySaddleDto } from './dto/create-try-saddle.dto';
import { UpdateTrySaddleDto } from './dto/update-try-saddle.dto';

@Injectable()
export class TrySaddleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTrySaddleDto: CreateTrySaddleDto) {
    return await this.prisma.try_saddles.create({
      data: createTrySaddleDto,
    });
  }

async findAll(page = 1, limit = 10) {
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, Math.min(100, limit));
  const skip = (validPage - 1) * validLimit;

  const [data, total] = await Promise.all([
    this.prisma.try_saddles.findMany({
      skip,
      take: validLimit,
      orderBy: {
        created_at: 'desc',
      },
    }),
    this.prisma.try_saddles.count(),
  ]);

  return {
    data,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPage: Math.ceil(total / validLimit),
    },
  };
}

  async findOne(id: string) {
    const trySaddle = await this.prisma.try_saddles.findUnique({
      where: { id },
    });

    if (!trySaddle) {
      throw new NotFoundException('Try saddle not found');
    }

    return trySaddle;
  }

  // async update(id: string, updateTrySaddleDto: UpdateTrySaddleDto) {
  //   const existingTrySaddle = await this.prisma.try_saddles.findUnique({
  //     where: { id },
  //   });

  //   if (!existingTrySaddle) {
  //     throw new NotFoundException('Try saddle not found');
  //   }

  //   return await this.prisma.try_saddles.update({
  //     where: { id },
  //     data: updateTrySaddleDto,
  //   });
  // }

  async remove(id: string) {
    const existingTrySaddle = await this.prisma.try_saddles.findUnique({
      where: { id },
    });

    if (!existingTrySaddle) {
      throw new NotFoundException('Try saddle not found');
    }

    return await this.prisma.try_saddles.delete({
      where: { id },
    });
  }
}