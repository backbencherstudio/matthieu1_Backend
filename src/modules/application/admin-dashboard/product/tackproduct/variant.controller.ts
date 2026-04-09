import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Post,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { ProductUploadService } from './product-upload.service';
import { TackproductService } from './tackproduct.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('tackproduct')
export class VariantController {
  constructor(
    private readonly service: TackproductService,
    private readonly uploadService: ProductUploadService,
  ) {}

  /* ================= CREATE VARIANT ================= */

  @Post(':tackProductId/variants')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async createVariant(
    @Param('tackProductId') tackProductId: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      const dto: any = {
        colorId: body.colorId || null,
        sizeId: body.sizeId || null,
        price: Number(body.price),
        stockQuantity: Number(body.stockQuantity),
        isDefault: body.isDefault === 'true' || body.isDefault === true,
      };

      // 📷 upload images
      if (files && files.length > 0) {
        const urls = await this.uploadService.uploadMany(
          'tack-products',
          files,
        );
        dto.images = urls;
      }

      return await this.service.createVariant(tackProductId, dto);
    } catch (error) {
      return {
        message: 'Failed to create variant',
        error: String(error?.message || error),
      };
    }
  }

  @Patch(':tackProductId/variants/:variantId')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async updateVariant(
    @Param('tackProductId') tackProductId: string,
    @Param('variantId') variantId: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      const dto: any = {
        ...(body?.colorId !== undefined && { colorId: body.colorId }),
        ...(body?.sizeId !== undefined && { sizeId: body.sizeId }),
      };
      if (body?.price !== undefined) dto.price = Number(body.price);
      if (body?.stockQuantity !== undefined)
        dto.stockQuantity = Number(body.stockQuantity);

      if (files && files.length > 0) {
        const urls = await this.uploadService.uploadMany(
          'base-products',
          files,
        );
        if (urls.length > 0) dto.imagesAdd = urls;
      }

      return await this.service.updateVariant(tackProductId, variantId, dto);
    } catch (error) {
      return {
        message: 'Failed to update variant',
        error: String(error?.message || error),
      };
    }
  }

  @Patch(':tackproductId/variants/:variantId/set-default')
  async setDefaultVariant(
    @Param('tackproductId') tackproductId: string,
    @Param('variantId') variantId: string,
  ) {
    try {
      return await this.service.setDefaultVariant(tackproductId, variantId);
    } catch (error) {
      return {
        message: 'Failed to set default variant',
        error: String(error?.message || error),
      };
    }
  }

  @Delete(':tackProductId/variants/:variantId')
  async deleteVariant(
    @Param('tackProductId') tackProductId: string,
    @Param('variantId') variantId: string,
  ) {
    try {
      return {
        message: 'Variant deleted successfully',
        data: await this.service.deleteVariant(tackProductId, variantId),
      };
    } catch (error) {
      return {
        message: 'Failed to delete variant',
        error: String(error?.message || error),
      };
    }
  }

  @Delete(':tackProductId/variants/:variantId/images/:imageId')
  async deleteVariantImage(
    @Param('tackProductId') tackProductId: string,
    @Param('variantId') variantId: string,
    @Param('imageId') imageId: string,
  ) {
    try {
      return {
        message: 'Variant image deleted successfully',
        data: await this.service.deleteVariantImage(
          tackProductId,
          variantId,
          imageId,
        ),
      };
    } catch (error) {
      return {
        message: 'Failed to delete variant image',
        error: String(error?.message || error),
      };
    }
  }
}
