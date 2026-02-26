// import { BadRequestException, Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { AddToCartDto } from './dto/add-to-cart.dto';

// @Injectable()
// export class CartService {
//   constructor(private prisma: PrismaService) {}

//   /* ================= GET OR CREATE CART ================= */

//   private async getOrCreateCart(userId: string) {
//     let cart = await this.prisma.cart.findFirst({
//       where: { userId },
//     });

//     if (!cart) {
//       cart = await this.prisma.cart.create({
//         data: { userId },
//       });
//     }

//     return cart;
//   }

//   /* ================= ADD TO CART ================= */

//   async addToCart(userId: string, dto: AddToCartDto) {
//     const cart = await this.getOrCreateCart(userId);

//     if (dto.tackProductId && !dto.variantId) {
//       throw new BadRequestException('Variant is required for TACK product');
//     }

//     const existingItem = await this.prisma.cartItem.findFirst({
//       where: {
//         cartId: cart.id,
//         tackProductId: dto.tackProductId ?? null,
//         variantId: dto.variantId ?? null,
//         usedSaddleId: dto.usedSaddleId ?? null,
//         leadlineId: dto.leadlineId ?? null,
//       },
//     });

//     if (existingItem) {
//       return {
//         success: false,
//         message: 'Product already exists in cart',
//       };
//     }

//     const created = await this.prisma.cartItem.create({
//       data: {
//         cartId: cart.id,
//         tackProductId: dto.tackProductId,
//         variantId: dto.variantId,
//         usedSaddleId: dto.usedSaddleId,
//         leadlineId: dto.leadlineId,
//         quantity: dto.quantity,
//       },
//     });

//     return {
//       success: true,
//       message: 'Item added to cart successfully',
//       data: created,
//     };
//   }

//   /* ================= GET CART (SHOW ALL WITH VALIDATION) ================= */

//   async getCart(userId: string) {
//     const cart = await this.getOrCreateCart(userId);

//     const cartData = await this.prisma.cart.findUnique({
//       where: { id: cart.id },
//       include: {
//         items: {
//           include: {
//             variant: {
//               include: {
//                 Tackproduct: true,
//                 images: true,
//               },
//             },
//             usedSaddle: {
//               include: { images: true },
//             },
//             leadline: {
//               include: { images: true },
//             },
//           },
//         },
//       },
//     });

//     const formattedItems = cartData.items.map((item) => {
//       // USED SADDLE
//       if (item.usedSaddle) {
//         return {
//           userId,
//           cartId: cart.id,
//           itemId: item.id,
//           usedSaddleId: item.usedSaddle.id,
//           quantity: item.quantity,
//           itemName: item.usedSaddle.title,
//           itemImage: item.usedSaddle.images[0]?.url ?? null,
//         };
//       }

//       // LEADLINE
//       if (item.leadline) {
//         return {
//           userId,
//           cartId: cart.id,
//           itemId: item.id,
//           leadlineSaddleId: item.leadline.id,
//           quantity: item.quantity,
//           itemName: item.leadline.name,
//           itemImage: item.leadline.images[0]?.url ?? null,
//         };
//       }

//       // TACK PRODUCT (Variant Based)
//       if (item.variant) {
//         return {
//           userId,
//           cartId: cart.id,
//           itemId: item.id,
//           tackProductId: item.variant.TackProductId,
//           variantId: item.variant.id,
//           quantity: item.quantity,
//           itemName: item.variant.Tackproduct.name,
//           itemImage: item.variant.images[0]?.url ?? null,
//         };
//       }
//     });

//     return {
//       success: true,
//       message: 'Cart retrieved successfully',
//       data: formattedItems,
//     };
//   }

//   /* ================= UPDATE QUANTITY ================= */

//   async updateQuantity(itemId: string, quantity: number) {
//     const item = await this.prisma.cartItem.findUnique({
//       where: { id: itemId },
//       include: {
//         variant: true,
//         usedSaddle: true,
//         leadline: true,
//       },
//     });

//     if (!item) {
//       return {
//         success: false,
//         message: 'Cart item not found',
//       };
//     }

//     const updated = await this.prisma.cartItem.update({
//       where: { id: itemId },
//       data: { quantity },
//     });

//     return {
//       success: true,
//       message: 'Quantity updated successfully',
//       data: updated,
//     };
//   }

//   /* ================= REMOVE ITEM ================= */

