import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class ProductService {
  
    constructor(private prisma: PrismaService) {}
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  async findAll(subcategoryId: string, category: Category) {
  return this.prisma.product.findMany({
    where: {
      subcategoryId,
      category, // directly compare with enum
    },
    include: {
      subcategory: true,
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}


  findOne(id: string) {
    const product = this.prisma.product.findUnique({
      where: { id: id },
      include: {  
        
        subcategory: true,
        images: true,
      },
    });
    return product;
    
  }



  // findOne(id: number) {
  //   return `This action returns a #${id} product`;
  // }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
