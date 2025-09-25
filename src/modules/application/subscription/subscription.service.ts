import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripePayment } from 'src/common/lib/Payment/stripe/StripePayment';
import { PaypalPayment } from 'src/common/lib/Payment/paypal/PaypalPayment';
import appConfig from 'src/config/app.config';
import { addMonths } from 'date-fns';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, Prisma, Subscription } from '@prisma/client';

interface SubscriptionResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  private validatePayPalConfig() {
    const config = appConfig().payment.paypal;
    if (
      !config.product_id ||
      !config.priceid_monthly ||
      !config.priceid_yearly
    ) {
      throw new Error('PayPal product or plan IDs not configured');
    }
  }

  STRIPE_WEBHOOK_SECRET = appConfig().payment.stripe.webhook_secret;
  async create(userId: string, paymentMethodId?: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      const valid = await this.checkAlreadySubscription(userId);
      if (valid) {
        return {
          success: false,
          message: 'User already has an active subscription.',
          data: valid,
        };
      }

      let customerId = user.billing_id;

      // Step 2: Create Stripe Customer if not exists
      if (!customerId) {
        try {
          const stripeCustomer = await StripePayment.createCustomer({
            user_id: user.id,
            email: user.email,
          });

          if (!stripeCustomer)
            throw new Error('Stripe customer creation failed');
          customerId = stripeCustomer.id;

          await this.prisma.user.update({
            where: { id: user.id },
            data: { billing_id: customerId },
          });
        } catch (err) {
          throw new InternalServerErrorException(
            `Failed to create Stripe customer: ${err.message}`,
          );
        }
      }

      // Step 3: Attach and Set Payment Method
      if (paymentMethodId) {
        try {
          await StripePayment.attachCustomerPaymentMethodId({
            customer_id: customerId,
            payment_method_id: paymentMethodId,
          });

          await StripePayment.setCustomerDefaultPaymentMethodId({
            customer_id: customerId,
            payment_method_id: paymentMethodId,
          });
        } catch (err) {
          throw new BadRequestException(
            `Failed to set payment method: ${err.message}`,
          );
        }
      } else {
        throw new BadRequestException('Payment method is required');
      }

      // Step 4: Create Local DB Subscription
      let newSubscription;
      try {
        const nextMonth = addMonths(new Date(), 1);
        newSubscription = await this.prisma.subscription.create({
          data: {
            userId: user.id,
            status: 'PENDING',
            type: 'PREMIUM_MONTHLY',
            currentPeriodEnd: nextMonth,
          },
        });
      } catch (err) {
        throw new InternalServerErrorException(
          `Failed to create local subscription: ${err.message}`,
        );
      }

      // Step 5: Create Stripe Subscription
      const priceId = appConfig().payment.stripe.priceid_monthly;
      let subscription;

      try {
        subscription = await StripePayment.createSubscription(
          customerId,
          priceId,
          newSubscription.id,
          paymentMethodId,
          userId,
        );

        await this.prisma.subscription.update({
          where: { id: newSubscription.id },
          data: {
            stripeSubscriptionId: subscription.id,
            status: 'PENDING',
            price: 4.99,
            //currentPeriodEnd: addMonths(new Date(), 1),
          },
        });
      } catch (err) {
        throw new InternalServerErrorException(
          `Failed to create Stripe subscription: ${err.message}`,
        );
      }

      // Notify the Admin about the new subscription
      // Notify the Admin about the new subscription
      const adminUsers = await this.prisma.user.findMany({
        where: { type: 'admin' },
        select: { id: true },
      });

    for (const admin of adminUsers) {
      await this.notificationService.createNotification({
        receiver_id: admin.id,
        sender_id: user.id,
        message: `New user subscribed via Stripe: ${user.email}`,
        type: subscription,  // Use the enum value here
        post_id: null,
      });
    }


      const invoice = subscription.latest_invoice;
      const paymentIntent = (invoice as any)?.payment_intent;
      //console.log("lastatata lalalalala")
      return {
        success: true,
        message: 'Subscription created',
        data: {
          subscriptionId: subscription.id,
          status:
            subscription.status === 'incomplete' && invoice?.status === 'paid'
              ? 'active'
              : subscription.status,
          clientSecret: paymentIntent?.client_secret || null,
          requiresAction:
            !!paymentIntent && paymentIntent.status === 'requires_action',
        },
      };
    } catch (err) {
      console.error('Subscription creation failed:', err);
      throw err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof InternalServerErrorException
        ? err
        : new InternalServerErrorException('Unexpected error occurred');
    }
  }

  async createYearlySubscriptionStripe(
    userId: string,
    paymentMethodId?: string,
  ) {
    try {
      // Step 1: Find user
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      const valid = await this.checkAlreadySubscription(userId);
      if (valid) {
        return {
          success: false,
          message: 'User already has an active subscription.',
          data: valid,
        };
      }

      let customerId = user.billing_id;

      // Step 2: Create Stripe customer if not exists
      if (!customerId) {
        try {
          const stripeCustomer = await StripePayment.createCustomer({
            user_id: user.id,
            email: user.email,
          });

          if (!stripeCustomer) {
            throw new Error('Stripe customer creation failed');
          }

          customerId = stripeCustomer.id;

          await this.prisma.user.update({
            where: { id: user.id },
            data: { billing_id: customerId },
          });
        } catch (err) {
          throw new InternalServerErrorException(
            `Failed to create Stripe customer: ${err.message}`,
          );
        }
      }

      // Step 3: Attach and set default payment method
      if (paymentMethodId) {
        try {
          await StripePayment.attachCustomerPaymentMethodId({
            customer_id: customerId,
            payment_method_id: paymentMethodId,
          });

          await StripePayment.setCustomerDefaultPaymentMethodId({
            customer_id: customerId,
            payment_method_id: paymentMethodId,
          });
        } catch (err) {
          throw new BadRequestException(
            `Failed to set payment method: ${err.message}`,
          );
        }
      } else {
        throw new BadRequestException('Payment method is required');
      }

      // Step 4: Create local subscription
      let newSubscription;
      try {
        const nextYear = addMonths(new Date(), 12);
        newSubscription = await this.prisma.subscription.create({
          data: {
            userId: user.id,
            status: 'PENDING',
            price: 49.99,
            type: 'PREMIUM_YEARLY',
            currentPeriodEnd: nextYear,
          },
        });
      } catch (err) {
        throw new InternalServerErrorException(
          `Failed to create local subscription: ${err.message}`,
        );
      }

      // Step 5: Create Stripe subscription
      const priceId = appConfig().payment.stripe.priceid_yearly;
      // console.log("saldkxmjqdlkwjdwlkdjlwedjwed", priceId)
      let subscription;
      try {
        subscription = await StripePayment.createSubscription(
          customerId,
          priceId,
          newSubscription.id,
          paymentMethodId,
          userId,
        );
      } catch (err) {
        throw new InternalServerErrorException(
          `Failed to create Stripe subscription: ${err.message}`,
        );
      }

      // Step 6: Update local subscription with Stripe details
      const nextMonth = addMonths(new Date(), 1);
      try {
        await this.prisma.subscription.update({
          where: {
            id: newSubscription.id,
          },
          data: {
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            price: 49.99,
            //status: subscription.status,
            currentPeriodEnd: nextMonth,
          },
        });
      } catch (err) {
        throw new InternalServerErrorException(
          `Failed to update local subscription: ${err.message}`,
        );
      }

      const adminUsers = await this.prisma.user.findMany({
        where: { type: 'admin' },
        select: { id: true },
      });

    for (const admin of adminUsers) {
      await this.notificationService.createNotification({
        receiver_id: admin.id,
        sender_id: user.id,
        message: `New user subscribed yearly via Stripe: ${user.email}`,
        type: 'subscription',  // Assuming you are using 'subscription' as the notification type
        post_id: null,
      });
    }

      // Step 7: Return payment intent if available
      const invoice = subscription.latest_invoice;
      const paymentIntent = (invoice as any)?.payment_intent;

      return {
        success: true,
        message: 'Subscription created',
        data: {
          subscriptionId: subscription.id,
          status:
            subscription.status === 'incomplete' && invoice?.status === 'paid'
              ? 'active'
              : subscription.status,
        },
      };
    } catch (err) {
      console.error('Yearly subscription creation failed:', err);
      throw err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof InternalServerErrorException
        ? err
        : new InternalServerErrorException('Unexpected error occurred');
    }
  }


  async handlePaypalSubscriptionSuccess(paypalSubscriptionId: string) {
    const subscription = await this.prisma.Subscription.findUnique({
      where: { paypalSubscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const paypalSubscriptionDetails =
      await PaypalPayment.getSubscription(paypalSubscriptionId);

    await this.prisma.Subscription.update({
      where: { id: subscription.id },
      data: {
        // status: paypalSubscriptionDetails.status,
        status: 'ACTIVE',
        currentPeriodEnd: new Date(
          paypalSubscriptionDetails.billing_info?.next_billing_time ||
            Date.now() + 30 * 24 * 60 * 60 * 1000,
        ),
      },
    });

    return { success: true, message: 'PayPal subscription activated.' };
  }

  async checkAlreadySubscription(userId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'COMPLETE',
        currentPeriodEnd: {
          gte: new Date(),
        },
      },
      orderBy: {
        currentPeriodEnd: 'desc',
      },
    });

    return !!subscription;
  }
  

  async createApplePayservice(
  userId: string,
  subscriptionType: string,
  appleValidationResponse: any,
): Promise<any> {
  const latestReceiptInfo = appleValidationResponse?.latest_receipt_info?.[0];
  if (!latestReceiptInfo) throw new Error('No latest_receipt_info found.');
  if (!latestReceiptInfo.transaction_id) throw new Error('Missing transaction_id.');

  // kept your original date handling
  const expirationDate = new Date(parseInt(latestReceiptInfo.expires_date_ms, 10));
  const currentPeriodEnd = addMonths(new Date(), 1);

  const mappedType =
    subscriptionType === 'monthly' ? 'PREMIUM_MONTHLY' : 'PREMIUM_YEARLY';

  try {
    const result = await this.prisma.$transaction(async (tx) => {
      const newSubscription = await tx.subscription.create({
        data: {
          userId,
          type: mappedType,
          appleSubscriptionId: latestReceiptInfo.transaction_id,
          status: 'COMPLETE',
          currentPeriodEnd: currentPeriodEnd,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          subscription_status: 'active',
          subscription_type: newSubscription.type,
          subscripton_end_date: newSubscription.currentPeriodEnd,
        },
      });

      return newSubscription;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return result;
  } catch (err: any) {
    throw err;
  }
}

  // Method to check the current subscription status (active or expired)
  async getSubscriptionStatus(userId: string): Promise<string> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
    });

    if (!subscription) {
      throw new Error('No subscription found for this user.');
    }

    const currentTimestamp = Date.now();
    if (subscription.currentPeriodEnd.getTime() < currentTimestamp) {
      return 'expired'; // Subscription expired
    }

    return 'active'; // Subscription still active
  }
}