//   async removeItem(itemId: string) {
//     const deleted = await this.prisma.cartItem.delete({
//       where: { id: itemId },
//     });

//     return {
//       success: true,
//       message: 'Item removed from cart successfully',
//       data: deleted,
//     };
//   }

//   /* ================= CLEAR CART ================= */

//   async clearCart(userId: string) {
//     const cart = await this.prisma.cart.findFirst({
//       where: { userId },
//     });

//     if (!cart) {
//       return {
//         success: false,
//         message: 'Cart not found',
//       };
//     }

//     await this.prisma.cartItem.deleteMany({
//       where: { cartId: cart.id },
//     });

//     return {
//       success: true,
//       message: 'Cart cleared successfully',
//     };
//   }
// }

// import { BadRequestException, Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { AddToCartDto } from './dto/add-to-cart.dto';
// import { Cron } from '@nestjs/schedule';

// @Injectable()
// export class CartService {
//   constructor(private prisma: PrismaService) {}

//   // cookie 3 days, expire হওয়ার পরে 10 মিনিট পর delete
//   private readonly GUEST_COOKIE_MS = 3 * 24 * 60 * 60 * 1000;
//   private readonly DELETE_AFTER_MS = 10 * 60 * 1000;

//   private async touchCart(cartId: string) {
//     // ✅ ensure updatedAt refresh (CartItem change করলে Cart.updatedAt update হয় না)
//     await this.prisma.cart.update({
//       where: { id: cartId },
//       data: { updatedAt: new Date() },
//     });
//   }

//   private async getOrCreateCart(params: {
//     userId?: string;
//     sessionId?: string;
//   }) {
//     const { userId, sessionId } = params;

//     if (!userId && !sessionId) {
//       throw new BadRequestException('userId or sessionId is required');
//     }

//     let cart = await this.prisma.cart.findFirst({
//       where: userId ? { userId } : { sessionId },
//     });

//     if (!cart) {
//       cart = await this.prisma.cart.create({
//         data: {
//           userId: userId ?? null,
//           sessionId: sessionId ?? null,
//         },
//       });
//     }

//     return cart;
//   }

//   /* ================= ADD TO CART ================= */
//   async addToCart(
//     params: { userId?: string; sessionId?: string },
//     dto: AddToCartDto,
//   ) {
//     const cart = await this.getOrCreateCart(params);

//     // ✅ TACK product must have variant
//     if (dto.tackProductId && !dto.variantId) {
//       throw new BadRequestException('Variant is required for TACK product');
//     }

//     // ✅ block SADDLES category by design (তুমি আগেই বলেছ saddles cart এ যাবে না)
//     // এখানে তোমার dto তে saddlesProductId নেই, তাই skip

//     // ✅ duplicate check
//     const existingItem = await this.prisma.cartItem.findFirst({
//       where: {
//         cartId: cart.id,
//         tackProductId: dto.tackProductId ?? null,
//         variantId: dto.variantId ?? null,
//         usedSaddleId: dto.usedSaddleId ?? null,
//         leadlineId: dto.leadlineId ?? null,
//       },
//     });

//     if (existingItem) {
//       return { success: false, message: 'Product already exists in cart' };
//     }

//     // ✅ stock checks (তোমার আগের logic)
//     if (dto.variantId) {
//       const variant = await this.prisma.variant.findUnique({
//         where: { id: dto.variantId },
//       });
//       if (!variant) throw new BadRequestException('Variant not found');
//       if (variant.stockQuantity < dto.quantity)
//         throw new BadRequestException('Insufficient stock');
//     }

//     if (dto.usedSaddleId) {
//       const saddle = await this.prisma.usedSaddle.findUnique({
//         where: { id: dto.usedSaddleId },
//       });
//       if (!saddle) throw new BadRequestException('Used saddle not found');
//       if (saddle.stockQuantity < dto.quantity)
//         throw new BadRequestException('Insufficient stock');
//     }

//     if (dto.leadlineId) {
//       const leadline = await this.prisma.saddlesProduct.findUnique({
//         where: { id: dto.leadlineId },
//       });
//       if (!leadline) throw new BadRequestException('Leadline not found');
//       if ((leadline.stockQuantity ?? 0) < dto.quantity)
//         throw new BadRequestException('Insufficient stock');
//     }

