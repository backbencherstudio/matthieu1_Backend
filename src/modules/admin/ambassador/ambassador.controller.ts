// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
// import { AmbassadorService } from './ambassador.service';
// import { CreateAmbassadorDto } from './dto/create-ambassador.dto';
// import { UpdateAmbassadorDto } from './dto/update-ambassador.dto';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { RolesGuard } from 'src/common/guard/role/roles.guard';
// import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { AmbassadorUploadService } from './ambassador-upload.service';
// import { FileFieldsInterceptor } from '@nestjs/platform-express';
// import { Roles } from 'src/common/guard/role/roles.decorator';
// import { Role } from 'src/common/guard/role/role.enum';
// import { promises as fs } from 'fs';

// @ApiBearerAuth()
// @ApiTags('Ambassador')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('ambassador')
// export class AmbassadorController {
//   constructor(
//     private readonly ambassadorService: AmbassadorService,
//     private readonly ambassadorUploadService: AmbassadorUploadService
//   ) { }

//   @Post()
//   @Roles(Role.ADMIN)
//   @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
//   async create(
//     @Body() body: any,
//     @UploadedFiles() files?: { image?: Express.Multer.File[] },
//   ) {
//     // normalize DTO from body
//     const createAmbassadorDto: CreateAmbassadorDto = { ...(body || {}) } as any;

//     const destination = body?.destination || 'uploads/ambassadors';
//     const filename =
//       body?.name ||
//       (files?.image && files.image[0]
//         ? files.image[0].originalname
//         : undefined);

//     let imageUrl: string | undefined;

//     try {
//       if (files?.image && files.image.length > 0) {
//         imageUrl = await this.ambassadorUploadService.uploadOne(
//           'ambassadors',
//           files.image[0],
//         );
//         (createAmbassadorDto as any).image = imageUrl;
//       }

//     } catch (err) {
//       // Prefer letting the service/controller layer handle errors properly; rethrow for global filters
//       throw err;
//     }

//     console.log('createAmbassadorDto:', createAmbassadorDto);
//     return this.ambassadorService.create(createAmbassadorDto);
//   }

//   private async ensureDir(dir: string) {
//     await fs.mkdir(dir, { recursive: true });
//   }

//   @Get()
//   @Roles(Role.ADMIN)
//   findAll(
//     @Query('page') page?: string,
//     @Query('limit') limit?: string,
//     @Query('search') search?: string,
//   ) {
//     const pageNumber = page ? parseInt(page, 10) : 1;
//     const limitNumber = limit ? parseInt(limit, 10) : 10;
//     return this.ambassadorService.findAll(pageNumber, limitNumber, search);
//   }

//   @Patch(':id')
//   @Roles(Role.ADMIN)
//   @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
//   async update(
//     @Param('id') id: string,
//     @Body() body: any,
//     @UploadedFiles() files?: { image?: Express.Multer.File[] },
//   ) {
//     const updateAmbassadorDto: UpdateAmbassadorDto = { ...(body || {}) } as any;

//     try {
//       if (files?.image && files.image.length > 0) {
//         const imageUrl = await this.ambassadorUploadService.uploadOne(
//           'ambassadors',
//           files.image[0],
//         );
//         updateAmbassadorDto.image = imageUrl;
//       }
//     } catch (err) {
//       throw err;
//     }

//     return this.ambassadorService.update(id, updateAmbassadorDto);
//   }

//   @Delete(':id')
//   @Roles(Role.ADMIN)
//   async remove(@Param('id') id: string) {
//     await this.ambassadorService.remove(id);
//     return { success: true, message: 'Ambassador removed successfully' };

//   }
// }

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { AmbassadorService } from './ambassador.service';
import { CreateAmbassadorDto } from './dto/create-ambassador.dto';
import { UpdateAmbassadorDto } from './dto/update-ambassador.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AmbassadorUploadService } from './ambassador-upload.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@ApiBearerAuth()
@ApiTags('Ambassador')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ambassador')
export class AmbassadorController {
  constructor(
    private readonly ambassadorService: AmbassadorService,
    private readonly ambassadorUploadService: AmbassadorUploadService,
  ) {}

  // ================= CREATE =================
  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'flag_image', maxCount: 1 },
    ]),
  )
  async create(
    @Body() body: any,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
      flag_image?: Express.Multer.File[];
    },
  ) {
    const createAmbassadorDto: CreateAmbassadorDto = { ...(body || {}) } as any;

    try {
      if (files?.image?.length) {
        const imageUrl = await this.ambassadorUploadService.uploadOne(
          'ambassadors',
          files.image[0],
        );
        createAmbassadorDto.image = imageUrl;
      }

      if (files?.flag_image?.length) {
        const flagImageUrl = await this.ambassadorUploadService.uploadOne(
          'ambassadors',
          files.flag_image[0],
        );
        createAmbassadorDto.flag_image = flagImageUrl;
      }

      return this.ambassadorService.create(createAmbassadorDto);
    } catch (err) {
      throw err;
    }
  }

  // ================= FIND ALL =================
  @Get()
  @Roles(Role.ADMIN, Role.USER  )
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('country') country?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.ambassadorService.findAll(
      pageNumber,
      limitNumber,
      search,
      country,
    );
  }

  // ================= UPDATE =================
  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'flag_image', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
      flag_image?: Express.Multer.File[];
    },
  ) {
    const updateAmbassadorDto: UpdateAmbassadorDto = { ...(body || {}) } as any;

    try {
      if (files?.image?.length) {
        updateAmbassadorDto.image =
          await this.ambassadorUploadService.uploadOne(
            'ambassadors',
            files.image[0],
          );
      }

      if (files?.flag_image?.length) {
        updateAmbassadorDto.flag_image =
          await this.ambassadorUploadService.uploadOne(
            'ambassadors',
            files.flag_image[0],
          );
      }

      return this.ambassadorService.update(id, updateAmbassadorDto);
    } catch (err) {
      throw err;
    }
  }

  // ================= DELETE =================
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.ambassadorService.remove(id);
    return {
      success: true,
      message: 'Ambassador removed successfully',
    };
  }
}
