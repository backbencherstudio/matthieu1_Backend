import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpertsService } from './experts.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';

@Controller('experts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpertsController {
  constructor(private readonly expertsService: ExpertsService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateExpertDto) {
    const data = await this.expertsService.create(dto);
    return {
      success: true,
      message: 'Expert created successfully',
      data,
    };
  }

  @Get()
  @Roles(Role.ADMIN,Role.USER)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.expertsService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
    return {
      success: true,
      message: 'Experts fetched successfully',
      data,
    };
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string) {
    const data = await this.expertsService.findOne(id);
    return {
      success: true,
      message: 'Expert fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateExpertDto) {
    const data = await this.expertsService.update(id, dto);
    return {
      success: true,
      message: 'Expert updated successfully',
      data,
    };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.expertsService.remove(id);
    return {
      success: true,
      message: 'Expert deleted successfully',
      data,
    };
  }

  @Get('country/:country')
  @Roles(Role.USER)
  async findByCountry(@Param('country') country: string) {
    const data = await this.expertsService.findByCountry(country);
    return {
      success: true,
      message: 'Experts fetched successfully',
      data,
    };
  }
}