//     const created = await this.prisma.cartItem.create({
//       data: {
//         cartId: cart.id,
//         tackProductId: dto.tackProductId ?? null,
//         variantId: dto.variantId ?? null,
//         usedSaddleId: dto.usedSaddleId ?? null,
//         leadlineId: dto.leadlineId ?? null,
//         quantity: dto.quantity,
//       },
//     });

//     await this.touchCart(cart.id);

//     return {
//       success: true,
//       message: 'Item added to cart successfully',
//       data: created,
//     };
//   }

/* ================= GET CART ================= */
// async getCart(params: { userId?: string; sessionId?: string }) {
//   const cart = await this.getOrCreateCart(params);

//   const cartData = await this.prisma.cart.findUnique({
//     where: { id: cart.id },
//     include: {
//       items: {
//         include: {
//           variant: {
//             include: { Tackproduct: true, images: true },
//           },
//           usedSaddle: { include: { images: true } },
//           leadline: { include: { images: true } },
//         },
//       },
//     },
//   });

//   const userId = cart.userId ?? null;

//   const formattedItems = (cartData?.items || [])
//     .map((item) => {
//       // USED SADDLE
//       if (item.usedSaddle) {
//         return {
//           userId,
//           sessionId: cart.sessionId,
//           cartId: cart.id,
//           itemId: item.id,
//           usedSaddleId: item.usedSaddle.id,
//           quantity: item.quantity,
//           itemName: item.usedSaddle.title,
//           itemImage: item.usedSaddle.images?.[0]?.url ?? null,
//         };
//       }

//       // LEADLINE
//       if (item.leadline) {
//         return {
//           userId,
//           sessionId: cart.sessionId,
//           cartId: cart.id,
//           itemId: item.id,
//           leadlineSaddleId: item.leadline.id,
//           quantity: item.quantity,
//           itemName: item.leadline.name,
//           itemImage: item.leadline.images?.[0]?.url ?? null,
//         };
//       }

//       // TACK product (variant based)
//       if (item.variant) {
//         return {
//           userId,
//           sessionId: cart.sessionId,
//           cartId: cart.id,
//           itemId: item.id,
//           tackProductId: item.variant.TackProductId,
//           variantId: item.variant.id,
//           quantity: item.quantity,
//           itemName: item.variant.Tackproduct?.name ?? null,
//           itemImage: item.variant.images?.[0]?.url ?? null,
//         };
//       }

//       return null;
//     })
//     .filter(Boolean);

//   return {
//     success: true,
//     message: 'Cart retrieved successfully',
//     data: formattedItems,
//   };
// }

//   /* ================= UPDATE QUANTITY ================= */
//   async updateQuantity(
//     params: { userId?: string; sessionId?: string },
//     itemId: string,
//     quantity: number,
//   ) {
//     const cart = await this.getOrCreateCart(params);

//     const item = await this.prisma.cartItem.findFirst({
//       where: { id: itemId, cartId: cart.id },
//       include: { variant: true, usedSaddle: true, leadline: true },
//     });

//     if (!item) return { success: false, message: 'Cart item not found' };

//     // ✅ stock checks
//     if (item.variant && item.variant.stockQuantity < quantity) {
//       throw new BadRequestException('Insufficient stock');
//     }
//     if (item.usedSaddle && item.usedSaddle.stockQuantity < quantity) {
//       throw new BadRequestException('Insufficient stock');
//     }
//     if (item.leadline && (item.leadline.stockQuantity ?? 0) < quantity) {
//       throw new BadRequestException('Insufficient stock');
//     }

//     const updated = await this.prisma.cartItem.update({
//       where: { id: itemId },
//       data: { quantity },
//     });

//     await this.touchCart(cart.id);

//     return {
//       success: true,
//       message: 'Quantity updated successfully',
//       data: updated,
//     };
//   }

//   /* ================= REMOVE ITEM ================= */
//   async removeItem(
//     params: { userId?: string; sessionId?: string },
//     itemId: string,
//   ) {
//     const cart = await this.getOrCreateCart(params);

//     const item = await this.prisma.cartItem.findFirst({
//       where: { id: itemId, cartId: cart.id },
//     });

//     if (!item) return { success: false, message: 'Cart item not found' };

//     const deleted = await this.prisma.cartItem.delete({
//       where: { id: itemId },
//     });

//     await this.touchCart(cart.id);

//     return {
//       success: true,
//       message: 'Item removed from cart successfully',
//       data: deleted,
//     };
//   }

