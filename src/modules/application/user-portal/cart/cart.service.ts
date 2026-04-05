import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CouponService } from '../../admin-dashboard/coupon/coupon.service';
import { resolveCurrencyFromCountry } from 'src/common/utils/currency.util';

// @Injectable()
// export class CartService {
//   constructor(
//     private prisma: PrismaService,
//     private couponService: CouponService,
//   ) {}

//   /* ================= GET OR CREATE CART ================= */

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
//       return { success: false, message: 'Product already exists in cart' };
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

//     return {
//       success: true,
//       message: 'Item added to cart successfully',
//       data: created,
//     };
//   }

//   async getCart(
//     params: { userId?: string; sessionId?: string },
//     couponCode?: string,
//     country?: string,
//   ) {
//     const cart = await this.getOrCreateCart(params);

//     const currency = resolveCurrencyFromCountry(country);

//     // Ensure that related models are included when fetching cart items
//     const cartData = await this.prisma.cart.findUnique({
//       where: { id: cart.id },
//       include: {
//         items: {
//           include: {
//             variant: {
//               include: { Tackproduct: true, images: true }, // Include related model Tackproduct
//             },
//             usedSaddle: { include: { images: true } },
//             leadline: { include: { images: true } },
//           },
//         },
//       },
//     });

//     const userId = cart.userId ?? null;

//     const formattedItems = (cartData?.items || [])
//       .map((item) => {
//         // USED SADDLE
//         if (item.usedSaddle) {
//           const price =
//             currency === 'USD'
//               ? item.usedSaddle.basePrice_usd
//               : item.usedSaddle.basePrice_eur;

//           const totalPrice = price * item.quantity;

//           return {
//             userId,
//             sessionId: cart.sessionId,
//             cartId: cart.id,
//             itemId: item.id,
//             quantity: item.quantity,
//             usedSaddleId: item.usedSaddle.id,
//             itemName: item.usedSaddle.title,
//             itemImage: item.usedSaddle.images?.[0]?.url ?? null,
//             price,
//             currency,
//             totalPrice,
//           };
//         }

//         // LEADLINE
//         if (item.leadline) {
//           const price =
//             currency === 'USD'
//               ? item.leadline.price_usd
//               : item.leadline.price_eur;

//           const totalPrice = Number(price) * item.quantity;

//           return {
//             userId,
//             sessionId: cart.sessionId,
//             cartId: cart.id,
//             itemId: item.id,
//             quantity: item.quantity,
//             leadlineId: item.leadline.id,
//             itemName: item.leadline.name,
//             itemImage: item.leadline.images?.[0]?.url ?? null,
//             price,
//             currency,
//             totalPrice,
//           };
//         }

//         // TACK VARIANT
//         if (item.variant) {
//           const price =
//             currency === 'USD'
//               ? item.variant.price_usd
//               : item.variant.price_eur;

//           const totalPrice = price * item.quantity;

//           return {
//             userId,
//             sessionId: cart.sessionId,
//             cartId: cart.id,
//             itemId: item.id,
//             quantity: item.quantity,
//             tackProductId: item.variant.Tackproduct?.id ?? null,
//             variantId: item.variant.id,
//             itemName: item.variant.Tackproduct?.name ?? null,
//             itemImage: item.variant.images?.[0]?.url ?? null,
//             price,
//             currency,
//             totalPrice,
//           };
//         }

//         return null;
//       })
//       .filter(Boolean);

//     /* ================= CALCULATION ================= */

//     const subtotal = formattedItems.reduce((sum, item) => {
//       return sum + Number(item.price) * item.quantity;
//     }, 0);

//     const shipping = subtotal > 0 ? 15 : 0;

//     const taxRate = 0.08;
//     const tax = subtotal * taxRate;

//     let couponDiscount = 0;
//     let couponMessage: string | null = null;

//     if (couponCode && params.userId) {
//       try {
//         const coupon = await this.couponService.validateCoupon(
//           couponCode,
//           params.userId,
//         );

//         const discountRate = coupon.discount / 100;

//         couponDiscount = subtotal * discountRate;

//         couponMessage = 'Coupon applied successfully';
//       } catch {
//         couponMessage = 'Coupon code is invalid';
//       }
//     }

//     const total = subtotal + shipping + tax - couponDiscount;

//     return {
//       success: true,
//       message: 'Cart retrieved successfully',
//       data: {
//         items: formattedItems,
//         summary: {
//           currency,
//           subtotal,
//           shipping,
//           tax,
//           couponMessage,
//           couponDiscount,
//           total,
//         },
//       },
//     };
//   }

