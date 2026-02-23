import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule], 
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