//   /* ================= CLEAR CART ================= */
//   async clearCart(params: { userId?: string; sessionId?: string }) {
//     const cart = await this.prisma.cart.findFirst({
//       where: params.userId
//         ? { userId: params.userId }
//         : { sessionId: params.sessionId },
//     });

//     if (!cart) return { success: false, message: 'Cart not found' };

//     await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
//     await this.touchCart(cart.id);

//     return { success: true, message: 'Cart cleared successfully' };
//   }

//   /* ================= MERGE GUEST CART TO USER (login time) ================= */
//   async mergeGuestCartToUser(sessionId: string, userId: string) {
//     const guestCart = await this.prisma.cart.findFirst({
//       where: { sessionId, userId: null },
//       include: { items: true },
//     });

//     if (!guestCart) return;

//     const userCart = await this.getOrCreateCart({ userId });

//     for (const item of guestCart.items) {
//       const exists = await this.prisma.cartItem.findFirst({
//         where: {
//           cartId: userCart.id,
//           tackProductId: item.tackProductId ?? null,
//           variantId: item.variantId ?? null,
//           usedSaddleId: item.usedSaddleId ?? null,
//           leadlineId: item.leadlineId ?? null,
//         },
//       });

//       if (exists) {
//         // ✅ optional: sum quantity
//         await this.prisma.cartItem.update({
//           where: { id: exists.id },
//           data: { quantity: exists.quantity + item.quantity },
//         });
//       } else {
//         await this.prisma.cartItem.create({
//           data: {
//             cartId: userCart.id,
//             quantity: item.quantity,
//             tackProductId: item.tackProductId ?? null,
//             variantId: item.variantId ?? null,
//             usedSaddleId: item.usedSaddleId ?? null,
//             leadlineId: item.leadlineId ?? null,
//           },
//         });
//       }
//     }

//     // delete guest cart (items cascade)
//     await this.prisma.cart.delete({ where: { id: guestCart.id } });

//     await this.touchCart(userCart.id);
//   }

//   /* ================= AUTO DELETE EXPIRED GUEST CARTS ================= */
//   // ✅ runs every 10 minutes
//   @Cron('*/10 * * * *')
//   async deleteExpiredGuestCarts() {
//     const expireBefore = new Date(
//       Date.now() - (this.GUEST_COOKIE_MS + this.DELETE_AFTER_MS),
//     );

//     await this.prisma.cart.deleteMany({
//       where: {
//         userId: null,
//         sessionId: { not: null },
//         updatedAt: { lt: expireBefore },
//       },
//     });
//   }
// }

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

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

  // /* ================= GET CART ================= */

  // async getCart(params: { userId?: string; sessionId?: string }) {
  //   const cart = await this.getOrCreateCart(params);

  //   const cartData = await this.prisma.cart.findUnique({
  //     where: { id: cart.id },
  //     include: {
  //       items: true,
  //     },
  //   });

  //   return {
  //     success: true,
  //     message: 'Cart retrieved successfully',
  //     data: cartData?.items ?? [],
  //   };
  // }

  async getCart(params: { userId?: string; sessionId?: string }) {
    const cart = await this.getOrCreateCart(params);

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
          return {
            userId,
            sessionId: cart.sessionId,
            cartId: cart.id,
            itemId: item.id,
            usedSaddleId: item.usedSaddle.id,
            quantity: item.quantity,
            itemName: item.usedSaddle.title,
            itemImage: item.usedSaddle.images?.[0]?.url ?? null,
          };
        }

        // LEADLINE
        if (item.leadline) {
          return {
            userId,
            sessionId: cart.sessionId,
            cartId: cart.id,
            itemId: item.id,
            leadlineSaddleId: item.leadline.id,
            quantity: item.quantity,
            itemName: item.leadline.name,
            itemImage: item.leadline.images?.[0]?.url ?? null,
          };
        }

        // TACK product (variant based)
        if (item.variant) {
          return {
            userId,
            sessionId: cart.sessionId,
            cartId: cart.id,
            itemId: item.id,
            tackProductId: item.variant.TackProductId,
            variantId: item.variant.id,
            quantity: item.quantity,
            itemName: item.variant.Tackproduct?.name ?? null,
            itemImage: item.variant.images?.[0]?.url ?? null,
          };
        }

        return null;
      })
      .filter(Boolean);

    return {
      success: true,
      message: 'Cart retrieved successfully',
      data: formattedItems,
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
