import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '@prisma/client';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

//  @Get('categorysubcategoryproduct')
//   async findAll(
//     @Query('subcategoryId') subcategoryId: string,
//     @Query('category') category: string,
//   ) {
//     // convert string to enum
//     if (!Object.values(Category).includes(category as unknown as Category)) {
//       throw new Error(`Invalid category: ${category}`);
//     }

//     return this.productService.findAll(
//       subcategoryId,
//       category as Category,
//     );
//   }


   @Get('oneproduct/:id')
   async findOne(@Param('id') id: string) {
    try{
     const oneproduct = await this.productService.findOne(id);
      return oneproduct;
    }
    catch(error){
      console.error("Error fetching product:", error);
      throw error;
    }
    
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
