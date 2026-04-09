import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../../admin-dashboard/coupon/coupon.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { CheckoutAddressModule } from '../checkout-address/checkout-address.module';
import { AdminOrderController } from './admin-order.controller';
import { AdminOrderService } from './admin-order.sevice';


@Module({
  imports: [JwtModule,PrismaModule, CartModule, CheckoutAddressModule],
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService, PrismaService, CartService, CouponService, AdminOrderService],
})
export class OrderModule {}
