import {
  Controller,
  Post,
  Get,
  Delete,
  Req,
  Body,
  UseGuards,
  BadRequestException,
  Param,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { SavedProductService } from './saved-product.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@Controller('saved-product')
export class SavedProductController {
  constructor(private readonly savedProductService: SavedProductService) {}

  // ---------------- ADD FAVORITE ----------------
  // @Post()
  // add(
  //   @Req() req: Request,
  //   @Body('tackProductId') tackProductId?: string,
  //   @Body('saddleProductId') saddleProductId?: string,
  // ) {
  //   const userId = (req as any).user.userId;

  //   if (!tackProductId && !saddleProductId) {
  //     throw new BadRequestException(
  //       'Either tackProductId or saddleProductId is required',
  //     );
  //   }

  //   if (tackProductId && saddleProductId) {
  //     throw new BadRequestException(
  //       'Only one product type can be saved at a time',
  //     );
  //   }

  //   return this.savedProductService.addFavorite(
  //     userId,
  //     tackProductId,
  //     saddleProductId,
  //   );
  // }

  // ---------------- ADD FAVORITE ----------------
  @Post()
  add(
    @Req() req: Request,
    @Body('tackProductId') tackProductId?: string,
    @Body('saddleProductId') saddleProductId?: string,
    @Body('usedSaddleProductId') usedSaddleProductId?: string, // Added usedSaddleProductId
  ) {
    const userId = (req as any).user.userId;

    if (!tackProductId && !saddleProductId && !usedSaddleProductId) {
      throw new BadRequestException(
        'Either tackProductId, saddleProductId, or usedSaddleProductId is required',
      );
    }

    if (
      (tackProductId && saddleProductId) ||
      (tackProductId && usedSaddleProductId) ||
      (saddleProductId && usedSaddleProductId)
    ) {
      throw new BadRequestException(
        'Only one product type can be saved at a time',
      );
    }

    return this.savedProductService.addFavorite(
      userId,
      tackProductId,
      saddleProductId,
      usedSaddleProductId, // Pass usedSaddleProductId
    );
  }

  // ---------------- LIST FAVORITES ----------------
  @Get()
  list(@Req() req: Request, @Headers('x-country') country?: string) {
    const userId = (req as any).user.userId;
    return this.savedProductService.listFavorites(userId, country);
  }

  // ---------------- REMOVE FAVORITE ----------------
  @Delete(':favoriteId')
  remove(@Req() req: Request, @Param('favoriteId') favoriteId: string) {
    const userId = (req as any).user.userId;
    return this.savedProductService.removeFavoriteById(userId, favoriteId);
  }
}
