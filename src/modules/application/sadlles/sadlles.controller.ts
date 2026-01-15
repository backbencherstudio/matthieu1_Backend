import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SadllesService } from './sadlles.service';
import { CreateSadlleDto } from './dto/create-sadlle.dto';
import { UpdateSadlleDto } from './dto/update-sadlle.dto';

@Controller('sadlles')
export class SadllesController {
  constructor(private readonly sadllesService: SadllesService) {}

  @Post()
  create(@Body() createSadlleDto: CreateSadlleDto) {
    return this.sadllesService.create(createSadlleDto);
  }

  @Get()
  findAll() {
    return this.sadllesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sadllesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSadlleDto: UpdateSadlleDto) {
    return this.sadllesService.update(+id, updateSadlleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sadllesService.remove(+id);
  }
}
