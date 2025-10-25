import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateSavedProductDto } from './dto/create-saved-product.dto';
import { UpdateSavedProductDto } from './dto/update-saved-product.dto';
import { SavedBaseProductService } from './saved-product.service';

@Controller('saved-base-product')
export class SavedBaseProductController {
  constructor(private readonly savedBaseProductService: SavedBaseProductService) {}

  @Post()
  create(@Body() createSavedProductDto: CreateSavedProductDto) {
    return this.savedBaseProductService.create(createSavedProductDto);
  }

  @Get()
  findAll() {
    return this.savedBaseProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savedBaseProductService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSavedProductDto: UpdateSavedProductDto) {
    return this.savedBaseProductService.update(+id, updateSavedProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savedBaseProductService.remove(+id);
  }
}
