import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRepository } from '../../../common/repository/user/user.repository';
import appConfig from '../../../config/app.config';
import { FileStorage } from '../../../common/lib/Disk/FileStorage';
import { DateHelper } from '../../../common/helper/date.helper';
import { sub } from 'date-fns';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await UserRepository.createUser(createUserDto);

      if (user.success) {
        return {
          success: user.success,
          message: user.message,
        };
      } else {
        return {
          success: user.success,
          message: user.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }


 

//   async findAll({
//   q,
//   type,
//   approved,
//   page = 1,
//   limit = 10,
// }: {
//   q?: string;
//   type?: string;
//   approved?: string;
//   page?: number;
//   limit?: number;
// }) {
//   try {
//     const where_condition: any = {};

//     if (q) {
//       where_condition['OR'] = [
//         { name: { contains: q, mode: 'insensitive' } },
//         { email: { contains: q, mode: 'insensitive' } },
//       ];
//     }

//     if (type) {
//       where_condition['type'] = type;
//     }

//     if (approved) {
//       where_condition['approved_at'] =
//         approved === 'approved' ? { not: null } : { equals: null };
//     }

    
//     const skip = (page - 1) * limit;

    
//     const totalItems = await this.prisma.user.count({
//       where: where_condition,
//     });

  
//     const users = await this.prisma.user.findMany({
//       where: where_condition,
//       skip,
//       take: limit,
//       orderBy: { created_at: 'desc' }, 
//     });

//     const sanitizedUsers = [];

//     for (const user of users) {
//       const subscription = await this.prisma.subscription.findFirst({
//         where: { userId: user.id },
//         orderBy: { createdAt: 'desc' },
//       });

//       const subscription_status =
//         subscription &&
//           subscription.status === 'COMPLETE' &&
//           subscription.currentPeriodEnd > new Date()
//           ? 'active'
//           : 'inactive';

    
//       await this.prisma.user.update({
//         where: { id: user.id },
//         data: { subscription_status },
//       });

    
//       sanitizedUsers.push({
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         username: user.username,
//         created_at: user.created_at,
//         updated_at: user.updated_at,
//         status: user.status,
//         isActive: user.isActive,
//         subscription_status,
//         type: user.type,
//         subscription_type: user.subscription_type,
//       });
//     }

//     const totalPages = Math.ceil(totalItems / limit);

//     return {
//       success: true,
//       data: sanitizedUsers,
//       pagination: {
//         currentPage: page,
//         totalPages,
//         totalItems,
//         itemsPerPage: limit,
//         hasNext: page < totalPages,
//         hasPrev: page > 1,
//       },
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// }


async findAll({
  q,
  type,
  approved,
  page = 1,
  limit = 10,
 
  status,
  subscription_type,
}: {
  q?: string;
  type?: string;
  approved?: string;
  page?: number;
  limit?: number;
  
  status?: string;
  subscription_type?: string;
}) {
  try {
    const where_condition: any = {};

    if (q) {
      where_condition['OR'] = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where_condition['type'] = type;
    }

    if (approved) {
      where_condition['approved_at'] =
        approved === 'approved' ? { not: null } : { equals: null };
    }

   

    // ✅ Subscription status filter (active/inactive)
    if (status) {
      where_condition['subscription_status'] = status;
    }

    // ✅ Subscription type filter (FREE, MONTHLY, YEARLY)
    if (subscription_type) {
      where_condition['subscription_type'] = subscription_type.toUpperCase();
    }

    const skip = (page - 1) * limit;

    const totalItems = await this.prisma.user.count({
      where: where_condition,
    });

    const users = await this.prisma.user.findMany({
      where: where_condition,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    // … (keep the subscription check + sanitization you already wrote)

    const sanitizedUsers = [];
    for (const user of users) {
      const subscription = await this.prisma.subscription.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      const subscription_status =
        subscription &&
        subscription.status === 'COMPLETE' &&
        subscription.currentPeriodEnd > new Date()
          ? 'active'
          : 'inactive';

      await this.prisma.user.update({
        where: { id: user.id },
        data: { subscription_status },
      });

      sanitizedUsers.push({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
        updated_at: user.updated_at,
        status: user.status,
        isActive: user.isActive,
        subscription_status,
        type: user.type,
        subscription_type: user.subscription_type,
      });
    }

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      data: sanitizedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}


  async approve(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: id },
      });
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }
      await this.prisma.user.update({
        where: { id: id },
        data: { approved_at: DateHelper.now() },
      });
      return {
        success: true,
        message: 'User approved successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async reject(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: id },
      });
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }
      await this.prisma.user.update({
        where: { id: id },
        data: { approved_at: null },
      });
      return {
        success: true,
        message: 'User rejected successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await UserRepository.updateUser(id, updateUserDto);

      if (user.success) {
        return {
          success: user.success,
          message: user.message,
        };
      } else {
        return {
          success: user.success,
          message: user.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async remove(id: string) {
    try {
      const user = await UserRepository.deleteUser(id);
      return user;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }


  async getUserChart() {
    const currentYear = new Date().getFullYear();
    // Initialize data structures
    const newSubscriptions = {
      FREE: Array(12).fill(0),
      PREMIUM: Array(12).fill(0)
    };

    const activeSubscriptions = {
      FREE: Array(12).fill(0),
      PREMIUM: Array(12).fill(0)
    };

    // Get all subscriptions created in the current year
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        OR: [
          {
            createdAt: {
              gte: new Date(`${currentYear}-01-01`),
              lt: new Date(`${currentYear + 1}-01-01`)
            }
          },
          {
            currentPeriodEnd: {
              gte: new Date(`${currentYear}-01-01`)
            }
          }
        ],
        type: {
          not: null
        }
      },
      select: {
        type: true,
        createdAt: true,
        currentPeriodEnd: true,
        status: true
      }
    });


    // Process each month
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);

      // Count new subscriptions
      const newSubs = subscriptions.filter(sub =>
        sub.createdAt >= monthStart && sub.createdAt <= monthEnd
      );

      newSubs.forEach(sub => {
        if (sub.type === 'FREE') {
          newSubscriptions.FREE[month]++;
        } else if (sub.type === 'PREMIUM_MONTHLY' || sub.type === 'PREMIUM_YEARLY') {
          newSubscriptions.PREMIUM[month]++;
        }
      });

      // Count active subscriptions (currentPeriodEnd is after month start)
      const activeSubs = subscriptions.filter(sub =>
        sub.currentPeriodEnd >= monthStart &&
        (sub.status === 'COMPLETE' || sub.status === 'PENDING')
      );

      activeSubs.forEach(sub => {
        if (sub.type === 'FREE') {
          activeSubscriptions.FREE[month]++;
        } else if (sub.type === 'PREMIUM_MONTHLY' || sub.type === 'PREMIUM_YEARLY') {
          activeSubscriptions.PREMIUM[month]++;
        }
      });
    }

    // Prepare the response
    const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const series = [
      {
        name: "New FREE",
        data: newSubscriptions.FREE
      },
      {
        name: "New PREMIUM",
        data: newSubscriptions.PREMIUM
      },
      {
        name: "Active FREE",
        data: activeSubscriptions.FREE
      },
      {
        name: "Active PREMIUM",
        data: activeSubscriptions.PREMIUM
      }
    ];

    return {
      categories,
      series
    };
  }



  async getuserRevenueChart() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        currentPeriodEnd: {
          gte: startOfYear,
        },
        status: 'COMPLETE', 
      },
      select: {
        paypalSubscriptionId: true,
        stripeSubscriptionId: true,
        price: true,
        currentPeriodEnd: true,
      },
    });

    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueData = {
      paypal: Array(12).fill(0),
      stripe: Array(12).fill(0),
      other: Array(12).fill(0),
    };

    
    subscriptions.forEach(sub => {
      const month = sub.currentPeriodEnd.getMonth(); // 0-11
      const amount = parseInt(String(sub.price ?? '0'));

      if (sub.paypalSubscriptionId) {
        revenueData.paypal[month] += amount;
      } else if (sub.stripeSubscriptionId) {
        revenueData.stripe[month] += amount;
      } else {
        revenueData.other[month] += amount;
      }
    });

    
    return {
      categories: months,
      series: [
        {
          name: "PayPal",
          data: revenueData.paypal,
        },
        {
          name: "Stripe",
          data: revenueData.stripe,
        },
        {
          name: "Other",
          data: revenueData.other,
        },
      ],
    };
  }


   async getdashBoardData() {
    const totalUsers = await this.prisma.user.count({
        where: {
            deleted_at: null 
        }
    });

   
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);
    
    const activeSubscriptions = await this.prisma.subscription.count({
        where: {
            status: 'COMPLETE',
            currentPeriodEnd: {
                gte: twelveWeeksAgo
            }
        }
    });

    
    const fiveWeeksAgo = new Date();
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 5 * 7);
    
    const monthlyRevenueSubscriptions = await this.prisma.subscription.findMany({
        where: {
            currentPeriodEnd: {
                gte: fiveWeeksAgo
            },
            status: 'COMPLETE'
        },
        select: {
            price: true
        }
    });

   
    let monthlyRevenue = 0;
    monthlyRevenueSubscriptions.forEach(sub => {
        const price = parseFloat(String(sub.price ?? '0'));
        monthlyRevenue += price;
    });

    return {
        totalUsers,
        activeSubscriptions: activeSubscriptions,
        monthlyRevenue: Math.round(monthlyRevenue) 
    };
}

}
