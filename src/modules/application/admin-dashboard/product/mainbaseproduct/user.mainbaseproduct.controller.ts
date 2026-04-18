import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { MainbaseproductService } from './mainbaseproduct.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@Controller('user/mainbaseproduct')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class UserMainbaseproductController {
    constructor(private readonly mainbaseproductService: MainbaseproductService) { }


    @Get('category/:categoryId')
    async getByCategory(
        @Param('categoryId') categoryId: string,
        @Query('subcategoryId') subcategoryId?: string,
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number,
        @Query('sizeId') sizeId?: string,
        @Query('colorId') colorId?: string,
    ) {
        try {
            const data = await this.mainbaseproductService.findByCategory({
                categoryId,
                subcategoryId,
                minPrice,
                maxPrice,
                sizeId,
                colorId,
            });
            return { data };
        } catch (error) {
            return { message: 'Failed to fetch base products by category', error: String(error?.message || error) };
        }
    }

    @Get('userproduct/:id')
    async findOneByUser(@Param('id') id: string) {
        try {
            return await this.mainbaseproductService.findOnebyuser(id);
        } catch (error) {
            return {
                message: 'Failed to fetch base product',
                error: String(error?.message || error),
            };
        }
    }

    @Patch(':productId/set-default')
    async setDefaultVariant(
        @Param('productId') productId: string,
        @Body('colorId') colorId: string,
        @Body('sizeId') sizeId: string,
    ) {
        try {
            return await this.mainbaseproductService.setDefaultVariantByColorAndSize(
                productId,
                colorId,
                sizeId,
            );
        } catch (error) {
            return { message: 'Failed to set default variant', error: error.message };
        }
    }



}


