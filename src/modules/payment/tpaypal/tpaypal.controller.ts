import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TpaypalService } from './tpaypal.service';
import { CreateTpaypalDto } from './dto/create-tpaypal.dto';
import { UpdateTpaypalDto } from './dto/update-tpaypal.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { addMonths } from 'date-fns';

@Controller('tpaypal')
export class TPayPalController {
  constructor(
    private readonly TpaypalService: TpaypalService,
    private readonly prisma: PrismaService
  ) { }


  /** Create a Subscription and get PayPal Approval URL */
  @Get('create')
  async create(@Query('userId') userId: string) {
    const subscription = await this.TpaypalService.createSubscription(userId);
    return {
      approveUrl: subscription.links.find((link) => link.rel === 'approve').href,
    };
  }

  /**  Handle PayPal Success Redirect */
  @Get('success')
  async success(@Query('subscription_id') subscriptionId: string, @Query('localSubId') localSubId: string) {
    const details = await this.TpaypalService.getSubscriptionDetails(subscriptionId, localSubId);
    return { message: 'Subscription Successful', details };
  }

  /**  Handle Cancel */
  @Get('cancel')
  cancel() {
    return { message: 'Subscription Canceled' };
  }


    @Get('yearly/success')
  async successYearly(@Query('subscription_id') subscriptionId: string, @Query('localSubId') localSubId: string) {
    const details = await this.TpaypalService.getYearlySubscriptionDetails(subscriptionId, localSubId);
    return { message: 'Subscription Successful', details };
  }



  @Post('/webhook/paypal')
  async handleWebhook(
    @Body() body: any,
    @Headers('paypal-transmission-id') transmissionId: string,
    @Headers('paypal-transmission-sig') transmissionSig: string,
    @Headers('paypal-cert-url') certUrl: string,
    @Headers('paypal-transmission-time') transmissionTime: string,
    @Headers('paypal-auth-algo') authAlgo: string,

  ) {
    console.log('Received PayPal webhook - Initial acknowledgment');

    const response = { status: 'received' };


    this.processWebhookEvent(
      body,
      transmissionId,
      transmissionSig,
      certUrl,
      transmissionTime,
      authAlgo,
    ).catch(err => {
      console.error('Error in async webhook processing:', err);
    });

    return response;
  }

  // private async processWebhookEvent(
  //   body: any,
  //   transmissionId: string,
  //   transmissionSig: string,
  //   certUrl: string,
  //   transmissionTime: string,
  //   authAlgo: string,
  // ) {
  //   try {
  //     console.log('Starting webhook verification');

  //     const customId = body?.resource?.custom_id;
  //     console.log("custommmmId", customId)
  //       const [_, userId, localSubId] = customId?.split('-') || [];

  //     const isValid = await this.TpaypalService.verifyWebhookSignature(
  //       transmissionId,
  //       transmissionSig,
  //       certUrl,
  //       authAlgo,
  //       transmissionTime,
  //       body
  //     );

  //     if (!isValid) {
  //       console.warn('⚠️ Invalid webhook signature');
  //       return;
  //     }

  //     console.log('Webhook verified successfully');
  //     const { event_type, resource } = body;

  //     switch (event_type) {
  //       case 'BILLING.SUBSCRIPTION.CREATED':
  //         //console.log(`🔄 Handling subscription creation: ${resource.id}`);
  //         await this.handleSubscriptionCreation(resource);
  //         break;

  //       case 'BILLING.SUBSCRIPTION.ACTIVATED':

  //         // let userId: string | undefined;
  //         // let localSubId: string | undefined;
  //           // const [_, userId, localSubId] = customId?.split('-') || [];
  //           // console.log("amiiii update kori from webhook");
  //           console.log(body?.resource)
  //           console.log(userId, localSubId)
  //           if (userId && localSubId) {
  //             console.log("amiiii update kori from webhook");
  //             console.log(userId, localSubId)
  //             const existingSubscription = await this.prisma.subscription.findUnique({
  //               where: {
  //                 id: localSubId,
  //               },
  //             });

  //             let currentPeriodEnd: Date;

