import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UsedSaddleService } from './used-saddle.service';
import { UsedSaddleUploadService } from './used-saddle-upload.service';
import { CreateUsedSaddleDto } from './dto/create-used-saddle.dto';
import { UpdateUsedSaddleDto } from './dto/update-used-saddle.dto';

@Controller('used-saddles')
export class UsedSaddleController {
  constructor(
    private readonly service: UsedSaddleService,
    private readonly upload: UsedSaddleUploadService,
  ) {}

  // CREATE
  @Post()
  create(@Body() dto: CreateUsedSaddleDto) {
    return this.service.create(dto);
  }

  // GET ALL
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUsedSaddleDto,
  ) {
    return this.service.update(id, dto);
  }

  // ADD IMAGES
  @Post(':id/images')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]),
  )
  async addImages(
    @Param('id') id: string,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    const urls = await this.upload.uploadMany(
      'used-saddles/images',
      files.images || [],
    );

    return this.service.addImages(id, urls);
  }

  // DELETE IMAGE
  @Delete('images/:imageId')
  deleteImage(@Param('imageId') imageId: string) {
    return this.service.deleteImage(imageId);
  }

  // DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
