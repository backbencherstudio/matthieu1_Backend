import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
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
  constructor(private readonly saddleAlertService: SaddleAlertService) { }


  @Roles(Role.USER)
  @Post()
  create(@Body() createSaddleAlertDto: CreateSaddleAlertDto) {
    return this.saddleAlertService.create(createSaddleAlertDto);
  }


  @Roles(Role.ADMIN)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.saddleAlertService.findAllAlerts(pageNum, limitNum, search);
  }



  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saddleAlertService.findOneAlert(id);
  }




  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.saddleAlertService.remove(id);
  }
}
