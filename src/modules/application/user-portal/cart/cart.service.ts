import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CouponService } from '../../admin-dashboard/coupon/coupon.service';
import { resolveCurrencyFromCountry } from 'src/common/utils/currency.util';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private couponService: CouponService,
  ) {}

  /* ================= GET OR CREATE CART ================= */

  private async getOrCreateCart(params: {
    userId?: string;
    sessionId?: string;
  }) {
    const { userId, sessionId } = params;

    if (!userId && !sessionId) {
      throw new BadRequestException('userId or sessionId is required');
    }

    let cart = await this.prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId: userId ?? null,
          sessionId: sessionId ?? null,
        },
      });
    }

    return cart;
  }

  /* ================= ADD TO CART ================= */

  async addToCart(
    params: { userId?: string; sessionId?: string },
    dto: AddToCartDto,
  ) {
    const cart = await this.getOrCreateCart(params);

    if (dto.tackProductId && !dto.variantId) {
      throw new BadRequestException('Variant is required for TACK product');
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        tackProductId: dto.tackProductId ?? null,
        variantId: dto.variantId ?? null,
        usedSaddleId: dto.usedSaddleId ?? null,
        leadlineId: dto.leadlineId ?? null,
      },
    });

    if (existingItem) {
      return { success: false, message: 'Product already exists in cart' };
    }

    const created = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        tackProductId: dto.tackProductId ?? null,
        variantId: dto.variantId ?? null,
        usedSaddleId: dto.usedSaddleId ?? null,
        leadlineId: dto.leadlineId ?? null,
        quantity: dto.quantity,
      },
    });

    return {
      success: true,
      message: 'Item added to cart successfully',
      data: created,
    };
  }

  async getCart(
    params: { userId?: string; sessionId?: string },
    couponCode?: string,
    country?: string,
  ) {
    const cart = await this.getOrCreateCart(params);

    const currency = resolveCurrencyFromCountry(country);

    const cartData = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            variant: {
              include: { Tackproduct: true, images: true },
            },
            usedSaddle: { include: { images: true } },
            leadline: { include: { images: true } },
          },
        },
      },
    });

    const userId = cart.userId ?? null;

    const formattedItems = (cartData?.items || [])
      .map((item) => {
        // USED SADDLE
        if (item.usedSaddle) {
          const price =
            currency === 'USD'
              ? item.usedSaddle.basePrice_usd
              : item.usedSaddle.basePrice_eur;

          return {
            userId,
            sessionId: cart.sessionId,
            cartId: cart.id,
            itemId: item.id,
            quantity: item.quantity,
            itemName: item.usedSaddle.title,
            itemImage: item.usedSaddle.images?.[0]?.url ?? null,
            price,
            currency,
          };
        }

        // LEADLINE
        if (item.leadline) {
          const price =
            currency === 'USD'
              ? item.leadline.price_usd
              : item.leadline.price_eur;

          return {
            userId,
            sessionId: cart.sessionId,
            cartId: cart.id,
            itemId: item.id,
            quantity: item.quantity,
            itemName: item.leadline.name,
            itemImage: item.leadline.images?.[0]?.url ?? null,
            price,
            currency,
          };
        }

        // TACK VARIANT
        if (item.variant) {
          const price =
            currency === 'USD'
              ? item.variant.price_usd
              : item.variant.price_eur;

          return {
            userId,
            sessionId: cart.sessionId,
            cartId: cart.id,
            itemId: item.id,
            quantity: item.quantity,
            itemName: item.variant.Tackproduct?.name ?? null,
            itemImage: item.variant.images?.[0]?.url ?? null,
            price,
            currency,
          };
        }

        return null;
      })
      .filter(Boolean);

    /* ================= CALCULATION ================= */

    const subtotal = formattedItems.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    const shipping = subtotal > 0 ? 15 : 0;

    const taxRate = 0.08;
    const tax = subtotal * taxRate;

    let couponDiscount = 0;
    let couponMessage: string | null = null;

    if (couponCode && params.userId) {
      try {
        const coupon = await this.couponService.validateCoupon(
          couponCode,
          params.userId,
        );

        const discountRate = coupon.discount / 100;

        couponDiscount = subtotal * discountRate;

        couponMessage = 'Coupon applied successfully';
      } catch {
        couponMessage = 'Coupon code is invalid';
      }
    }

    const total = subtotal + shipping + tax - couponDiscount;

    return {
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        items: formattedItems,
        summary: {
          currency,
          subtotal,
          shipping,
          tax,
          couponMessage,
          couponDiscount,
          total,
        },
      },
    };
  }

  /* ================= UPDATE QUANTITY ================= */

  async updateQuantity(
    params: { userId?: string; sessionId?: string },
    itemId: string,
    quantity: number,
  ) {
    const cart = await this.getOrCreateCart(params);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      return { success: false, message: 'Cart item not found' };
    }

    const updated = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return {
      success: true,
      message: 'Quantity updated successfully',
      data: updated,
    };
  }

  /* ================= REMOVE ITEM ================= */

  async removeItem(
    params: { userId?: string; sessionId?: string },
    itemId: string,
  ) {
    const cart = await this.getOrCreateCart(params);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      return { success: false, message: 'Cart item not found' };
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return {
      success: true,
      message: 'Item removed successfully',
    };
  }

  /* ================= CLEAR CART ================= */

  async clearCart(params: { userId?: string; sessionId?: string }) {
    const { userId, sessionId } = params;

    if (!userId && !sessionId) {
      return { success: false, message: 'Invalid cart owner' };
    }

    const cart = await this.prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (!cart) {
      return { success: false, message: 'Cart not found' };
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      success: true,
      message: 'Cart cleared successfully',
    };
  }
}
