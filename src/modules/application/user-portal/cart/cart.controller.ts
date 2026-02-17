import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartQuantityDto } from './dto/update-cart.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  addToCart(@Req() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, dto);
  }

  @Get()
  getCart(@Req() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Patch(':itemId')
  updateQuantity(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartQuantityDto,
  ) {
    return this.cartService.updateQuantity(itemId, dto.quantity);
  }

  /* ================= CLEAR CART ================= */
  @Delete('clear')
  clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.userId);
  }

  @Delete(':itemId')
  remove(@Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId);
  }
}
