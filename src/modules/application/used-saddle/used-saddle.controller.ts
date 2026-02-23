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
  InternalServerErrorException,
  HttpException,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UsedSaddleService } from './used-saddle.service';
import { UsedSaddleUploadService } from './used-saddle-upload.service';
import { CreateUsedSaddleDto } from './dto/create-used-saddle.dto';
import { UpdateUsedSaddleDto } from './dto/update-used-saddle.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { Request } from 'express';
import { UserRepository } from 'src/common/repository/user/user.repository';

@Controller('used-saddles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsedSaddleController {
  constructor(
    private readonly service: UsedSaddleService,
    private readonly upload: UsedSaddleUploadService,
  ) {}

  // ================= FIND ALL =================

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  async findAll(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    try {
      const userDetails = await UserRepository.getUserDetails(req.user.userId);
      const isAdmin = userDetails?.type?.includes(Role.ADMIN);

      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const pageSize = Math.min(parseInt(limit, 10) || 10, 50); // max 50

      const data = await this.service.findAll(isAdmin, pageNumber, pageSize);

      return {
        statusCode: 200,
        message: 'Used saddles fetched successfully',
        ...data,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to fetch used saddles');
    }
  }

  // ================= FIND ONE =================
  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  async findOne(@Param('id') id: string, @Req() req: Request) {
    try {
      const userDetails = await UserRepository.getUserDetails(req.user.userId);

      const isAdmin = userDetails?.type?.includes(Role.ADMIN);

      const data = await this.service.findOne(id, isAdmin);

      return {
        statusCode: 200,
        message: 'Used saddle fetched successfully',
        data,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to fetch used saddle');
    }
  }

  // ================= CREATE =================
  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async create(
    @Body() dto: CreateUsedSaddleDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    try {
      const saddle = await this.service.create(dto);

      if (files?.images?.length) {
        const urls = await this.upload.uploadMany(
          'used-saddles/images',
          files.images,
        );
        await this.service.addImages(saddle.id, urls);
      }

      return {
        statusCode: 201,
        message: 'Used saddle created successfully',
        data: saddle,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException('Failed to create used saddle');
    }
  }

  // ================= UPDATE =================
  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateUsedSaddleDto) {
    const data = await this.service.update(id, dto);

    return {
      statusCode: 200,
      message: 'Used saddle updated successfully',
      data,
    };
  }

  // ================= ADD IMAGES =================
  @Roles(Role.ADMIN)
  @Post(':id/images')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async addImages(
    @Param('id') id: string,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
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
  }

  // ================= DELETE IMAGE =================
  @Roles(Role.ADMIN)
  @Delete('images/:imageId')
  async deleteImage(@Param('imageId') imageId: string) {
    const result = await this.service.deleteImage(imageId);
    return {
      statusCode: 200,
      message: 'Image deleted successfully',
      data: result,
    };
  }

  // ================= DELETE =================
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const result = await this.service.remove(id);

    return {
      statusCode: 200,
      message: 'Used saddle deleted successfully',
      data: result,
    };
  }
}
