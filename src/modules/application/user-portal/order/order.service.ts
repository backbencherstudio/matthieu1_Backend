import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { OrderStatus } from '@prisma/client';
import { CheckoutService } from '../checkout-address/checkout-address.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private readonly checkoutService: CheckoutService,
  ) {}

  // async createOrder(
  //   params: { userId?: string; sessionId?: string },
  //   country?: string,
  // ) {
  //   /**
  //    * 1️⃣ cart + summary
  //    */
  //   const cart = await this.cartService.getCart(params, undefined, country);

  //   const items = cart.data.items;
  //   const summary = cart.data.summary;

  //   if (!items.length) {
  //     throw new BadRequestException('Cart is empty');
  //   }

  //   /**
  //    * 2️⃣ address
  //    */
  //   const address = await this.prisma.checkoutAddress.findFirst({
  //     where: params.userId
  //       ? { userId: params.userId }
  //       : { sessionId: params.sessionId },
  //     orderBy: { createdAt: 'desc' },
  //   });

  //   if (!address) {
  //     throw new BadRequestException('Shipping address not found');
  //   }

  //   /**
  //    * 3️⃣ create order
  //    */
  //   const order = await this.prisma.order.create({
  //     data: {
  //       orderNumber: `ORD-${Date.now()}`,

  //       userId: params.userId ?? null,
  //       sessionId: params.sessionId ?? null,

  //       subtotal: summary.subtotal,
  //       shipping: summary.shipping,
  //       tax: summary.tax,
  //       discount: summary.couponDiscount,
  //       total: summary.total,
  //       currency: summary.currency,

  //       status: OrderStatus.PENDING,

  //       items: {
  //         create: items.map((item) => ({
  //           itemName: item.itemName,
  //           itemImage: item.itemImage,
  //           price: Number(item.price),
  //           quantity: item.quantity,
  //           totalPrice: Number(item.totalPrice),
  //           currency: item.currency,

  //           tackProductId: item.tackProductId ?? null,
  //           variantId: item.variantId ?? null,
  //           usedSaddleId: item.usedSaddleId ?? null,
  //           leadlineId: item.leadlineId ?? null,
  //         })),
  //       },

  //       address: {
  //         create: {
  //           firstName: address.firstName,
  //           lastName: address.lastName,
  //           email: address.email,
  //           phone: address.phone,

  //           streetAddress: address.streetAddress,
  //           apartment: address.apartment,

  //           city: address.city,
  //           state: address.state,
  //           zipCode: address.zipCode,
  //           country: address.country,
  //         },
  //       },
  //     },
  //   });

  //   /**
  //    * 4️⃣ clear cart
  //    */
  //   await this.prisma.cartItem.deleteMany({
  //     where: {
  //       cart: params.userId
  //         ? { userId: params.userId }
  //         : { sessionId: params.sessionId },
  //     },
  //   });

  //   /**
  //    * 5️⃣ reset coupon
  //    */
  //   await this.prisma.cart.updateMany({
  //     where: params.userId
  //       ? { userId: params.userId }
  //       : { sessionId: params.sessionId },
  //     data: {
  //       couponCode: null,
  //     },
  //   });

  //   return {
  //     success: true,
  //     message: 'Order created successfully',
  //     data: order,
  //   };
  // }

  async createOrder(
    params: { userId?: string; sessionId?: string },
    country?: string,
  ) {
    /**
     * 1) get checkout summary
     * no extra calculation here
     */
    const checkoutSummary = await this.checkoutService.getSummary(
      params,
      undefined,
      country,
    );

    const items = checkoutSummary.data.items;
    const address = checkoutSummary.data.address;
    const summary = checkoutSummary.data.summary;

    if (!items.length) {
      throw new BadRequestException('Cart is empty');
    }

    if (!address) {
      throw new BadRequestException('Shipping address not found');
    }

    /**
     * 2) create order from checkout summary data
     */
    const order = await this.prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,

        userId: params.userId ?? null,
        sessionId: params.sessionId ?? null,

        subtotal: Number(summary.subtotal),
        shipping: Number(summary.shipping),
        tax: Number(summary.tax),
        discount: Number(summary.couponDiscount),
        total: Number(summary.total),
        currency: summary.currency,

        status: OrderStatus.PENDING,

        items: {
          create: items.map((item) => ({
            itemName: item.itemName,
            itemImage: item.itemImage,
            price: Number(item.price),
            quantity: item.quantity,
            totalPrice: Number(item.totalPrice),
            currency: item.currency,

            tackProductId: item.tackProductId ?? null,
            variantId: item.variantId ?? null,
            usedSaddleId: item.usedSaddleId ?? null,
            leadlineId: item.leadlineId ?? null,
          })),
        },

        address: {
          create: {
            firstName: address.firstName,
            lastName: address.lastName,
            email: address.email,
            phone: address.phone,
            streetAddress: address.streetAddress,
            apartment: address.apartment,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
          },
        },
      },
      include: {
        items: true,
        address: true,
      },
    });

    /**
     * 3) clear cart items
     */
    await this.prisma.cartItem.deleteMany({
      where: {
        cart: params.userId
          ? { userId: params.userId }
          : { sessionId: params.sessionId },
      },
    });

    /**
     * 4) clear cart coupon
     */
    await this.prisma.cart.updateMany({
      where: params.userId
        ? { userId: params.userId }
        : { sessionId: params.sessionId },
      data: {
        couponCode: null,
      },
    });

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }

  /**
   * 📦 Get all orders
   */
  async getOrders(params: { userId?: string; sessionId?: string }) {
    const orders = await this.prisma.order.findMany({
      where: params.userId
        ? { userId: params.userId }
        : { sessionId: params.sessionId },
      include: {
        items: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
    };
  }

  /**
   * 📦 Get single order
   */
  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        address: true,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return {
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  /**
   * 💳 Payment success update
   */
  async markAsPaid(orderId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
      },
    });
  }
}
