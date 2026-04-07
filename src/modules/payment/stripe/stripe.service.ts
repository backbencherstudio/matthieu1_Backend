import { Injectable } from '@nestjs/common';
import { StripePayment } from '../../../common/lib/Payment/stripe/StripePayment';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StripeService {
  constructor(private readonly prisma: PrismaService) {}
  async handleWebhook(rawBody: string, sig: string | string[]) {
    return StripePayment.handleWebhook(rawBody, sig);
  }

  async paymentIntentSuccess(paymentIntent: any) {
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
        await this.prisma.order.update({
          where: {
            id: order_id,
          },
          data: {
            status: 'PAID',
            payment_transaction: {
              update: {
                status: 'PAID',
                reference_number: paymentIntent?.id,
                paid_currency: paymentIntent?.currency,
                raw_status: paymentIntent?.status,
              },
            },
          },
        });
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
        await this.prisma.order.update({
          where: {
            id: order_id,
          },
          data: {
            status: 'FAILED',
            payment_transaction: {
              update: {
                status: 'FAILED',
                reference_number: paymentIntent?.id,
                paid_currency: paymentIntent?.currency,
                raw_status: paymentIntent?.status,
              },
            },
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
        await this.prisma.order.update({
          where: {
            id: order_id,
          },
          data: {
            status: 'FAILED',
            payment_transaction: {
              update: {
                status: 'CANCELED',
                reference_number: paymentIntent?.id,
                paid_currency: paymentIntent?.currency,
                raw_status: paymentIntent?.status,
              },
            },
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
