import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout-address.controller';
import { CheckoutService } from './checkout-address.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../../admin-dashboard/coupon/coupon.service';
import { CouponModule } from '../../admin-dashboard/coupon/coupon.module';
import { CartModule } from '../cart/cart.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [JwtModule, PrismaModule, CartModule, CouponModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService, CartService, CouponService],
  exports: [CheckoutService],
})
export class CheckoutAddressModule {}
