import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SavedProductService } from './saved-product.service';
import { CreateSavedProductDto } from './dto/create-saved-product.dto';
import { UpdateSavedProductDto } from './dto/update-saved-product.dto';

@Controller('saved-product')
export class SavedProductController {
  constructor(private readonly savedProductService: SavedProductService) {}

  @Post()
  create(@Body() createSavedProductDto: CreateSavedProductDto) {
    return this.savedProductService.create(createSavedProductDto);
  }

  @Get()
  findAll() {
    return this.savedProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savedProductService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSavedProductDto: UpdateSavedProductDto) {
    return this.savedProductService.update(+id, updateSavedProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savedProductService.remove(+id);
  }
}
