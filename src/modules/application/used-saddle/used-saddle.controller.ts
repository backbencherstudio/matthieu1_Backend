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
import { OptionalJwtAuthGuard } from 'src/modules/auth/guards/optionaljwt-auth.guard';
import { Brand, Discpline } from '@prisma/client';

@Controller('used-saddles')
export class UsedSaddleController {
  constructor(
    private readonly service: UsedSaddleService,
    private readonly upload: UsedSaddleUploadService,
  ) {}

  // ================= ADMIN =================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllAdmin(@Query('page') page = '1', @Query('limit') limit = '10') {
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(parseInt(limit, 10) || 10, 50);

    const data = await this.service.findAllAdmin(pageNumber, pageSize);

    return {
      statusCode: 200,
      message: 'Admin used saddles fetched successfully',
      ...data,
    };
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findOneAdmin(@Param('id') id: string) {
    const data = await this.service.findOneAdmin(id);

    return {
      statusCode: 200,
      message: 'Admin used saddle fetched successfully',
      data,
    };
  }

  // ================= PUBLIC =================

  @Get('public')
  @UseGuards(OptionalJwtAuthGuard)
  async getAllPublic(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('brand') brand?: Brand,
    @Query('seatSize') seatSize?: string,
    @Query('discipline') discipline?: Discpline,
  ) {
    let isAdmin = false;

    const user = req.user as any;

    if (user) {
      const userDetails = await UserRepository.getUserDetails(user.userId);
      isAdmin = userDetails?.type?.includes(Role.ADMIN);
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(parseInt(limit, 10) || 10, 50);

    const country = (req.headers['x-country'] || '').toString();

    const data = await this.service.findAll(
      isAdmin,
      pageNumber,
      pageSize,
      country,
      brand,
      seatSize,
      discipline,
    );

    return {
      statusCode: 200,
      message: 'Used saddles fetched successfully',
      ...data,
    };
  }

  // @Get('public/:id')
  // @UseGuards(OptionalJwtAuthGuard)
  // async findOnePublic(@Param('id') id: string, @Req() req: Request) {
  //   let isAdmin = false;

  //   const user = req.user as any;

  //   if (user) {
  //     const userDetails = await UserRepository.getUserDetails(user.userId);
  //     isAdmin = userDetails?.type?.includes(Role.ADMIN);
  //   }

  //   const country = (req.headers['x-country'] || '').toString();

  //   const data = await this.service.findOne(id, isAdmin, country);

  //   return {
  //     statusCode: 200,
  //     message: 'Used saddle fetched successfully',
  //     data,
  //   };
  // }

  @Get('public/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOnePublic(
    @Param('id') id: string,
    @Req() req: Request,
    @Query('trialPeriod') trialPeriod?: string,
  ) {
    let isAdmin = false;

    const user = req.user as any;

    if (user) {
      const userDetails = await UserRepository.getUserDetails(user.userId);
      isAdmin = userDetails?.type?.includes(Role.ADMIN);
    }

    const country = (req.headers['x-country'] || '').toString();

    const data = await this.service.findOne(id, isAdmin, country, trialPeriod);

    return {
      statusCode: 200,
      message: 'Used saddle fetched successfully',
      data,
    };
  }

  // ================= CREATE =================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.service.remove(id);

    return {
      statusCode: 200,
      message: 'Used saddle deleted successfully',
      data: result,
    };
  }
}
