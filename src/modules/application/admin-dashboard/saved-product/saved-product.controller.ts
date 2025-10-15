import { Controller, Post, Get, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { SavedProductService } from './saved-product.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@Controller('saved-product')
export class SavedProductController {
    constructor(private readonly savedProductService: SavedProductService) { }

    @Post(':productId')
    add(@Param('productId') productId: string, @Req() req: Request) {
        const userId = (req as any).user.userId;
        return this.savedProductService.addFavorite(userId, productId);
    }

    @Get()
    list(@Req() req: Request) {
        const userId = (req as any).user.userId;
        return this.savedProductService.listFavorites(userId);
    }

    @Delete(':productId')
    remove(@Param('productId') productId: string, @Req() req: Request) {
        const userId = (req as any).user.userId;
        return this.savedProductService.removeFavorite(userId, productId);
    }
}
