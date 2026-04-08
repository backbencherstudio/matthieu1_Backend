import { Injectable } from '@nestjs/common';
import { StripePayment } from '../../../common/lib/Payment/stripe/StripePayment';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class StripeService {
  constructor(private readonly prisma: PrismaService) {}
  async handleWebhook(rawBody: string, sig: string | string[]) {
    return StripePayment.handleWebhook(rawBody, sig);
  }

  async paymentIntentSuccess(paymentIntent: any) {
    try {
      console.log(paymentIntent);
      if (!paymentIntent) {
        throw new Error('Payment intent not found');
      }
      const { order_id } = paymentIntent?.metadata;
      const order = await this.prisma.order.findUnique({
        where: {
          id: order_id,
        },
      });
      console.log(order);
      if (order) {
        const [updateTransaction, updateOrder] = await this.prisma.$transaction(
          [
            this.prisma.paymentTransaction.update({
              where: { order_id: order_id },
              data: {
                status: 'PAID',
                reference_number: paymentIntent?.id,
                paid_currency: paymentIntent?.currency,
                raw_status: paymentIntent?.status,
              },
            }),
            this.prisma.order.update({
              where: {
                id: order_id,
              },
              data: {
                status: 'PAID',
              },
            }),
          ],
        );
        console.log(
          'Transaction and Order updated:',
          updateTransaction,
          updateOrder,
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async paymentIntentFailed(paymentIntent: any) {
    try {
      if (!paymentIntent) {
        throw new Error('Payment intent not found');
      }
      const { order_id } = paymentIntent?.metadata;
      const order = await this.prisma.order.findUnique({
        where: {
          id: order_id,
        },
      });
      if (order) {
        await this.prisma.paymentTransaction.update({
          where: { order_id: order_id },
          data: {
            status: 'FAILED',
            reference_number: paymentIntent?.id,
            paid_currency: paymentIntent?.currency,
            raw_status: paymentIntent?.status,
          },
        });

        await this.prisma.order.update({
          where: {
            id: order_id,
          },
          data: {
            status: 'FAILED',
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async paymentIntentCanceled(paymentIntent: any) {
    try {
      if (!paymentIntent) {
        throw new Error('Payment intent not found');
      }
      const { order_id } = paymentIntent?.metadata;
      const order = await this.prisma.order.findUnique({
        where: {
          id: order_id,
        },
      });
      if (order) {
        await this.prisma.paymentTransaction.update({
          where: { order_id: order_id },
          data: {
            status: 'CANCELED',
            reference_number: paymentIntent?.id,
            paid_currency: paymentIntent?.currency,
            raw_status: paymentIntent?.status,
          },
        });

        await this.prisma.order.update({
          where: {
            id: order_id,
          },
          data: {
            status: 'FAILED',
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
