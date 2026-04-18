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
  Req,
  Headers,
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
  @Post('admin')
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
  @Patch('admin/:id')
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

  // ================= DELETE IMAGE For Admin =================
  @Delete('admin/images/:imageId')
  @Roles(Role.ADMIN)
  async deleteImage(@Param('imageId') imageId: string) {
    const data = await this.sadllesService.deleteImage(imageId);
    return {
      success: true,
      message: 'Image deleted successfully',
      data,
    };
  }

  // ================= DELETE =================
  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    const data = await this.sadllesService.delete(id);
    return {
      success: true,
      message: 'Saddle deleted successfully',
      data,
    };
  }

  // ================= FIND ALL =================
  @Get('public')
  async findAll(
    @Headers('x-country') country: string,
    @Query('subcategory') subcategory?: saddleSubcategory,
  ) {
    const data = await this.sadllesService.findAll(subcategory, country);
    return {
      success: true,
      message: 'Saddles retrieved successfully',
      data,
    };
  }

  // ================= FIND ONE =================
  @Get('public/:id')
  async findOne(
    @Headers('x-country') country: string,
    @Param('id') id: string,
  ) {
    const data = await this.sadllesService.findOne(id, country);
    return {
      success: true,
      message: 'Saddle retrieved successfully',
      data,
    };
  }

  // ================= GET ALL SADDLE PRODUCTS FOR ADMIN =================
  @Get('admin/all-saddles')
  @Roles(Role.ADMIN) // Only allow ADMIN role to view the products
  async getAllSaddlesForAdmin(
    @Query('page') page: number = 1, // Default to page 1 if not provided
    @Query('limit') limit: number = 10, // Default to 10 items per page
  ) {
    const data = await this.sadllesService.getAllSaddlesForAdmin(page, limit);
    return {
      success: true,
      message: 'All saddle products retrieved successfully',
      data: data.products,
      pagination: data.pagination,
    };
  }

  // ================= GET LEADLINE =================
  @Get('public/leadline/product')
  async getLeadline(@Headers('x-country') country: string) {
    const data = await this.sadllesService.getLeadlineProduct(country);
    return {
      success: true,
      message: 'Leadline product retrieved successfully',
      data,
    };
  }

  // ================= GET SPECIFIC LEADLINE PRODUCT WITH COUNTRY FILTER =================
  @Get('public/leadline/:id')
  async getSpecificLeadlineforUser(
    @Param('id') id: string, // Get the product ID from the route
    @Headers('x-country') country: string, // Get the country from headers
  ) {
    const data = await this.sadllesService.getSpecificLeadlineforUser(
      id,
      country,
    );
    return {
      success: true,
      message: 'Specific leadline product retrieved successfully',
      data,
    };
  }

  // ================= DELETE LEADLINE SADDLE =================
  @Delete('admin/leadline/:id')
  @Roles(Role.ADMIN) // Only allow ADMIN role to delete
  async deleteLeadline(@Param('id') id: string) {
    // Call the service method to delete the product
    const result = await this.sadllesService.deleteLeadline(id);

    return {
      success: true,
      message: 'Leadline saddle deleted successfully',
      data: result,
    };
  }

  // ================= GET ALL LEADLINE FOR ADMIN =================
  @Get('admin/leadlines')
  @Roles(Role.ADMIN) // Only allow ADMIN role to view the products
  async getAllLeadlinesForAdmin() {
    const leadlines = await this.sadllesService.getAllLeadlinesForAdmin();
    return {
      success: true,
      message: 'All leadline products retrieved successfully',
      data: leadlines,
    };
  }

  // ================= GET SPECIFIC LEADLINE =================
  @Get('admin/leadline/:id')
  @Roles(Role.ADMIN) // Allow both ADMIN and USER to view the product
  async getSpecificLeadline(@Param('id') id: string) {
    const leadline = await this.sadllesService.getSpecificLeadline(id);
    return {
      success: true,
      message: 'Leadline product retrieved successfully',
      data: leadline,
    };
  }
  // ================= EDIT LEADLINE =================

  @Patch('admin/leadline/:id')
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images')) // Handles file uploads
  async updateLeadline(
    @Param('id') id: string,
    @Body() body: UpdateSadlleDto, // For JSON data
    @UploadedFiles() files: Express.Multer.File[], // For file uploads
  ) {
    // Pass JSON body and uploaded files to service
    const updatedLeadline = await this.sadllesService.updateLeadline(
      id,
      body,
      files,
    );
    return {
      success: true,
      message: 'Leadline product updated successfully',
      data: updatedLeadline,
    };
  }
}
