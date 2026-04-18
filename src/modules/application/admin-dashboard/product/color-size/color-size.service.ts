import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@Injectable()
export class ColorSizeService {
    constructor(private readonly prisma: PrismaService) { }

    // Color
    async createColor(dto: CreateColorDto) {
        return await this.prisma.color.create({ data: dto });
    }

    async findAllColors() {
        return await this.prisma.color.findMany({ orderBy: { createdAt: 'desc' } });
    }


    async removeColor(id: string) {
        return await this.prisma.color.delete({ where: { id } });
    }

    // Size
    async createSize(dto: CreateSizeDto) {
        return await this.prisma.size.create({ data: dto });
    }

    async findAllSizes() {
        return await this.prisma.size.findMany({ orderBy: { createdAt: 'desc' } });
    }


    async removeSize(id: string) {
        return await this.prisma.size.delete({ where: { id } });
    }
}