//   /* ================= UPDATE QUANTITY ================= */

//   async updateQuantity(
//     params: { userId?: string; sessionId?: string },
//     itemId: string,
//     quantity: number,
//   ) {
//     const cart = await this.getOrCreateCart(params);

//     const item = await this.prisma.cartItem.findFirst({
//       where: { id: itemId, cartId: cart.id },
//     });

//     if (!item) {
//       return { success: false, message: 'Cart item not found' };
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

//   async removeItem(
//     params: { userId?: string; sessionId?: string },
//     itemId: string,
//   ) {
//     const cart = await this.getOrCreateCart(params);

//     const item = await this.prisma.cartItem.findFirst({
//       where: { id: itemId, cartId: cart.id },
//     });

//     if (!item) {
//       return { success: false, message: 'Cart item not found' };
//     }

//     await this.prisma.cartItem.delete({
//       where: { id: itemId },
//     });

//     return {
//       success: true,
//       message: 'Item removed successfully',
//     };
//   }

//   /* ================= CLEAR CART ================= */

//   async clearCart(params: { userId?: string; sessionId?: string }) {
//     const { userId, sessionId } = params;

//     if (!userId && !sessionId) {
//       return { success: false, message: 'Invalid cart owner' };
//     }

//     const cart = await this.prisma.cart.findFirst({
//       where: userId ? { userId } : { sessionId },
//     });

