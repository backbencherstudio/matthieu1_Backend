import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTpaypalDto } from './dto/create-tpaypal.dto';
import { UpdateTpaypalDto } from './dto/update-tpaypal.dto';
import * as paypal from 'paypal-rest-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { addMonths } from 'date-fns';
import { SubscriptionService } from 'src/modules/application/subscription/subscription.service';

@Injectable()
export class TpaypalService {
  constructor(
    private prisma: PrismaService,
    private readonly subscriptionService: SubscriptionService,
    // private configService: ConfigService,
  ) {}
  private readonly webhookId = process.env.PAYPAL_WEBHOOK_ID;
  private clientId = process.env.PAYPAL_CLIENT_ID;
  private clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  private baseUrl = 'https://api-m.sandbox.paypal.com';

  // Get OAuth Token from PayPal
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );
    const response = await axios.post(
      `${this.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data.access_token;
  }

  /** Create a Subscription using your existing Plan */
  async createSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid =
      await this.subscriptionService.checkAlreadySubscription(userId);
    if (valid) {
      return {
        success: false,
        message: 'User already has an active subscription.',
        data: valid,
      };
    }

    const accessToken = await this.getAccessToken();
    const planId = process.env.PAYPAL_PLAN_ID;

    //Create Local DB Subscription
    let newSubscription;
    try {
      const nextMonth = addMonths(new Date(), 1);
      newSubscription = await this.prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'PENDING',
          type: 'PREMIUM_MONTHLY',
          price: 4.99,
          currentPeriodEnd: nextMonth,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to create local subscription: ${err.message}`,
      );
    }

    const response = await axios.post(
      `${this.baseUrl}/v1/billing/subscriptions`,
      {
        plan_id: planId,
        custom_id: `user-${userId}-${newSubscription.id}`,
        application_context: {
          brand_name: 'BLain Cloth App',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `https://dcb65e1f74ec.ngrok-free.app/api/tpaypal/success?localSubId=${newSubscription.id}`,
          cancel_url: 'https://dcb65e1f74ec.ngrok-free.app/api/tpaypal/cancel',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }

  async getSubscriptionDetails(subscriptionId: string, localSubId: string) {
    const accessToken = await this.getAccessToken();
    const response = await axios.get(
      `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    await this.prisma.subscription.update({
      where: { id: localSubId },
      data: {
        paypalSubscriptionId: subscriptionId,
        status: 'PENDING',
        currentPeriodEnd: addMonths(new Date(), 1),
      },
    });
    return response.data;
  }

  async verifyWebhookSignature(
    transmissionId: string,
    transmissionSig: string,
    certUrl: string,
    authAlgo: string,
    transmissionTime: string,
    webhookEvent: any,
  ): Promise<boolean> {
    const accessToken = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          cert_url: certUrl,
          auth_algo: authAlgo,
          webhook_id: this.webhookId,
          webhook_event: webhookEvent,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data.verification_status === 'SUCCESS';
    } catch (error) {
      console.log(`Webhook verification failed: ${error.message}`);
      return false;
    }
  }

  async createSubscriptionYearly(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid =
      await this.subscriptionService.checkAlreadySubscription(userId);
    if (valid) {
      return {
        success: false,
        message: 'User already has an active subscription.',
        data: valid,
      };
    }

    const accessToken = await this.getAccessToken();
    const planId = process.env.PAYPAL_YEARLY_PLAN_ID;

    let newSubscription;
    try {
      const nextYear = addMonths(new Date(), 12);
      newSubscription = await this.prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'PENDING',
          type: 'PREMIUM_YEARLY',
          price: 49.99,
          currentPeriodEnd: nextYear,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to create local subscription: ${err.message}`,
      );
    }

    const response = await axios.post(
      `${this.baseUrl}/v1/billing/subscriptions`,
      {
        plan_id: planId,
        custom_id: `user-${userId}-${newSubscription.id}`,
        application_context: {
          brand_name: 'BLain Cloth App',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `https://dcb65e1f74ec.ngrok-free.app/api/tpaypal/yearly/success?localSubId=${newSubscription.id}`,
          cancel_url: 'https://dcb65e1f74ec.ngrok-free.app/api/tpaypal/cancel',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  }

  async getYearlySubscriptionDetails(
    subscriptionId: string,
    localSubId: string,
  ) {
    const accessToken = await this.getAccessToken();
    const response = await axios.get(
      `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const nextYear = addMonths(new Date(), 12);
    await this.prisma.subscription.update({
      where: { id: localSubId },
      data: {
        paypalSubscriptionId: subscriptionId,
        status: 'PENDING',
        currentPeriodEnd: nextYear,
      },
    });
    return response.data;
  }

  async checkAlreadyHaveSubscription(userId: string) {
    const userSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'COMPLETE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userSubscription;
  }
}
