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
import { TrySaddleService } from './try-saddle.service';
import { CreateTrySaddleDto } from './dto/create-try-saddle.dto';
import { UpdateTrySaddleDto } from './dto/update-try-saddle.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Role } from 'src/common/guard/role/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('try-saddle')
export class TrySaddleController {
  constructor(private readonly trySaddleService: TrySaddleService) {}

  @Roles(Role.USER)
  @Post()
  async create(@Body() createTrySaddleDto: CreateTrySaddleDto) {
    const data = await this.trySaddleService.create(createTrySaddleDto);

    return {
      success: true,
      message: 'Try saddle created successfully',
      data,
    };
  }

  @Roles(Role.ADMIN)
  @Get()
  async findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    const data = await this.trySaddleService.findAll(
      Number(page),
      Number(limit),
    );

    return {
      success: true,
      message: 'Try saddle list retrieved successfully',
      ...data,
    };
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.trySaddleService.findOne(id);

    return {
      success: true,
      message: 'Try saddle retrieved successfully',
      data,
    };
  }

  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateTrySaddleDto: UpdateTrySaddleDto,
  // ) {
  //   const data = await this.trySaddleService.update(id, updateTrySaddleDto);

  //   return {
  //     success: true,
  //     message: 'Try saddle updated successfully',
  //     data,
  //   };
  // }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.trySaddleService.remove(id);

    return {
      success: true,
      message: 'Try saddle deleted successfully',
      data,
    };
  }
}
