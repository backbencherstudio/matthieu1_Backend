import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExpertsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateExpertDto) {
    return this.prisma.expert.create({ data });
  }

  findAll() {
    return this.prisma.expert.findMany();
  }

  async findOne(id: string) {
    const expert = await this.prisma.expert.findUnique({ where: { id } });
    if (!expert) throw new NotFoundException('Expert not found');
    return expert;
  }

  async update(id: string, data: UpdateExpertDto) {
    await this.findOne(id);
    return this.prisma.expert.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.expert.delete({ where: { id } });
  }
}
