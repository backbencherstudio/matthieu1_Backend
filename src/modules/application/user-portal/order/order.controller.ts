import { Controller, Post, Get, Param, Req, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import appConfig from 'src/config/app.config';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
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

  /**
   * 🚀 Create Order
   */
  @Post()
  async createOrder(@Req() req, @Res({ passthrough: true }) res: Response) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

    const country = req.headers['x-country']?.toString();

    return this.orderService.createOrder({ userId, sessionId }, country);
  }

  /**
   * 📦 Get all orders
   */
  @Get()
  async getOrders(@Req() req, @Res({ passthrough: true }) res: Response) {
    const userId = this.extractUserIdFromToken(req);
    const sessionId = userId ? undefined : this.getOrSetGuestSession(req, res);

    return this.orderService.getOrders({ userId, sessionId });
  }

  /**
   * 📦 Get single order
   */
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

}
