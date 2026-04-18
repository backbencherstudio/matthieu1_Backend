import { Injectable, BadRequestException } from '@nestjs/common';
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
        // ✅ Validation: Only allow 'black' and 'brown' colors
        const allowedColors = ['black', 'brown'];
        const normalizedName = dto.name.toLowerCase().trim();

        if (!allowedColors.includes(normalizedName)) {
            throw new BadRequestException(
                `Only 'black' and 'brown' colors are allowed. You provided: '${dto.name}'`
            );
        }

        // ✅ Check if color already exists
        const existingColor = await this.prisma.color.findFirst({
            where: {
                name: {
                    equals: normalizedName,
                    mode: 'insensitive'
                }
            }
        });

        if (existingColor) {
            throw new BadRequestException(
                `Color '${normalizedName}' already exists`
            );
        }

        // ✅ Validation: Maximum 2 colors allowed
        const colorCount = await this.prisma.color.count();
        if (colorCount >= 2) {
            throw new BadRequestException(
                `Maximum 2 colors allowed. Currently have ${colorCount} colors.`
            );
        }

        // ✅ Create color with normalized name
        return await this.prisma.color.create({
            data: {
                name: normalizedName
            }
        });
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
