import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { JobPortalService } from './job-portal.service';
import { JobUploadService } from './job-upload.service';

@Controller('job-portal')
export class JobPortalController {
  constructor(
    private readonly jobPortalService: JobPortalService,
    private readonly jobUploadService: JobUploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  async create(
    @Body() body: any,
    @UploadedFiles() files?: { files?: Express.Multer.File[] },
  ) {
    let fileUrls: string[] = [];

    if (files?.files) {
      fileUrls = await this.jobUploadService.uploadMany(
        'job-portal',
        files.files,
      );
    }

    const data = await this.jobPortalService.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      town: body.town,
      state: body.state,
      experience: body.experience,
      message: body.message,
      files: fileUrls.join(',') || undefined,
    });

    return {
      data,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findAll(
    @Query('page') page?: string, 
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const data = await this.jobPortalService.findAll(pageNumber, limitNumber, search);
    return {
      success: true,
      message: 'Job applications fetched successfully',
      data,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async findOne(@Param('id') id: string) {
    const data = await this.jobPortalService.findOne(id);
    return {
      success: true,
      message: 'Job application fetched successfully',
      data,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.jobPortalService.remove(id);
    return {
      success: true,
      message: 'Job application deleted successfully',
    };
  }
}
