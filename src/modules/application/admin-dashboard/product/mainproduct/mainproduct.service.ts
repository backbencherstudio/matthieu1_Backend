import { Injectable } from '@nestjs/common';
import { CreateMainproductDto } from './dto/create-mainproduct.dto';
import { UpdateMainproductDto } from './dto/update-mainproduct.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MainproductService {
  constructor(private prisma: PrismaService) {}

async createProduct(
  createMainproductDto: CreateMainproductDto,
  images: Express.Multer.File[],
  user_id: string
) {
  return this.prisma.product.create({
    data: {
      name: createMainproductDto.name,
      sku: createMainproductDto.sku,
      stockQuantity: Number(createMainproductDto.stockQuantity), // convert to Int
      benefits: createMainproductDto.benefits,
      description: createMainproductDto.description,
      leatherCareGuide: createMainproductDto.leatherCareGuide,
      price: Number(createMainproductDto.price), // convert to Float/Int
      discountPrice: Number(createMainproductDto.discountPrice), // convert to Float/Int
      color: createMainproductDto.color,
      size: createMainproductDto.size,
      //category: { connect: { id: createMainproductDto.categoryId } },
      category: createMainproductDto.category, 
      subcategory: { connect: { id: createMainproductDto.subcategoryId } },

      images: images?.length
        ? {
            create: images.map((file) => ({
              url: file.originalname, // replace with actual upload path or cloud URL
            })),
          }
        : undefined,
    },
    include: {
      
      subcategory: true,
      images: true,
    },
  });
}

  findAll() {
    return `This action returns all mainproduct`;
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

  update(id: number, updateMainproductDto: UpdateMainproductDto) {
    return `This action updates a #${id} mainproduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} mainproduct`;
  }
}