  //             if (existingSubscription.type === 'PREMIUM_YEARLY') {
  //               currentPeriodEnd = addMonths(new Date(), 12);
  //             } else {
  //               // Default to monthly if not yearly
  //               currentPeriodEnd = addMonths(new Date(), 1);
  //             }
  //             const updateSubscription = await this.prisma.subscription.update({
  //               where: {
  //                 id: localSubId
  //               },
  //               data: {
  //                 status: 'COMPLETE',
  //                 currentPeriodEnd: currentPeriodEnd,
  //               }
  //             })
  //             console.log(updateSubscription)
  //             if (userId) {
  //               await this.prisma.user.update({
  //                 where: {
  //                   id: userId
  //                 },
  //                 data: {
  //                   subscription_status: 'active',
  //                   subscription_type: updateSubscription.type,
  //                   subscripton_end_date: updateSubscription.currentPeriodEnd

  //                 }
  //               })
  //             }
  //             console.log(`💰oioioioi Handling payment completion: ${resource.id}`);
  //           }
          


  //         console.log(`💰oioioioi Handling payment completion: ${resource.id}`);
  //         await this.handlePaymentCompletion(resource);
  //         break;

  //       default:
  //         console.log(`🤷 Unhandled event type: ${event_type}`);
  //     }
  //   } catch (error) {
  //     console.error('🔥 Webhook processing failed:', error);
  //   }
  // }

 private async processWebhookEvent(
  body: any,
  transmissionId: string,
  transmissionSig: string,
  certUrl: string,
  transmissionTime: string,
  authAlgo: string,
) {
  try {
    console.log(' Starting webhook verification');

    const isValid = await this.TpaypalService.verifyWebhookSignature(
      transmissionId,
      transmissionSig,
      certUrl,
      authAlgo,
      transmissionTime,
      body
    );

    if (!isValid) {
      console.warn('Invalid webhook signature');
      return;
    }

    const { event_type, resource } = body;
    const eventType = event_type?.toUpperCase();

    console.log(' Received PayPal event:', eventType);
    console.log(' Webhook resource:', JSON.stringify(resource, null, 2));

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.CREATED': {
        const customId = resource?.custom_id;
        const [_, userId, localSubId] = customId?.split('-') || [];

        if (userId && localSubId) {
          await this.prisma.subscription.update({
            where: { id: localSubId },
            data: {
              paypalSubscriptionId: resource.id,
              customId,
              status: 'PENDING',
            },
          });
        }

        await this.handleSubscriptionCreation(resource);
        break;
      }

      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionId = resource?.id;

        const existingSubscription = await this.prisma.subscription.findFirst({
          where: { paypalSubscriptionId: subscriptionId },
        });

        if (!existingSubscription) {
          console.warn(' No subscription found for:', subscriptionId);
          return;
        }

        const currentPeriodEnd = existingSubscription.type === 'PREMIUM_YEARLY'
          ? addMonths(new Date(), 12)
          : addMonths(new Date(), 1);

        await this.prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'COMPLETE',
            currentPeriodEnd,
          },
        });

        await this.prisma.user.update({
          where: { id: existingSubscription.userId },
          data: {
            subscription_status: 'active',
            subscription_type: existingSubscription.type,
            subscripton_end_date: currentPeriodEnd,
          },
        });

        console.log(' Subscription marked as CONFIRMED');
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        const customId = resource?.custom_id || resource?.custom;
        let userId: string | undefined;
        let localSubId: string | undefined;

        if (customId) {
          [, userId, localSubId] = customId.split('-');
        }

        if (!userId || !localSubId) {
          const paypalSubId = resource?.billing_agreement_id;
          const subscription = await this.prisma.subscription.findFirst({
            where: { paypalSubscriptionId: paypalSubId },
          });

          if (subscription) {
            userId = subscription.userId;
            localSubId = subscription.id;
          }
        }

        if (userId && localSubId) {
          const existingSubscription = await this.prisma.subscription.findUnique({
            where: { id: localSubId },
          });

          const currentPeriodEnd = existingSubscription.type === 'PREMIUM_YEARLY'
            ? addMonths(new Date(), 12)
            : addMonths(new Date(), 1);

          const updated = await this.prisma.subscription.update({
            where: { id: localSubId },
            data: {
              status: 'COMPLETE',
              currentPeriodEnd,
            },
          });

          await this.prisma.user.update({
            where: { id: userId },
            data: {
              subscription_status: 'active',
              subscription_type: updated.type,
              subscripton_end_date: updated.currentPeriodEnd,
            },
          });

          console.log(`Payment completed for user: ${userId}`);
        } else {
          console.warn('Could not resolve user from payment webhook');
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error('Webhook processing failed:', error);
  }
}



  private async handleSubscriptionCreation(resource: any) {
    console.log(`Creating subscription ${resource.id} in database`);
  }

  private async handlePaymentCompletion(resource: any) {
    console.log(`Processing payment ${resource.id} in database`);
  }
}
