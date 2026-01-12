import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ExpertsService } from './experts.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';

@Controller('experts')
export class ExpertsController {
  constructor(private readonly expertsService: ExpertsService) {}

  @Post()
  create(@Body() dto: CreateExpertDto) {
    return this.expertsService.create(dto);
  }

  @Get()
  findAll() {
    return this.expertsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpertDto) {
    return this.expertsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expertsService.remove(id);
  }
}
