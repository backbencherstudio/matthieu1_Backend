import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMaincategoryDto } from './dto/create-maincategory.dto';
import { UpdateMaincategoryDto } from './dto/update-maincategory.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MaincategoryService {

  constructor(private prisma: PrismaService) { }

  //create maincategory

  async create(createMaincategoryDto: CreateMaincategoryDto) {
    const { name, type } = createMaincategoryDto;
    // Check if category already exists with same name and type
    const existing = await this.prisma.category.findFirst({
      where: { name, type },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('Maincategory already exists for this type');
    }

    try {
      return await this.prisma.category.create({
        data: createMaincategoryDto,
      });
    } catch (error) {
      // Handle unique constraint race condition (composite name+type)
      if (error?.code === 'P2002') {
        throw new BadRequestException('Maincategory already exists for this type');
      }
      throw error;
    }
  }

  //get all maincategories
  async findAll() {
    return await this.prisma.category.findMany();
  }



  //update maincategory
  async update(id: string, updateMaincategoryDto: UpdateMaincategoryDto) {
    return await this.prisma.category.update({
      where: { id },
      data: updateMaincategoryDto,
    });
  }

  //remove maincategory
  async remove(id: string) {
    return await this.prisma.category.delete({
      where: { id },
    });
  }
}
