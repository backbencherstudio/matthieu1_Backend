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
  BadRequestException,
  InternalServerErrorException,
  HttpException,
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

  // // CREATE
  // @Post()
  // create(@Body() dto: CreateUsedSaddleDto) {
  //   return this.service.create(dto);
  // }

  @Post()
  async create(@Body() dto: CreateUsedSaddleDto) {
    if (!dto) {
      throw new BadRequestException('Request body cannot be empty');
    }

    try {
      const data = await this.service.create(dto);
      return {
        statusCode: 201,
        message: 'Used saddle created successfully',
        data,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to create used saddle',
      );
    }
  }

  // GET ALL
  @Get()
  async findAll() {
    try {
      const data = await this.service.findAll();
      return {
        statusCode: 200,
        message: 'Used saddles fetched successfully',
        data,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to fetch used saddles',
      );
    }
  }

  // GET ONE
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.service.findOne(id);
      return {
        statusCode: 200,
        message: 'Used saddle fetched successfully',
        data,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to fetch used saddle',
      );
    }
  }

  // UPDATE
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUsedSaddleDto) {
    try {
      const data = await this.service.update(id, dto);
      return {
        statusCode: 200,
        message: 'Used saddle updated successfully',
        data,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to update used saddle',
      );
    }
  }

  // ADD IMAGES
  @Post(':id/images')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async addImages(
    @Param('id') id: string,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    try {
      const urls = await this.upload.uploadMany(
        'used-saddles/images',
        files.images || [],
      );

      const result = await this.service.addImages(id, urls);
      return {
        statusCode: 200,
        message: 'Images added successfully',
        data: result,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to add images',
      );
    }
  }

  // DELETE IMAGE
  @Delete('images/:imageId')
  async deleteImage(@Param('imageId') imageId: string) {
    try {
      const result = await this.service.deleteImage(imageId);
      return {
        statusCode: 200,
        message: 'Image deleted successfully',
        data: result,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to delete image',
      );
    }
  }

  // DELETE
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.service.remove(id);
      return {
        statusCode: 200,
        message: 'Used saddle deleted successfully',
        data: result,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to delete used saddle',
      );
    }
  }
}
