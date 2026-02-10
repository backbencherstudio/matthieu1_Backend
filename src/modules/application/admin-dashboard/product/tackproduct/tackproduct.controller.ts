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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductUploadService } from './product-upload.service';
import { productcategory, tackSubcategory } from '@prisma/client';
import { CreateTackproductDto } from './dto/create-tackproduct.dto';
import { UpdateTackproductDto } from './dto/update-tackproduct.dto';
import { TackproductService } from './tackproduct.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tackproduct')
export class TackproductController {
  constructor(
    private readonly tackproductService: TackproductService,
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
      let thumbnailImage: string | undefined;

      // 🔹 handle thumbnail upload
      if (files?.length) {
        const thumbnailFile = files.find(
          (file) => file.fieldname === 'thumbnail',
        );

        if (thumbnailFile) {
          thumbnailImage = await this.uploadService.uploadOne(
            'tack-products',
            thumbnailFile,
          );
        }
      }

      // 🔹 parse variants
      let variants: any = body.variants;
      if (typeof body.variants === 'string') {
        try {
          variants = JSON.parse(body.variants);
        } catch {
          return { message: 'Invalid JSON in variants field' };
        }
      }

      const dto: CreateTackproductDto = {
        name: body.name,
        category: body.category as productcategory,
        subcategory: body.subcategory as tackSubcategory,
        benefits: body.benefits,
        description: body.description,
        leatherCareGuide: body.leatherCareGuide,
        thumbnailImage,
        variants: Array.isArray(variants) ? variants : [],
      };

      // 🔹 attach variant images
      if (files?.length) {
        const imageMap: Record<number, string[]> = {};
        const regex = /^variants\[(\d+)\]\.images$/;

        for (const file of files) {
          const match = file.fieldname.match(regex);
          if (!match) continue;

          const idx = Number(match[1]);
          if (!imageMap[idx]) imageMap[idx] = [];
          const url = await this.uploadService.uploadOne(
            'variant-images',
            file,
          );
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

      return await this.tackproductService.create(dto);
    } catch (error) {
      return {
        message: 'Failed to create tack product',
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
      return await this.tackproductService.findAll({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        category,
        search,
      });
    } catch (error) {
      return {
        message: 'Failed to list tack products',
        error: String(error?.message || error),
      };
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @Get('user/show-all/:category')
  async showAllForUser(@Param('category') category: productcategory) {
    return this.tackproductService.getProductsGroupedBySubcategoryForUser(
      category,
    );
  }

  /* ---------------- FIND ONE ---------------- */
  //for admin dashboard
  @Roles(Role.ADMIN)
  @Get('oneproduct/:id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.tackproductService.findOne(id);
    } catch (error) {
      return {
        message: 'Failed to fetch tack product',
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
    return this.tackproductService.getProductForUser(id, colorId, sizeId);
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
      let dto: UpdateTackproductDto;

      let variantsCreate: any = body.variantsCreate;
      if (typeof variantsCreate === 'string') {
        try {
          variantsCreate = JSON.parse(variantsCreate);
        } catch {
          return { message: 'Invalid JSON in variantsCreate field' };
        }
      }

      // ✅ find thumbnail file
      const thumbnailFile = files?.find(
        (file) => file.fieldname === 'thumbnail',
      );

      dto = {
        name: body.name,
        benefits: body.benefits,
        description: body.description,
        leatherCareGuide: body.leatherCareGuide,
        variantsCreate: Array.isArray(variantsCreate)
          ? variantsCreate
          : undefined,
        thumbnailFile, // 👈 pass file to service
      } as UpdateTackproductDto & { thumbnailFile?: Express.Multer.File };

      // 🔹 attach uploaded images → variantsCreate[index].images (UNCHANGED)
      if (files?.length && Array.isArray(dto.variantsCreate)) {
        const bucketPrefix = 'tack-products';
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

      return await this.tackproductService.update(id, dto);
    } catch (error) {
      return {
        message: 'Failed to update tack product',
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
        message: 'Tack product deleted successfully',
        data: await this.tackproductService.remove(id),
      };
    } catch (error) {
      return {
        message: 'Failed to delete tack product',
        error: String(error?.message || error),
      };
    }
  }
}
