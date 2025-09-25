import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountManagementService {
  constructor(private prisma: PrismaService) {}

  // Deactivate user account (soft-disable)
  async deactivateAccount(userId: string) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      return {
        success: true,
        message: 'Account deactivated successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Error deactivating account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Reactivate the account (automatic on login if user is inactive)
  async reactivateAccount(userId: string) {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });

      return {
        success: true,
        message: 'Account reactivated successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Error reactivating account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Check if account is deactivated
  async isAccountDeactivated(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user.isActive === false;
  }
}
