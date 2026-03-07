// import {
//   Controller,
//   Post,
//   Get,
//   Patch,
//   Delete,
//   Body,
//   Param,
//   Req,
//   UseGuards,
// } from '@nestjs/common';
// import { CartService } from './cart.service';
// import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/common/guard/role/roles.guard';
// import { Roles } from 'src/common/guard/role/roles.decorator';
// import { Role } from 'src/common/guard/role/role.enum';
// import { AddToCartDto } from './dto/add-to-cart.dto';
// import { UpdateCartQuantityDto } from './dto/update-cart.dto';

// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.USER)
// @Controller('cart')
// export class CartController {
//   constructor(private readonly cartService: CartService) {}

//   @Post('add')
//   addToCart(@Req() req, @Body() dto: AddToCartDto) {
//     return this.cartService.addToCart(req.user.userId, dto);
//   }

//   @Get()
//   getCart(@Req() req) {
//     return this.cartService.getCart(req.user.userId);
//   }

//   @Patch(':itemId')
//   updateQuantity(
//     @Param('itemId') itemId: string,
//     @Body() dto: UpdateCartQuantityDto,
//   ) {
//     return this.cartService.updateQuantity(itemId, dto.quantity);
//   }

//   /* ================= CLEAR CART ================= */
//   @Delete('clear')
//   clearCart(@Req() req) {
//     return this.cartService.clearCart(req.user.userId);
//   }

//   @Delete(':itemId')
//   remove(@Param('itemId') itemId: string) {
//     return this.cartService.removeItem(itemId);
//   }
// }

// import {
//   Controller,
//   Post,
//   Get,
//   Patch,
//   Delete,
//   Body,
//   Param,
//   Req,
//   Res,
//   UseGuards,
// } from '@nestjs/common';
// import { CartService } from './cart.service';
// // import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { AddToCartDto } from './dto/add-to-cart.dto';
// import { UpdateCartQuantityDto } from './dto/update-cart.dto';
// import { Response } from 'express';
// import { randomUUID } from 'crypto';

// @Controller('cart')

// export class CartController {
//   constructor(private readonly cartService: CartService) {}

//   private getOrSetGuestSession(req: any, res: Response) {
//     const cookieName = 'cart_session';
//     let sessionId = req.cookies?.[cookieName];

//     if (!sessionId) {
//       sessionId = randomUUID();

//       // ✅ 3 days cookie (তুমি চাইলে change করবে)
//       res.cookie(cookieName, sessionId, {
//         httpOnly: true,
//         sameSite: 'lax',
//         secure: false, // production https হলে true
//         maxAge: 3 * 24 * 60 * 60 * 1000,
//       });
//     }

//     return sessionId;
//   }

//   @Post('add')
//   async addToCart(
//     @Req() req,
//     @Res({ passthrough: true }) res: Response,
//     @Body() dto: AddToCartDto,
//   ) {
//     const userId = req.user?.userId; // token থাকলে
//     const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

//     return this.cartService.addToCart({ userId, sessionId }, dto);
//   }

//   @Get()
//   async getCart(@Req() req, @Res({ passthrough: true }) res: Response) {
//     const userId = req.user?.userId;
//     const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

//     return this.cartService.getCart({ userId, sessionId });
//   }

//   @Patch(':itemId')
//   async updateQuantity(
//     @Req() req,
//     @Res({ passthrough: true }) res: Response,
//     @Param('itemId') itemId: string,
//     @Body() dto: UpdateCartQuantityDto,
//   ) {
//     const userId = req.user?.userId;
//     const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

//     return this.cartService.updateQuantity(
//       { userId, sessionId },
//       itemId,
//       dto.quantity,
//     );
//   }

//   @Delete(':itemId')
//   async remove(
//     @Req() req,
//     @Res({ passthrough: true }) res: Response,
//     @Param('itemId') itemId: string,
//   ) {
//     const userId = req.user?.userId;
//     const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

//     return this.cartService.removeItem({ userId, sessionId }, itemId);
//   }

//   // ✅ clear route MUST be before :itemId route যদি তুমি same controller এ রাখো
//   // তোমার আগের error হচ্ছিল কারণ /cart/clear কে :itemId হিসেবে ধরে removeItem call হচ্ছিল
// @Delete('clear')
// async clearCart(@Req() req, @Res({ passthrough: true }) res: Response) {
//   const userId = req.user?.userId;
//   const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

//   return this.cartService.clearCart({ userId, sessionId });
// }
// }

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartQuantityDto } from './dto/update-cart.dto';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import appConfig from 'src/config/app.config';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly jwtService: JwtService,
  ) {}

  private getOrSetGuestSession(req: any, res: Response) {
    const cookieName = 'cart_session';
    let sessionId = req.cookies?.[cookieName];

    if (!sessionId) {
      sessionId = randomUUID();

      res.cookie(cookieName, sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // production হলে true
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });
    }

    return sessionId;
  }

  private extractUserIdFromToken(req: any): string | null {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token, {
        secret: appConfig().jwt.secret,
      });

      return decoded.sub; // sub = userId
    } catch (error) {
      return null; // invalid/expired token → treat as guest
    }
  }

  @Post('add')
  async addToCart(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddToCartDto,
  ) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

    return this.cartService.addToCart({ userId, sessionId }, dto);
  }

  @Get()
  async getCart(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Query('coupon') couponCode?: string,
  ) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);
    const country = req.headers['x-country']?.toString();

    return this.cartService.getCart({ userId, sessionId }, couponCode, country);
  }

  @Patch(':itemId')
  async updateQuantity(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartQuantityDto,
  ) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

    return this.cartService.updateQuantity(
      { userId, sessionId },
      itemId,
      dto.quantity,
    );
  }

  // NOTE: `clear` must come before the `:itemId` route otherwise
  // Nest will interpret "clear" as an itemId and call remove() which
  // is exactly why the endpoint stopped working previously.
  @Delete('clear')
  async clearCart(@Req() req, @Res({ passthrough: true }) res: Response) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

    return this.cartService.clearCart({ userId, sessionId });
  }

  @Delete(':itemId')
  async remove(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Param('itemId') itemId: string,
  ) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

    return this.cartService.removeItem({ userId, sessionId }, itemId);
  }
}
