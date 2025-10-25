import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('mainbaseproduct')
export class MainbaseproductController {
  constructor(
    private readonly mainbaseproductService: MainbaseproductService,
    private readonly uploadService: ProductUploadService,
  ) { }

  @Post('create')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    try {
      // Support both application/json and multipart/form-data
      let dto: CreateMainbaseproductDto;
      if (typeof body === 'object' && body !== null) {
        // When multipart, scalar fields are strings; variants is expected as JSON string
        const variantsRaw = body.variants;
        let variants: any = body.variants;
        if (typeof variantsRaw === 'string') {
          try {
            variants = JSON.parse(variantsRaw);
          } catch (e) {
            return { message: 'Invalid JSON in variants field' };
          }
        }
        dto = {
          name: body.name,
          categoryId: body.categoryId,
          subcategoryId: body.subcategoryId,
          benefits: body.benefits,
          description: body.description,
          leatherCareGuide: body.leatherCareGuide,
          variants: Array.isArray(variants) ? variants : [],
        } as unknown as CreateMainbaseproductDto;
      } else {
        dto = body as CreateMainbaseproductDto;
      }

      // Attach uploaded files to their respective variants by fieldname pattern: variants[<index>].images
      if (files && files.length > 0) {
        const bucketPrefix = 'base-products';
        const variantImagesMap: Record<number, string[]> = {};
        const regex = /^variants\[(\d+)\]\.images$/;
        for (const file of files) {
          const match = file.fieldname.match(regex);
          if (match) {
            const index = parseInt(match[1], 10);
            if (!variantImagesMap[index]) variantImagesMap[index] = [];
            const url = await this.uploadService.uploadOne(bucketPrefix, file);
            variantImagesMap[index].push(url);
          }
        }
        (dto as any).variants = (dto as any).variants || [];
        Object.entries(variantImagesMap).forEach(([idxStr, imageUrls]) => {
          const idx = Number(idxStr);
          if (!(dto as any).variants[idx]) return;
          const existing = Array.isArray((dto as any).variants[idx].images) ? (dto as any).variants[idx].images : [];
          (dto as any).variants[idx].images = [...existing, ...imageUrls];
        });
      }

      return await this.mainbaseproductService.create(dto);
    } catch (error) {
      return { message: 'Failed to create base product', error: String(error?.message || error) };
    }
  }

  @Get('list')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;

      return await this.mainbaseproductService.findAll({ page: pageNum, limit: limitNum, category, search });
    } catch (error) {
      return { message: 'Failed to list base products', error: String(error?.message || error) };
    }
  }

  @Get('oneproduct/:id')
  findOne(@Param('id') id: string) {
    try {
      return this.mainbaseproductService.findOne(id);
    } catch (error) {
      return { message: 'Failed to fetch base product', error: String(error?.message || error) };
    }
  }

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    try {
      // Build DTO allowing scalars + variantsCreate
      let dto: UpdateMainbaseproductDto;
      if (typeof body === 'object' && body !== null) {
        // Parse variantsCreate (may come as JSON string in multipart)
        const raw = body.variantsCreate;
        let variantsCreate: any = body.variantsCreate;
        if (typeof raw === 'string') {
          try {
            variantsCreate = JSON.parse(raw);
          } catch {
            return { message: 'Invalid JSON in variantsCreate field' };
          }
        }

        dto = {
          name: body.name,
          benefits: body.benefits,
          description: body.description,
          leatherCareGuide: body.leatherCareGuide,
          variantsCreate: Array.isArray(variantsCreate) ? variantsCreate : undefined,
        } as unknown as UpdateMainbaseproductDto;
      } else {
        dto = body as UpdateMainbaseproductDto;
      }

      // Attach uploaded files to variantsCreate indices: variantsCreate[<i>].images
      if (files && files.length > 0 && Array.isArray((dto as any).variantsCreate)) {
        const bucketPrefix = 'base-products';
        const map: Record<number, string[]> = {};
        const regex = /^variantsCreate\[(\d+)\]\.images$/;
        for (const file of files) {
          const match = file.fieldname.match(regex);
          if (match) {
            const idx = parseInt(match[1], 10);
            if (!map[idx]) map[idx] = [];
            const url = await this.uploadService.uploadOne(bucketPrefix, file);
            map[idx].push(url);
          }
        }
        Object.entries(map).forEach(([idxStr, urls]) => {
          const idx = Number(idxStr);
          if (!(dto as any).variantsCreate[idx]) return;
          const existing = Array.isArray((dto as any).variantsCreate[idx].images)
            ? (dto as any).variantsCreate[idx].images
            : [];
          (dto as any).variantsCreate[idx].images = [...existing, ...urls];
        });
      }

      return await this.mainbaseproductService.update(id, dto);
    } catch (error) {
      return { message: 'Failed to update base product', error: String(error?.message || error) };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return {
        message: 'Base product deleted successfully',
        data: await this.mainbaseproductService.remove(id)
      }
    } catch (error) {
      return { message: 'Failed to delete base product', error: String(error?.message || error) };
    }
  }
}
