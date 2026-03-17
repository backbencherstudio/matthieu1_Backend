import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCheckoutAddressDto } from './dto/create-checkout-address.dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async saveAddress(
    params: { userId?: string; sessionId?: string },
    dto: CreateCheckoutAddressDto,
  ) {
    const { userId, sessionId } = params;

    if (!userId && !sessionId) {
      throw new BadRequestException('Invalid checkout owner');
    }

    const address = await this.prisma.checkoutAddress.create({
      data: {
        userId: userId ?? null,
        sessionId: sessionId ?? null,

        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        companyName: dto.companyName,

        streetAddress: dto.streetAddress,
        apartment: dto.apartment,

        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        country: dto.country,
      },
    });

    return {
      success: true,
      message: 'Shipping address saved successfully',
      data: address,
    };
  }

  async getAddress(params: { userId?: string; sessionId?: string }) {
    const { userId, sessionId } = params;

    const address = await this.prisma.checkoutAddress.findFirst({
      where: userId ? { userId } : { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Address retrieved successfully',
      data: address,
    };
  }

  async getSummary(
    params: { userId?: string; sessionId?: string },
    couponCode?: string,
    country?: string,
  ) {
    // get cart with calculations
    const cart = await this.cartService.getCart(params, couponCode, country);

    // get latest saved address
    const address = await this.prisma.checkoutAddress.findFirst({
      where: params.userId
        ? { userId: params.userId }
        : { sessionId: params.sessionId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Checkout summary retrieved successfully',
      data: {
        items: cart.data.items,
        address,
        summary: cart.data.summary,
      },
    };
  }
}
