import { Controller, Post, Req, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request } from 'express';
import { TransactionRepository } from '../../../common/repository/transaction/transaction.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { addMonths } from 'date-fns';

@Controller('payment/stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request,
  ) {
    try {
      const nextYear = addMonths(new Date(), 12);
      const payload = req.rawBody.toString();
      const event = await this.stripeService.handleWebhook(payload, signature);
      const nextMonth = addMonths(new Date(), 1);
      // Handle events
      switch (event.type) {
        case 'customer.created':
          break;
        case 'payment_intent.created':
          break;
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          // console.log(paymentIntent);
          // await TransactionRepository.updateTransaction({
          //   reference_number: paymentIntent.id,
          //   status: 'succeeded',
          //   paid_amount: paymentIntent.amount / 100, // amount in dollars
          //   paid_currency: paymentIntent.currency,
          //   raw_status: paymentIntent.status,
          // });
          await this.stripeService.paymentIntentSuccess(paymentIntent);
          break;
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object;
          // console.log(failedPaymentIntent);
          await this.stripeService.paymentIntentFailed(failedPaymentIntent);
        // Update transaction status in database
        // await TransactionRepository.updateTransaction({
        //   reference_number: failedPaymentIntent.id,
        //   status: 'failed',
        //   raw_status: failedPaymentIntent.status,
        // });

        case 'payment_intent.canceled':
          const canceledPaymentIntent = event.data.object;
          // Update transaction status in database
          // await TransactionRepository.updateTransaction({
          //   reference_number: canceledPaymentIntent.id,
          //   status: 'canceled',
          //   raw_status: canceledPaymentIntent.status,
          // });
          // console.log(canceledPaymentIntent);
          await this.stripeService.paymentIntentCanceled(canceledPaymentIntent);
          break;
        case 'payment_intent.requires_action':
          const requireActionPaymentIntent = event.data.object;
          // Update transaction status in database
          // await TransactionRepository.updateTransaction({
          //   reference_number: requireActionPaymentIntent.id,
          //   status: 'requires_action',
          //   raw_status: requireActionPaymentIntent.status,
          // });
          break;

        case 'customer.subscription.created':
          const subscription = event.data.object;
          console.log('Your metadata:', subscription.metadata.subscriptionId);
          const existingSubscription =
            await this.prisma.subscription.findUnique({
              where: {
                id: subscription.metadata.subscriptionId,
              },
            });

          let currentPeriodEnd: Date;

          if (existingSubscription.type === 'PREMIUM_YEARLY') {
            currentPeriodEnd = addMonths(new Date(), 12);
          } else {
            // Default to monthly if not yearly
            currentPeriodEnd = addMonths(new Date(), 1);
          }
          const updateSubscription = await this.prisma.subscription.update({
            where: {
              id: subscription.metadata.subscriptionId,
            },
            data: {
              status: 'COMPLETE',
              currentPeriodEnd: currentPeriodEnd,
            },
          });
          console.log(updateSubscription);
          if (subscription.metadata.userId) {
            await this.prisma.user.update({
              where: {
                id: subscription.metadata.userId,
              },
              data: {
                subscription_status: 'active',
                subscription_type: updateSubscription.type,
                subscripton_end_date: updateSubscription.currentPeriodEnd,
              },
            });
          }

          break;

        case 'payout.paid':
          const paidPayout = event.data.object;
          console.log(paidPayout);
          break;
        case 'payout.failed':
          const failedPayout = event.data.object;
          console.log(failedPayout);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error', error);
      return { received: false };
    }
  }
}
