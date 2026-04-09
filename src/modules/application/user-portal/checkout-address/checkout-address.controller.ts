import { Controller, Post, Get, Body, Req, Res, Query } from '@nestjs/common';
import { CheckoutService } from './checkout-address.service';
import { CreateCheckoutAddressDto } from './dto/create-checkout-address.dto';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import appConfig from 'src/config/app.config';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
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
        secure: false,
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

      return decoded.sub;
    } catch {
      return null;
    }
  }

  @Post('address')
  async saveAddress(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateCheckoutAddressDto,
  ) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

    return this.checkoutService.saveAddress({ userId, sessionId }, dto);
  }

  @Get('address')
  async getAddress(@Req() req, @Res({ passthrough: true }) res: Response) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

    return this.checkoutService.getAddress({ userId, sessionId });
  }

  @Get('summary')
  async getSummary(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Query('coupon') couponCode?: string,
  ) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

    const country = req.headers['x-country']?.toString();

    return this.checkoutService.getSummary(
      { userId, sessionId },
      couponCode,
      country,
    );
  }
}