//     if (!cart) {
//       return { success: false, message: 'Cart not found' };
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

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private couponService: CouponService,
  ) {}

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

  /* ADD TO CART */

  async addToCart(
    params: { userId?: string; sessionId?: string },
    dto: AddToCartDto,
  ) {
    const cart = await this.getOrCreateCart(params);

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

  /* GET CART */

  // async getCart(
  //   params: { userId?: string; sessionId?: string },
  //   couponCode?: string,
  //   country?: string,
  // ) {

  //   const cart = await this.getOrCreateCart(params)

  //   const currency = resolveCurrencyFromCountry(country)

  //   // ⭐ coupon store in cart
  //   if(couponCode){

  //     await this.prisma.cart.update({
  //       where:{ id:cart.id },
  //       data:{ couponCode }
  //     })

  //   }

  //   const cartData = await this.prisma.cart.findUnique({
  //     where:{ id:cart.id },
  //     include:{
  //       items:{
  //         include:{
  //           variant:{ include:{ Tackproduct:true, images:true }},
  //           usedSaddle:{ include:{ images:true }},
  //           leadline:{ include:{ images:true }},
  //         }
  //       }
  //     }
  //   })

  //   const formattedItems = (cartData?.items || []).map((item)=>{

  //     if(item.usedSaddle){

  //       const price =
  //         currency === 'USD'
  //           ? item.usedSaddle.basePrice_usd
  //           : item.usedSaddle.basePrice_eur

  //       return{
  //         quantity:item.quantity,
  //         itemName:item.usedSaddle.title,
  //         itemImage:item.usedSaddle.images?.[0]?.url ?? null,
  //         price,
  //         currency,
  //         totalPrice:price * item.quantity
  //       }

  //     }

  //     if(item.leadline){

  //       const price =
  //         currency === 'USD'
  //           ? item.leadline.price_usd
  //           : item.leadline.price_eur

  //       return{
  //         quantity:item.quantity,
  //         itemName:item.leadline.name,
  //         itemImage:item.leadline.images?.[0]?.url ?? null,
  //         price:Number(price),
  //         currency,
  //         totalPrice:Number(price) * item.quantity
  //       }

  //     }

  //     if(item.variant){

  //       const price =
  //         currency === 'USD'
  //           ? item.variant.price_usd
  //           : item.variant.price_eur

  //       return{
  //         quantity:item.quantity,
  //         itemName:item.variant.Tackproduct?.name,
  //         itemImage:item.variant.images?.[0]?.url ?? null,
  //         price,
  //         currency,
  //         totalPrice:price * item.quantity
  //       }

  //     }

  //     return null

  //   }).filter(Boolean)

  //   const subtotal = formattedItems.reduce((sum,item)=>{
  //     return sum + Number(item.price) * item.quantity
  //   },0)

  //   const shipping = subtotal > 0 ? 15 : 0
  //   const tax = subtotal * 0.08

  //   let discount = 0
  //   let couponMessage = null

  //   if(cartData?.couponCode && params.userId){

  //     try{

  //       const coupon = await this.couponService.validateCoupon(
  //         cartData.couponCode,
  //         params.userId
  //       )

  //       discount = subtotal * (coupon.discount / 100)

  //       couponMessage = "Coupon applied successfully"

  //     }catch{

  //       couponMessage = "Coupon code invalid"

  //     }

  //   }

  //   const total = subtotal + shipping + tax - discount

  //   return{

  //     success:true,
  //     message:'Cart retrieved successfully',

  //     data:{
  //       items:formattedItems,

  //       summary:{
  //         currency,
  //         subtotal,
  //         shipping,
  //         tax,
  //         couponMessage,
  //         couponDiscount:discount,
  //         total
  //       }
  //     }
  //   }

  // }

  // async getCart(
  //   params: { userId?: string; sessionId?: string },
  //   couponCode?: string,
  //   country?: string,
  // ) {
  //   const cart = await this.getOrCreateCart(params);

  //   const currency = resolveCurrencyFromCountry(country);

  //   /**
  //    * 1️⃣ যদি নতুন coupon আসে → validate করে cart এ save করবো
  //    */

  //   if (couponCode) {
  //     console.log('Incoming coupon:', couponCode);

  //     try {
  //       let coupon;

  //       // 🔥 validate for both user & guest
  //       if (params.userId) {
  //         coupon = await this.couponService.validateCoupon(
  //           couponCode,
  //           params.userId,
  //         );
  //       } else {
  //         coupon = await this.prisma.coupon.findUnique({
  //           where: { code: couponCode },
  //         });

  //         if (!coupon) {
  //           throw new Error();
  //         }
  //       }

  //       // ✅ ALWAYS update
  //       const updatedCart = await this.prisma.cart.update({
  //         where: { id: cart.id },
  //         data: {
  //           couponCode: couponCode,
  //         },
  //       });

  //       console.log('Saved coupon in DB:', updatedCart.couponCode);
  //     } catch (error) {
  //       console.log('Coupon failed:', error);
  //       throw new BadRequestException('Invalid coupon code');
  //     }
  //   }

  //   /**
  //    * 2️⃣ cart আবার fetch করবো (updated coupon সহ)
  //    */

  //   const cartData = await this.prisma.cart.findUnique({
  //     where: { id: cart.id },
  //     include: {
  //       items: {
  //         include: {
  //           variant: { include: { Tackproduct: true, images: true } },
  //           usedSaddle: { include: { images: true } },
  //           leadline: { include: { images: true } },
  //         },
  //       },
  //     },
  //   });

  //   /**
  //    * 3️⃣ cart items format
  //    */

  //   const formattedItems = (cartData?.items || [])
  //     .map((item) => {
  //       if (item.usedSaddle) {
  //         const price =
  //           currency === 'USD'
  //             ? item.usedSaddle.basePrice_usd
  //             : item.usedSaddle.basePrice_eur;

  //         return {
  //           quantity: item.quantity,
  //           itemId: item.id,
  //           itemName: item.usedSaddle.title,
  //           itemImage: item.usedSaddle.images?.[0]?.url ?? null,
  //           price,
  //           currency,
  //           totalPrice: price * item.quantity,

  //           // ✅ ADD THIS
  //           usedSaddleId: item.usedSaddle.id,
  //         };
  //       }

  //       if (item.leadline) {
  //         const price =
  //           currency === 'USD'
  //             ? item.leadline.price_usd
  //             : item.leadline.price_eur;

  //         return {
  //           quantity: item.quantity,
  //           itemName: item.leadline.name,
  //           itemImage: item.leadline.images?.[0]?.url ?? null,
  //           price: Number(price),
  //           currency,
  //           totalPrice: Number(price) * item.quantity,

  //           // ✅ ADD
  //           leadlineId: item.leadline.id,
  //         };
  //       }

  //       if (item.variant) {
  //         const price =
  //           currency === 'USD'
  //             ? item.variant.price_usd
  //             : item.variant.price_eur;

  //         return {
  //           quantity: item.quantity,
  //           itemId: item.id,
  //           itemName: item.variant.Tackproduct?.name,
  //           itemImage: item.variant.images?.[0]?.url ?? null,
  //           price,
  //           currency,
  //           totalPrice: price * item.quantity,

  //           // ✅ ADD
  //           variantId: item.variant.id,
  //           tackProductId: item.variant.Tackproduct?.id ?? null,
  //         };
  //       }

  //       return null;
  //     })
  //     .filter(Boolean);

  //   /**
  //    * 4️⃣ calculation
  //    */

  //   const subtotal = formattedItems.reduce((sum, item) => {
  //     return sum + Number(item.price) * item.quantity;
  //   }, 0);

  //   const shipping = subtotal > 0 ? 15 : 0;
  //   const tax = subtotal * 0.08;

  //   let discount = 0;
  //   let couponMessage: string | null = null;

  //   /**
  //    * 5️⃣ যদি cart এ coupon থাকে → discount apply
  //    */

  //   if (cartData?.couponCode) {
  //     try {
  //       let coupon;

  //       if (params.userId) {
  //         coupon = await this.couponService.validateCoupon(
  //           cartData.couponCode,
  //           params.userId,
  //         );
  //       } else {
  //         coupon = await this.prisma.coupon.findUnique({
  //           where: { code: cartData.couponCode },
  //         });
  //       }

  //       if (coupon) {
  //         discount = subtotal * (coupon.discount / 100);

  //         couponMessage = 'Coupon applied successfully';
  //       }
  //     } catch {
  //       couponMessage = 'Coupon code invalid';
  //     }
  //   }

  //   /**
  //    * 6️⃣ final total
  //    */

  //   const total = subtotal + shipping + tax - discount;

  //   return {
  //     success: true,
  //     message: 'Cart retrieved successfully',

  //     data: {
  //       items: formattedItems,

  //       summary: {
  //         currency,
  //         subtotal,
  //         shipping,
  //         tax,
  //         couponCode,
  //         couponMessage,
  //         couponDiscount: discount,
  //         total,
  //       },
  //     },
  //   };
  // }

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
          variant: { include: { Tackproduct: true, images: true } },
          usedSaddle: { include: { images: true } },
          leadline: { include: { images: true } },
        },
      },
    },
  });

  const formattedItems = (cartData?.items || [])
    .map((item) => {
      if (item.usedSaddle) {
        const price =
          currency === 'USD'
            ? item.usedSaddle.basePrice_usd
            : item.usedSaddle.basePrice_eur;

        return {
          quantity: item.quantity,
          itemId: item.id,
          itemName: item.usedSaddle.title,
          itemImage: item.usedSaddle.images?.[0]?.url ?? null,
          price: Number(price),
          currency,
          totalPrice: Number(price) * item.quantity,
          usedSaddleId: item.usedSaddle.id,
        };
      }

      if (item.leadline) {
        const price =
          currency === 'USD'
            ? item.leadline.price_usd
            : item.leadline.price_eur;

        return {
          quantity: item.quantity,
          itemId: item.id,
          itemName: item.leadline.name,
          itemImage: item.leadline.images?.[0]?.url ?? null,
          price: Number(price),
          currency,
          totalPrice: Number(price) * item.quantity,
          leadlineId: item.leadline.id,
        };
      }

      if (item.variant) {
        const price =
          currency === 'USD'
            ? item.variant.price_usd
            : item.variant.price_eur;

        return {
          quantity: item.quantity,
          itemId: item.id,
          itemName: item.variant.Tackproduct?.name,
          itemImage: item.variant.images?.[0]?.url ?? null,
          price: Number(price),
          currency,
          totalPrice: Number(price) * item.quantity,
          variantId: item.variant.id,
          tackProductId: item.variant.Tackproduct?.id ?? null,
        };
      }

      return null;
    })
    .filter(Boolean);

  const subtotal = formattedItems.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  const shipping = subtotal > 0 ? 15 : 0;
  const tax = subtotal * 0.08;

  let discount = 0;
  let couponMessage: string | null = null;
  let appliedCouponCode: string | null = null;

  // ✅ Coupon only applies if query coupon is provided
  if (couponCode) {
    try {
      let coupon;

      if (params.userId) {
        coupon = await this.couponService.validateCoupon(
          couponCode,
          params.userId,
        );
      } else {
        coupon = await this.prisma.coupon.findUnique({
          where: { code: couponCode },
        });

        if (!coupon) {
          throw new Error('Invalid coupon');
        }

        if (coupon.expiresAt < new Date()) {
          throw new Error('Coupon expired');
        }
      }

      discount = subtotal * (coupon.discount / 100);
      couponMessage = 'Coupon applied successfully';
      appliedCouponCode = coupon.code;
    } catch (error) {
      throw new BadRequestException('Invalid coupon code');
    }
  }

  const total = subtotal + shipping + tax - discount;

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
        couponCode: appliedCouponCode,
        couponMessage,
        couponDiscount: discount,
        total,
      },
    },
  };
}

  /* UPDATE QUANTITY */

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

  /* REMOVE ITEM */

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

  /* CLEAR CART */

  async clearCart(params: { userId?: string; sessionId?: string }) {
    const cart = await this.prisma.cart.findFirst({
      where: params.userId
        ? { userId: params.userId }
        : { sessionId: params.sessionId },
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
