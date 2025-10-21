import { Body, Controller, Delete, Param, Patch, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MainbaseproductService } from './mainbaseproduct.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { ProductUploadService } from './product-upload.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('mainbaseproduct')
export class VariantController {
    constructor(
        private readonly service: MainbaseproductService,
        private readonly uploadService: ProductUploadService,
    ) { }

    @Patch(':baseProductId/variants/:variantId')
    @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
    async updateVariant(
        @Param('baseProductId') baseProductId: string,
        @Param('variantId') variantId: string,
        @Body() body: any,
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        try {
            const dto: any = {
                ...(body?.colorId !== undefined && { colorId: body.colorId }),
                ...(body?.sizeId !== undefined && { sizeId: body.sizeId }),
            };
            if (body?.price !== undefined) dto.price = Number(body.price);
            if (body?.stockQuantity !== undefined) dto.stockQuantity = Number(body.stockQuantity);

            if (files && files.length > 0) {
                const urls = await this.uploadService.uploadMany('base-products', files);
                if (urls.length > 0) dto.imagesAdd = urls;
            }

            return await this.service.updateVariant(baseProductId, variantId, dto);
        } catch (error) {
            return { message: 'Failed to update variant', error: String(error?.message || error) };
        }
    }

    @Delete(':baseProductId/variants/:variantId')
    async deleteVariant(
        @Param('baseProductId') baseProductId: string,
        @Param('variantId') variantId: string,
    ) {
        try {
            return {
                message: 'Variant deleted successfully',
                data: await this.service.deleteVariant(baseProductId, variantId)
            }
        } catch (error) {
            return { message: 'Failed to delete variant', error: String(error?.message || error) };
        }
    }

    @Delete(':baseProductId/variants/:variantId/images/:imageId')
    async deleteVariantImage(
        @Param('baseProductId') baseProductId: string,
        @Param('variantId') variantId: string,
        @Param('imageId') imageId: string,
    ) {
        try {
            return {
                message: 'Variant image deleted successfully',
                data: await this.service.deleteVariantImage(baseProductId, variantId, imageId)
            }
        } catch (error) {
            return { message: 'Failed to delete variant image', error: String(error?.message || error) };
        }
    }
}


