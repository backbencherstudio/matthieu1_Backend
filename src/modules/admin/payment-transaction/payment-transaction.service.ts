import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRepository } from '../../../common/repository/user/user.repository';

@Injectable()
export class PaymentTransactionService {
  constructor(private prisma: PrismaService) {}

  async findAll(user_id?: string) {
    try {
      const userDetails = await UserRepository.getUserDetails(user_id);

      const whereClause = {};
      if (userDetails.type == 'vendor') {
        whereClause['user_id'] = user_id;
      }

      const paymentTransactions = await this.prisma.paymentTransaction.findMany(
        {
          where: {
            ...whereClause,
          },
          select: {
            id: true,
            reference_number: true,
            status: true,
            provider: true,
            amount: true,
            currency: true,
            paid_amount: true,
            paid_currency: true,
            created_at: true,
            updated_at: true,
          },
        },
      );

      return {
        success: true,
        data: paymentTransactions,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // async findOne(id: string, user_id?: string) {
  //   try {
  //     const userDetails = await UserRepository.getUserDetails(user_id);

  //     const whereClause = {};
  //     if (userDetails.type == 'vendor') {
  //       whereClause['user_id'] = user_id;
  //     }

  //     const paymentTransaction =
  //       await this.prisma.paymentTransaction.findUnique({
  //         where: {
  //           id: id,
  //           ...whereClause,
  //         },
  //         select: {
  //           id: true,
  //           reference_number: true,
  //           status: true,
  //           provider: true,
  //           amount: true,
  //           currency: true,
  //           paid_amount: true,
  //           paid_currency: true,
  //           created_at: true,
  //           updated_at: true,
  //         },
  //       });

  //     if (!paymentTransaction) {
  //       return {
  //         success: false,
  //         message: 'Payment transaction not found',
  //       };
  //     }

  //     return {
  //       success: true,
  //       data: paymentTransaction,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  //dashboard data
  // async dashboardData() {
  //   try {
  //     const totalRevenue = await this.prisma.paymentTransaction.aggregate({
  //       _sum: {
  //         amount: true,
  //       },
  //     });

  //     const totalTransactions = await this.prisma.paymentTransaction.count();

  //     return {
  //       success: true,
  //       data: {
  //         totalRevenue: totalRevenue._sum.amount || 0,
  //         totalTransactions,
  //       },
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  async remove(id: string, user_id?: string) {
    try {
      const userDetails = await UserRepository.getUserDetails(user_id);

      const whereClause = {};
      if (userDetails.type == 'vendor') {
        whereClause['user_id'] = user_id;
      }

      const paymentTransaction =
        await this.prisma.paymentTransaction.findUnique({
          where: {
            id: id,
            ...whereClause,
          },
        });

      if (!paymentTransaction) {
        return {
          success: false,
          message: 'Payment transaction not found',
        };
      }

      await this.prisma.paymentTransaction.delete({
        where: {
          id: id,
        },
      });

      return {
        success: true,
        message: 'Payment transaction deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async dashboardData() {
  const totalRevenue = await this.prisma.subscription.aggregate({
    _sum: {
      price: true,
    },
  });

 
  const yearlyPlans = await this.prisma.subscription.count({
    where: {
      type: 'PREMIUM_YEARLY',
    },
  });

 
  const monthlyPlans = await this.prisma.subscription.aggregate({
    where: {
      type: 'PREMIUM_MONTHLY',
    },
    _sum: {
      price: true,
    },
  });

  return {
    totalRevenue: totalRevenue._sum.price || 0,
    yearlyPlans,
    monthlyPlans: monthlyPlans._sum.price || 0,
  };
}


async getSubscriptionLogs(status: string, plan: string, page: number = 1, pageSize: number = 8) {
  const whereConditions: any = {};

  if (status) {
    whereConditions.status = status;
  }

  if (plan) {
    whereConditions.type = plan;
  }

  // Query the data from the Prisma Subscription model
  const subscriptionLogs = await this.prisma.subscription.findMany({
    where: whereConditions,
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      type: true,
      // paymentMethod: true,
      // card: true,
      // lastPayment: true,
      status: true,
    },
  });

  // Formatting card data to display as masked
  const formattedLogs = subscriptionLogs.map((log) => {
    return {
      user: log.user,
      plan: log.type,
      // paymentMethod: log.paymentMethod,
      // card: `${log.card.substring(0, 4)}****${log.card.substring(12, 16)}`,
      // lastPayment: log.lastPayment,
      status: log.status,
    };
  });

  // Count total subscription logs for pagination (optional)
  const totalLogs = await this.prisma.subscription.count({
    where: whereConditions,
  });

  return {
    logs: formattedLogs,
    totalLogs,
  };
}


}
