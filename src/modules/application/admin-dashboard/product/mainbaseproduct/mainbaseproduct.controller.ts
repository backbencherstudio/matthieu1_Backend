import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { MainbaseproductService } from './mainbaseproduct.service';
import { CreateMainbaseproductDto } from './dto/create-mainbaseproduct.dto';
import { UpdateMainbaseproductDto } from './dto/update-mainbaseproduct.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductUploadService } from './product-upload.service';
import { productcategory, tackSubcategory } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mainbaseproduct')
export class MainbaseproductController {
  constructor(
    private readonly mainbaseproductService: MainbaseproductService,
    private readonly uploadService: ProductUploadService,
  ) {}

  /* ---------------- CREATE ---------------- */
  @Roles(Role.ADMIN)
  @Post('create')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      let dto: CreateMainbaseproductDto;

      if (typeof body === 'object' && body !== null) {
        // variants may come as JSON string
        let variants: any = body.variants;
        if (typeof body.variants === 'string') {
          try {
            variants = JSON.parse(body.variants);
          } catch {
            return { message: 'Invalid JSON in variants field' };
          }
        }

        dto = {
          name: body.name,
          category: body.category as productcategory,
          subcategory: body.subcategory as tackSubcategory,
          benefits: body.benefits,
          description: body.description,
          leatherCareGuide: body.leatherCareGuide,
          variants: Array.isArray(variants) ? variants : [],
        } as CreateMainbaseproductDto;
      } else {
        dto = body as CreateMainbaseproductDto;
      }

      // attach uploaded images → variants[index].images
      if (files?.length) {
        const bucketPrefix = 'base-products';
        const imageMap: Record<number, string[]> = {};
        const regex = /^variants\[(\d+)\]\.images$/;

        for (const file of files) {
          const match = file.fieldname.match(regex);
          if (!match) continue;

          const idx = Number(match[1]);
          if (!imageMap[idx]) imageMap[idx] = [];
          const url = await this.uploadService.uploadOne(bucketPrefix, file);
          imageMap[idx].push(url);
        }

        Object.entries(imageMap).forEach(([idxStr, urls]) => {
          const idx = Number(idxStr);
          if (!dto.variants[idx]) return;
          dto.variants[idx].images = [
            ...(dto.variants[idx].images || []),
            ...urls,
          ];
        });
      }

      return await this.mainbaseproductService.create(dto);
    } catch (error) {
      return {
        message: 'Failed to create base product',
        error: String(error?.message || error),
      };
    }
  }

  /* ---------------- LIST ---------------- */
  @Roles(Role.ADMIN)
  @Get('list')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: productcategory,
    @Query('search') search?: string,
  ) {
    try {
      return await this.mainbaseproductService.findAll({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        category,
        search,
      });
    } catch (error) {
      return {
        message: 'Failed to list base products',
        error: String(error?.message || error),
      };
    }
  }

  /* ---------------- FIND ONE ---------------- */
  //for admin dashboard
  @Roles(Role.ADMIN)
  @Get('oneproduct/:id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.mainbaseproductService.findOne(id);
    } catch (error) {
      return {
        message: 'Failed to fetch base product',
        error: String(error?.message || error),
      };
    }
  }

  //for user portal
  @Roles(Role.USER)
  @Get('user/product/:id')
  async getProductForUser(
    @Param('id') id: string,
    @Query('colorId') colorId?: string,
    @Query('sizeId') sizeId?: string,
  ) {
    return this.mainbaseproductService.getProductForUser(id, colorId, sizeId);
  }

  /* ---------------- UPDATE ---------------- */

  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      let dto: UpdateMainbaseproductDto;

      let variantsCreate: any = body.variantsCreate;
      if (typeof variantsCreate === 'string') {
        try {
          variantsCreate = JSON.parse(variantsCreate);
        } catch {
          return { message: 'Invalid JSON in variantsCreate field' };
        }
      }

      dto = {
        name: body.name,
        benefits: body.benefits,
        description: body.description,
        leatherCareGuide: body.leatherCareGuide,
        variantsCreate: Array.isArray(variantsCreate)
          ? variantsCreate
          : undefined,
      } as UpdateMainbaseproductDto;

      // attach uploaded images → variantsCreate[index].images
      if (files?.length && Array.isArray(dto.variantsCreate)) {
        const bucketPrefix = 'base-products';
        const map: Record<number, string[]> = {};
        const regex = /^variantsCreate\[(\d+)\]\.images$/;

        for (const file of files) {
          const match = file.fieldname.match(regex);
          if (!match) continue;

          const idx = Number(match[1]);
          if (!map[idx]) map[idx] = [];
          const url = await this.uploadService.uploadOne(bucketPrefix, file);
          map[idx].push(url);
        }

        Object.entries(map).forEach(([idxStr, urls]) => {
          const idx = Number(idxStr);
          if (!dto.variantsCreate[idx]) return;
          dto.variantsCreate[idx].images = [
            ...(dto.variantsCreate[idx].images || []),
            ...urls,
          ];
        });
      }

      return await this.mainbaseproductService.update(id, dto);
    } catch (error) {
      return {
        message: 'Failed to update base product',
        error: String(error?.message || error),
      };
    }
  }

  /* ---------------- DELETE ---------------- */

  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return {
        message: 'Base product deleted successfully',
        data: await this.mainbaseproductService,
      };
    } catch (error) {
      return {
        message: 'Failed to delete base product',
        error: String(error?.message || error),
      };
    }
  }
}
