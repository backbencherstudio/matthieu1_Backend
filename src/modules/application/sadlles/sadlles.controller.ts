import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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

  // ================= CREATE =================
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

    return {
      success: true,
      message: 'Product created successfully',
      data: saddle,
    };
  }

  // ================= UPDATE =================
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

    return {
      success: true,
      message: 'Saddle updated successfully',
      data: saddle,
    };
  }

  // ================= DELETE IMAGE =================
  @Delete('images/:imageId')
  @Roles(Role.ADMIN)
  deleteImage(@Param('imageId') imageId: string) {
    return this.sadllesService.deleteImage(imageId).then((data) => ({
      success: true,
      message: 'Image deleted successfully',
      data,
    }));
  }

  // ================= DELETE =================
  @Delete(':id')
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string) {
    return this.sadllesService.delete(id).then((data) => ({
      success: true,
      message: 'Saddle deleted successfully',
      data,
    }));
  }

  // ================= FIND ALL =================
  @Get()
  @Roles(Role.USER, Role.ADMIN)
  findAll(@Query('subcategory') subcategory?: saddleSubcategory) {
    return this.sadllesService.findAll(subcategory).then((data) => ({
      success: true,
      message: 'Saddles retrieved successfully',
      data,
    }));
  }

  // ================= FIND ONE =================
  @Get(':id')
  @Roles(Role.USER)
  findOne(@Param('id') id: string) {
    return this.sadllesService.findOne(id).then((data) => ({
      success: true,
      message: 'Saddle retrieved successfully',
      data,
    }));
  }

  // ================= GET LEADLINE =================
  @Get('leadline/product')
  @Roles(Role.USER, Role.ADMIN)
  getLeadline() {
    return this.sadllesService.getLeadlineProduct().then((data) => ({
      success: true,
      message: 'Leadline product retrieved successfully',
      data,
    }));
  }
}
