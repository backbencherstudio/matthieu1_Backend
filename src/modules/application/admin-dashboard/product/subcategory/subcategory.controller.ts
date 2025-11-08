import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { SubcategoryService } from './subcategory.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) { }

  @Post('create')
  create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.subcategoryService.create(createSubcategoryDto);
  }


  @Get('all-subcategory')
  async findAll() {
    try {
      const Subcategories = await this.subcategoryService.findAll();
      return {
        success: true,
        message: 'Subcategories fetched successfully',
        data: Subcategories.data.map(subcategories => ({
          id: subcategories.id,
          name: subcategories.name,
          categoryId: subcategories.categoryId,
          categoryName: subcategories.category.name,
          products: subcategories.products.length,
        })),
        
      };
    } catch (error) {
      return {
        success: false,
        message: 'Subcategory not found',
      };
    }
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubcategoryDto: UpdateSubcategoryDto) {
    return this.subcategoryService.update(id, updateSubcategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const removed = await this.subcategoryService.remove(id);
      return {
        success: true,
        message: `${removed.name} is deleted successfully.`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Subcategory not found',
      };
    }
  }
}
