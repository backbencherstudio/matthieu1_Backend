import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SaddleAlertService } from './saddle-alert.service';
import { CreateSaddleAlertDto } from './dto/create-saddle-alert.dto';
import { UpdateSaddleAlertDto } from './dto/update-saddle-alert.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
@Controller('saddle-alert')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SaddleAlertController {
  constructor(private readonly saddleAlertService: SaddleAlertService) {}

  @Roles(Role.USER)
  @Post()
  async create(@Body() createSaddleAlertDto: CreateSaddleAlertDto) {
    const data = await this.saddleAlertService.create(createSaddleAlertDto);
    return {
      success: true,
      message: 'Saddle alert created successfully',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const data = await this.saddleAlertService.findAllAlerts(
      pageNum,
      limitNum,
      search,
    );
    return {
      success: true,
      message: 'Saddle alerts fetched successfully',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.saddleAlertService.findOneAlert(id);
    return {
      success: true,
      message: 'Saddle alert fetched successfully',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.saddleAlertService.remove(id);
    return {
      success: true,
      message: 'Saddle alert deleted successfully',
      data,
    };
  }
}
