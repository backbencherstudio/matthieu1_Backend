import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  /* CREATE */

  async create(dto: CreateCouponDto) {
    const exists = await this.prisma.coupon.findUnique({
      where: { code: dto.code },
    });

    if (exists) {
      throw new BadRequestException('Coupon already exists');
    }

    const coupon = await this.prisma.coupon.create({
      data: {
        code: dto.code,
        discount: dto.discount,
        expiresAt: new Date(dto.expiresAt),
        maxUsers: dto.maxUsers,
        maxUsesPerUser: dto.maxUsesPerUser,
      },
    });

    return {
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    };
  }

  /* GET ALL */

  async findAll() {
    const coupons = await this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: coupons,
    };
  }

  /* GET ONE */

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }

    return {
      success: true,
      data: coupon,
    };
  }

  /* UPDATE */

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });

    return {
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    };
  }

  /* DELETE */

  async remove(id: string) {
    await this.prisma.coupon.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Coupon deleted successfully',
    };
  }

  /* VALIDATE COUPON */

  async validateCoupon(code: string, userId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon');
    }

    if (coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon expired');
    }

    /* TOTAL USER LIMIT */

    if (coupon.maxUsers) {
      const totalUsers = await this.prisma.couponUsage.count({
        where: { couponId: coupon.id },
      });

      if (totalUsers >= coupon.maxUsers) {
        throw new BadRequestException('Coupon user limit reached');
      }
    }

    /* USER LIMIT */

    if (coupon.maxUsesPerUser) {
      const usage = await this.prisma.couponUsage.findUnique({
        where: {
          userId_couponId: {
            userId,
            couponId: coupon.id,
          },
        },
      });

      if (usage && usage.usedCount >= coupon.maxUsesPerUser) {
        throw new BadRequestException(
          'You already used this coupon maximum times',
        );
      }
    }

    return coupon;
  }

  /* INCREASE USAGE AFTER ORDER */

  async increaseUsage(userId: string, couponId: string) {
    await this.prisma.couponUsage.upsert({
      where: {
        userId_couponId: {
          userId,
          couponId,
        },
      },
      update: {
        usedCount: {
          increment: 1,
        },
      },
      create: {
        userId,
        couponId,
        usedCount: 1,
      },
    });
  }
}
