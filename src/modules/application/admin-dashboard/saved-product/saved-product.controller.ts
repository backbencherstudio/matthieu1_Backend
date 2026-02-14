// import { Controller, Post, Get, Delete, Param, UseGuards, Req, Body } from '@nestjs/common';
// import { SavedProductService } from './saved-product.service';
// import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/common/guard/role/roles.guard';
// import { Roles } from 'src/common/guard/role/roles.decorator';
// import { Role } from 'src/common/guard/role/role.enum';
// import { Request } from 'express';

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.USER)
// @Controller('saved-product')
// export class SavedProductController {
//   constructor(private readonly savedProductService: SavedProductService) {}

//   // Save a product to favorites
//   @Post()
//   add(@Body('baseProductId') baseProductId: string, @Req() req: Request) {
//     const userId = (req as any).user.userId;
//     return this.savedProductService.addFavorite(userId, baseProductId);
//   }

//   // Get all favorites for the logged-in user
//   @Get()
//   list(@Req() req: Request) {
//     const userId = (req as any).user.userId;
//     return this.savedProductService.listFavorites(userId);
//   }

//   //Remove a product from favorites
//   @Delete(':baseProductId')
//   remove(@Param('baseProductId') baseProductId: string, @Req() req: Request) {
//     const userId = (req as any).user.userId;
//     return this.savedProductService.removeFavorite(userId, baseProductId);
//   }
// }

// import {
//   Controller,
//   Post,
//   Get,
//   Delete,
//   Req,
//   Body,
//   UseGuards,
//   BadRequestException,
//   Param,
// } from '@nestjs/common';
// import { Request } from 'express';
// import { SavedProductService } from './saved-product.service';
// import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/common/guard/role/roles.guard';
// import { Roles } from 'src/common/guard/role/roles.decorator';
// import { Role } from 'src/common/guard/role/role.enum';

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.USER)
// @Controller('saved-product')
// export class SavedProductController {
//   constructor(private readonly savedProductService: SavedProductService) {}

//   // ---------------- ADD FAVORITE ----------------
//   @Post()
//   add(
//     @Req() req: Request, // ✅ REQUIRED FIRST
//     @Body('baseProductId') baseProductId?: string,
//     @Body('saddleProductId') saddleProductId?: string,
//   ) {
//     const userId = (req as any).user.userId;

//     if (!baseProductId && !saddleProductId) {
//       throw new BadRequestException(
//         'Either baseProductId or saddleProductId is required',
//       );
//     }

//     if (baseProductId && saddleProductId) {
//       throw new BadRequestException(
//         'Only one product type can be saved at a time',
//       );
//     }

//     return this.savedProductService.addFavorite(
//       userId,
//       baseProductId,
//       saddleProductId,
//     );
//   }

//   // ---------------- LIST FAVORITES ----------------
//   @Get()
//   list(@Req() req: Request) {
//     const userId = (req as any).user.userId;
//     return this.savedProductService.listFavorites(userId);
//   }

//   // ---------------- REMOVE FAVORITE ----------------
//   // @Delete()
//   // remove(
//   //   @Req() req: Request, // ✅ REQUIRED FIRST
//   //   @Body('baseProductId') baseProductId?: string,
//   //   @Body('saddleProductId') saddleProductId?: string,
//   // ) {
//   //   const userId = (req as any).user.userId;

//   //   if (!baseProductId && !saddleProductId) {
//   //     throw new BadRequestException(
//   //       'Either baseProductId or saddleProductId is required',
//   //     );
//   //   }

//   //   return this.savedProductService.removeFavorite(
//   //     userId,
//   //     baseProductId,
//   //     saddleProductId,
//   //   );
//   // }

//   @Delete(':favoriteId')
//   remove(@Req() req: Request, @Param('favoriteId') favoriteId: string) {
//     const userId = (req as any).user.userId;
//     return this.savedProductService.removeFavoriteById(userId, favoriteId);
//   }
// }

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
  @Post()
  add(
    @Req() req: Request,
    @Body('tackProductId') tackProductId?: string,
    @Body('saddleProductId') saddleProductId?: string,
  ) {
    const userId = (req as any).user.userId;

    if (!tackProductId && !saddleProductId) {
      throw new BadRequestException(
        'Either tackProductId or saddleProductId is required',
      );
    }

    if (tackProductId && saddleProductId) {
      throw new BadRequestException(
        'Only one product type can be saved at a time',
      );
    }

    return this.savedProductService.addFavorite(
      userId,
      tackProductId,
      saddleProductId,
    );
  }

  // ---------------- LIST FAVORITES ----------------
  @Get()
  list(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.savedProductService.listFavorites(userId);
  }

  // ---------------- REMOVE FAVORITE ----------------
  @Delete(':favoriteId')
  remove(@Req() req: Request, @Param('favoriteId') favoriteId: string) {
    const userId = (req as any).user.userId;
    return this.savedProductService.removeFavoriteById(userId, favoriteId);
  }
}
