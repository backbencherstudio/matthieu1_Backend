import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubcategoryService {

  constructor(private prisma: PrismaService) { }
  async create(data: CreateSubcategoryDto) {
    // Validate categoryId exists
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new BadRequestException('Invalid categoryId');
    }

    try {
      return await this.prisma.subcategory.create({
        data: {
          name: data.name,
          categoryId: data.categoryId,
        },
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new BadRequestException('Subcategory already exists for this category');
      }
      if (error?.code === 'P2003') {
        // Foreign key constraint failed
        throw new BadRequestException('Invalid categoryId');
      }
      throw error;
    }
  }

  async findAll() {
    const subcategories = await this.prisma.subcategory.findMany({
      include: {
        category: {
          select: { name: true },
        },
        products: {
          select: { id: true },
        },
      },
    });
    return {
      success: true,
      data: subcategories,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} subcategory`;
  }

  async update(id: string, updateSubcategoryDto: UpdateSubcategoryDto) {
    // Validate categoryId if provided
    if (updateSubcategoryDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateSubcategoryDto.categoryId },
        select: { id: true },
      });
      if (!category) {
        throw new BadRequestException('Invalid categoryId');
      }
    }

    try {
      return await this.prisma.subcategory.update({
        where: { id },
        data: updateSubcategoryDto,
      });
    } catch (error) {
      if (error?.code === 'P2003') {
        throw new BadRequestException('Invalid categoryId');
      }
      if (error?.code === 'P2002') {
        throw new BadRequestException('Subcategory already exists for this category');
      }
      throw error;
    }
  }

  async remove(id: string) {
    return await this.prisma.subcategory.delete({
      where: { id },
    });
  }
}
