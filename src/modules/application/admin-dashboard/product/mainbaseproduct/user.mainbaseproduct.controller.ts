import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MainbaseproductService } from './mainbaseproduct.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@Controller('user/mainbaseproduct')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class UserMainbaseproductController {
    constructor(private readonly service: MainbaseproductService) { }

    @Get('category/:categoryId')
    async getByCategory(
        @Param('categoryId') categoryId: string,
        @Query('subcategoryId') subcategoryId?: string,
    ) {
        try {
            const data = await this.service.findByCategory({ categoryId, subcategoryId });
            return { data };
        } catch (error) {
            return { message: 'Failed to fetch base products by category', error: String(error?.message || error) };
        }
    }
}


