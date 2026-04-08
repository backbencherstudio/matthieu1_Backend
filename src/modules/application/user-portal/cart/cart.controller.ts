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

  // @Get()
  // async getCart(
  //   @Req() req,
  //   @Res({ passthrough: true }) res: Response,
  //   @Query('coupon') couponCode?: string,
  // ) {
  //   const userId = this.extractUserIdFromToken(req);
  //   const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);
  //   const country = req.headers['x-country']?.toString();

  //   return this.cartService.getCart(
  //     { userId, sessionId },
  //     couponCode,
  //     country,
  //     {
  //       // failOnInvalidCoupon: true,
  //       saveCouponToCart: true,
  //       clearSavedCouponOnNewCoupon: false,
  //     },
  //   );
  // }

  @Get()
  async getCart(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Query('coupon') couponCode?: string,
  ) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);
    const country = req.headers['x-country']?.toString();

    return this.cartService.getCart(
      { userId, sessionId },
      couponCode,
      country,
      {
        saveCouponToCart: true,
        clearSavedCouponOnNewCoupon: false,
      },
    );
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
