import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /* ================= GET OR CREATE CART ================= */

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }

  /* ================= ADD TO CART ================= */

  async addToCart(userId: string, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);

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
      return {
        success: false,
        message: 'Product already exists in cart',
      };
    }

    const created = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        tackProductId: dto.tackProductId,
        variantId: dto.variantId,
        usedSaddleId: dto.usedSaddleId,
        leadlineId: dto.leadlineId,
        quantity: dto.quantity,
      },
    });

    return {
      success: true,
      message: 'Item added to cart successfully',
      data: created,
    };
  }

  /* ================= GET CART (SHOW ALL WITH VALIDATION) ================= */

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const cartData = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                Tackproduct: true,
                images: true,
              },
            },
            usedSaddle: {
              include: { images: true },
            },
            leadline: {
              include: { images: true },
            },
          },
        },
      },
    });

    const formattedItems = cartData.items.map((item) => {
      // USED SADDLE
      if (item.usedSaddle) {
        return {
          userId,
          cartId: cart.id,
          itemId: item.id,
          usedSaddleId: item.usedSaddle.id,
          quantity: item.quantity,
          itemName: item.usedSaddle.title,
          itemImage: item.usedSaddle.images[0]?.url ?? null,
        };
      }

      // LEADLINE
      if (item.leadline) {
        return {
          userId,
          cartId: cart.id,
          itemId: item.id,
          leadlineSaddleId: item.leadline.id,
          quantity: item.quantity,
          itemName: item.leadline.name,
          itemImage: item.leadline.images[0]?.url ?? null,
        };
      }

      // TACK PRODUCT (Variant Based)
      if (item.variant) {
        return {
          userId,
          cartId: cart.id,
          itemId: item.id,
          tackProductId: item.variant.TackProductId,
          variantId: item.variant.id,
          quantity: item.quantity,
          itemName: item.variant.Tackproduct.name,
          itemImage: item.variant.images[0]?.url ?? null,
        };
      }
    });

    return {
      success: true,
      message: 'Cart retrieved successfully',
      data: formattedItems,
    };
  }

  /* ================= UPDATE QUANTITY ================= */

  async updateQuantity(itemId: string, quantity: number) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        variant: true,
        usedSaddle: true,
        leadline: true,
      },
    });

    if (!item) {
      return {
        success: false,
        message: 'Cart item not found',
      };
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

  async removeItem(itemId: string) {
    const deleted = await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return {
      success: true,
      message: 'Item removed from cart successfully',
      data: deleted,
    };
  }

  /* ================= CLEAR CART ================= */

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      };
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
