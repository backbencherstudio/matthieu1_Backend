import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubcategoryService {
  
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSubcategoryDto) {
    try {
      return await this.prisma.subcategory.create({
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation (name + categoryId)
        throw new BadRequestException('Subcategory already exists for this category');
      }
      throw error;
    }
  }

  async findAll() {
     const categories = await this.prisma.subcategory.findMany({
      });
      return {
        success: true,
        data: categories,
      };
  }

  findOne(id: number) {
    return `This action returns a #${id} subcategory`;
  }

  update(id: number, updateSubcategoryDto: UpdateSubcategoryDto) {
    return `This action updates a #${id} subcategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} subcategory`;
  }
}
