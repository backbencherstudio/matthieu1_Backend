import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SadllesService } from './sadlles.service';
import { CreateSadlleDto } from './dto/create-sadlle.dto';
import { UpdateSadlleDto } from './dto/update-sadlle.dto';
import { SaddleUploadService } from './saddle-upload.service';
import { saddleSubcategory } from '@prisma/client';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@Controller('sadlles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SadllesController {
  constructor(
    private readonly sadllesService: SadllesService,
    private readonly saddleUploadService: SaddleUploadService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @Body() body: CreateSadlleDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const saddle = await this.sadllesService.create(body);

    if (files?.length) {
      const urls = await this.saddleUploadService.uploadMany(
        'saddles/images',
        files,
      );

      await this.sadllesService.addImages(saddle.id, urls);
    }

    return saddle;
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSadlleDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const saddle = await this.sadllesService.update(id, body);

    if (files?.length) {
      const urls = await this.saddleUploadService.uploadMany(
        'saddles/images',
        files,
      );

      await this.sadllesService.addImages(id, urls);
    }

    return saddle;
  }

  @Get()
  @Roles(Role.USER)
  findAll(@Query('subcategory') subcategory?: saddleSubcategory) {
    return this.sadllesService.findAll(subcategory);
  }

  @Get(':id')
  @Roles(Role.USER)
  findOne(@Param('id') id: string) {
    return this.sadllesService.findOne(id);
  }
}
