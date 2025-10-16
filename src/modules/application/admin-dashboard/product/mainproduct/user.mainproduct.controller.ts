import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MainproductService } from './mainproduct.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@Controller('user/mainproduct')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)

export class UserMainproductController {
    constructor(private readonly mainproductService: MainproductService) { }

    @Get('by-collection')
    async getByCollection(
        @Query('subcategoryId') subcategoryId?: string,
        @Query('categoryName') categoryName?: string,
    ) {
        const data = await this.mainproductService.findByCollection({ subcategoryId, categoryName });
        return { data };
    }
}
