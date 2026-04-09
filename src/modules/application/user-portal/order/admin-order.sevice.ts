import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminOrderService {
  constructor(private prisma: PrismaService) {}

  // Admin can get all orders
  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
  ) {
    if (limit > 100) {
      throw new BadRequestException('Limit cannot exceed 100');
    }

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      const normalizedStatus = status.toString().trim().toUpperCase();
      const statusMap: Record<string, OrderStatus> = {
        PENDING: OrderStatus.PENDING,
        DELIVERED: OrderStatus.DELIVERED,
        INPROCESS: OrderStatus.INPROCESS,
        CANCEL: OrderStatus.CANCLE,
        CANCLE: OrderStatus.CANCLE,
      };

      const orderStatus = statusMap[normalizedStatus];
      if (!orderStatus) {
        throw new BadRequestException('Invalid order status');
      }

      where.status = orderStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { address: { email: { contains: search, mode: 'insensitive' } } },
        { address: { firstName: { contains: search, mode: 'insensitive' } } },
        { address: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          address: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      success: true,
      message: 'All orders retrieved successfully',
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin can get a specific order by its ID
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

  // Admin can update order status
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    // Validate status
    const validStatuses = [
      OrderStatus.PENDING,
      OrderStatus.DELIVERED,
      OrderStatus.INPROCESS,
      OrderStatus.CANCLE,
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    // Check if order exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new BadRequestException('Order not found');
    }

    // Update the status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
        address: true,
      },
    });

    return {
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    };
  }
}
