import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreatePaymentDto,
  CreatePaymentIntentDto,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripePayment } from 'src/common/lib/Payment/stripe/StripePayment';

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

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
