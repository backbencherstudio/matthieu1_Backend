import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout-address.controller';
import { CheckoutService } from './checkout-address.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../../admin-dashboard/coupon/coupon.service';

@Module({
  imports: [JwtModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService, CartService, CouponService],
})
export class CheckoutAddressModule {}
