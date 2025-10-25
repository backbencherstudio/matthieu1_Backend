import { Controller, Post, Get, Delete, Param, UseGuards, Req, Body } from '@nestjs/common';
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
  constructor(private readonly savedProductService: SavedProductService) {}

  // Save a product to favorites
  @Post()
  add(@Body('baseProductId') baseProductId: string, @Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.savedProductService.addFavorite(userId, baseProductId);
  }

  // Get all favorites for the logged-in user
  @Get()
  list(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.savedProductService.listFavorites(userId);
  }

  //Remove a product from favorites
  @Delete(':baseProductId')
  remove(@Param('baseProductId') baseProductId: string, @Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.savedProductService.removeFavorite(userId, baseProductId);
  }
}
