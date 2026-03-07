import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { JwtModule } from '@nestjs/jwt';
import { CouponModule } from '../../admin-dashboard/coupon/coupon.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [JwtModule, CouponModule], 
  controllers: [CartController],
  providers: [CartService, PrismaService],
})
export class CartModule {}
