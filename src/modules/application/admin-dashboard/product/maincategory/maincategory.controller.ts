import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MaincategoryService } from './maincategory.service';
import { CreateMaincategoryDto } from './dto/create-maincategory.dto';
import { UpdateMaincategoryDto } from './dto/update-maincategory.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';


@Controller('maincategory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MaincategoryController {
  constructor(private readonly maincategoryService: MaincategoryService) { }

  //create maincategory
  @Post()
  create(@Body() createMaincategoryDto: CreateMaincategoryDto) {
    return this.maincategoryService.create(createMaincategoryDto);
  }

  @Get()
  async findAll() {
    const maincategories = await this.maincategoryService.findAll();
    return {
      data: maincategories.map(categories => ({ id: categories.id, name: categories.name, type: categories.type }))
    };
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMaincategoryDto: UpdateMaincategoryDto) {
    return this.maincategoryService.update(id, updateMaincategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
    const removed = await this.maincategoryService.remove(id);
    return {
      success: true,
      message: `${removed.name} is deleted successfully.`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Maincategory not found',
    };
  }
}
}
