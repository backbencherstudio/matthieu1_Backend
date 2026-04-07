import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreatePaymentDto,
  CreatePaymentIntentDto,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripePayment } from 'src/common/lib/Payment/stripe/StripePayment';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  private generateTransactionId(): string {
    const randomDigits = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    return `TXN-${randomDigits}`;
  }

  private async generateUniqueTransactionId(): Promise<string> {
    let transactionId: string;
    let isUnique = false;

    while (!isUnique) {
      transactionId = this.generateTransactionId();
      const existingTxn = await this.prisma.paymentTransaction.findUnique({
        where: { custom_transaction_id: transactionId },
      });
      isUnique = !existingTxn;
    }

    return transactionId;
  }

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto) {
    try {
      const { order_id } = createPaymentIntentDto;
      const order = await this.prisma.order.findUnique({
        where: { id: order_id },
        include: { address: true, payment_transaction: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }
      let paymentIntent;

      if (
        order.status === 'PAID' ||
        order.payment_transaction?.status === 'PAID'
      ) {
        throw new Error('Order already paid');
      }

      if (
        order.payment_transaction &&
        order.payment_transaction.payment_intent_id &&
        order.payment_transaction.client_secret
      ) {
        paymentIntent = {
          client_secret: order.payment_transaction.client_secret,
          payment_intent_id: order.payment_transaction.payment_intent_id,
        };
      } else {
        if (order.userId) {
          const user = await this.prisma.user.findUnique({
            where: { id: order.userId },
          });

          if (!user) {
            throw new BadRequestException('User not found');
          }

          paymentIntent = await StripePayment.createOneTimePaymentIntent({
            amount: order.total,
            currency: order?.currency?.trim()?.toLowerCase() || 'usd',
            metadata: {
              order_id: order.id,
              session_id: order.sessionId || '',
              user_id: user.id,
            },
            ...(user.email || order.address?.email
              ? { receipt_email: user.email || order.address.email }
              : {}),
          });

          const custom_txn_id = await this.generateUniqueTransactionId();
          await this.prisma.paymentTransaction.create({
            data: {
              custom_transaction_id: custom_txn_id,
              order_id: order.id,
              user_id: user.id,
              payment_intent_id: paymentIntent.id,
              client_secret: paymentIntent.client_secret,
              amount: order.total,
              currency: order?.currency?.trim()?.toLowerCase() || 'usd',
              status: 'pending',
              type: 'order',
            },
          });
        } else {
          paymentIntent = await StripePayment.createOneTimePaymentIntent({
            amount: order.total,
            currency: order?.currency?.trim()?.toLowerCase() || 'usd',
            metadata: {
              order_id: order.id,
              session_id: order.sessionId || '',
            },
            ...(order.address?.email
              ? { receipt_email: order.address.email }
              : {}),
          });

          const custom_txn_id = await this.generateUniqueTransactionId();
          await this.prisma.paymentTransaction.create({
            data: {
              custom_transaction_id: custom_txn_id,
              order_id: order.id,
              payment_intent_id: paymentIntent?.id,
              client_secret: paymentIntent?.client_secret,
              amount: order.total,
              currency: order?.currency?.trim()?.toLowerCase() || 'usd',
              status: 'pending',
              type: 'order',
            },
          });
        }
      }

      return {
        success: true,
        message: 'Payment intent created successfully',
        data: {
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Payment intent creation failed',
      };
    }
  }

  async verifyPayment(intent_id: string) {
    try {
      const paymentIntent =
        await StripePayment.retrievePaymentIntent(intent_id);

      const order = await this.prisma.order.findUnique({
        where: { id: paymentIntent?.metadata?.order_id },
        include: { payment_transaction: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (
        paymentIntent.status !== 'succeeded' ||
        order.status !== 'PAID' ||
        order.payment_transaction?.status !== 'PAID'
      ) {
        throw new Error('Payment intent verification failed');
      }

      return {
        success: true,
        message: 'Payment intent verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Payment intent verification failed',
      };
    }
  }

  async getAllTransaction(query: {
    search: string;
    status: 'all' | 'pending' | 'paid' | 'failed' | 'cancelled';
    duration: 'all' | 'day' | 'week' | 'month' | 'year';
    page: number;
    limit: number;
  }) {
    try {
      const { search, status, duration, page = 1, limit = 10 } = query;
      const pageNumber = Number(page) || 1;
      const limitNumber = Number(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;
      const where: Prisma.PaymentTransactionWhereInput = {};
      if (search) {
        where.OR = [
          { custom_transaction_id: { contains: search } },
          { payment_intent_id: { contains: search } },
        ];
      }
      if (status !== 'all') {
        switch (status) {
          case 'pending':
            where.status = 'PENDING';
            break;
          case 'paid':
            where.status = 'PAID';
            break;
          case 'failed':
            where.status = 'FAILED';
            break;
          case 'cancelled':
            where.status = 'CANCELLED';
            break;
        }
      }
      const startOfDay = (date: Date): Date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      const endOfDay = (date: Date): Date => {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
      };

      if (duration !== 'all') {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        switch (duration) {
          case 'day':
            where.created_at = {
              gte: todayStart,
              lt: todayEnd, // Ajker puro din (23:59:59 porjonto)
            };
            break;
          case 'week':
            where.created_at = {
              gte: startOfDay(
                new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
              ),
              lt: todayStart, // Ajker 00:00 theke pichone 7 din shuru theke
            };
            break;
          case 'month':
            where.created_at = {
              gte: startOfDay(
                new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
              ),
              lt: todayStart,
            };
            break;
          case 'year':
            where.created_at = {
              gte: startOfDay(
                new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
              ),
              lt: todayStart,
            };
        }
      }
      const transactions = await this.prisma.paymentTransaction.findMany({
        where,
        skip,
        take: limitNumber,
      });
      const total = await this.prisma.paymentTransaction.count({
        where,
      });
      return {
        success: true,
        message: 'Transactions fetched successfully',
        data: transactions,
        meta_data: {
          page: pageNumber,
          limit: limitNumber,
          total,
          search,
          status,
          duration,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch transactions',
      };
    }
  }

  async getStats() {
    try {
      const totalTransactions = await this.prisma.paymentTransaction.count();
      const pendingTransactions = await this.prisma.paymentTransaction.count({
        where: { status: 'PENDING' },
      });
      const paidTransactions = await this.prisma.paymentTransaction.count({
        where: { status: 'PAID' },
      });
      const failedTransactions = await this.prisma.paymentTransaction.count({
        where: { status: 'FAILED' },
      });
      const cancelledTransactions = await this.prisma.paymentTransaction.count({
        where: { status: 'CANCELLED' },
      });
      return {
        success: true,
        message: 'Stats fetched successfully',
        data: {
          total_transactions: totalTransactions,
          pending_transactions: pendingTransactions,
          paid_transactions: paidTransactions,
          failed_transactions: failedTransactions,
          cancelled_transactions: cancelledTransactions,
          success_rate: (paidTransactions / totalTransactions) * 100,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Failed to fetch stats',
      };
    }
  }
}
