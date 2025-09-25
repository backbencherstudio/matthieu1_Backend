import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionType, Status } from '@prisma/client';  // Import enums for SubscriptionType and Status
import axios from 'axios';

@Injectable()
export class GoogleSubscriptionService {
  constructor(private prisma: PrismaService) { }

  // Create Subscription (Initially, set status to PENDING)
  async createSubscription(userId: string, type: SubscriptionType) {
    let price: number;
    let currentPeriodEnd: Date;

    // Set price and currentPeriodEnd based on the subscription type
    switch (type) {
      case SubscriptionType.PREMIUM_MONTHLY:
        price = 4.99;  // Set price for monthly subscription
        currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  // 30 days from now
        break;
      case SubscriptionType.PREMIUM_YEARLY:
        price = 49.99; // Set price for yearly subscription
        currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);  // 365 days from now
        break;
      default:
        throw new BadRequestException('Invalid subscription type');
    }

    try {
      // Create the subscription in the subscription table
      const subscription = await this.prisma.subscription.create({
        data: {
          userId,
          type,
          price,  // Set the price based on the subscription type
          status: Status.PENDING,  // Initially, the subscription is pending until payment is processed
          currentPeriodEnd,        // Set the next payment date
        },
      });

      return subscription;
    } catch (error) {
      throw new BadRequestException('Error creating subscription');
    }
  }

  // Handle Google Pay Payment (Update status to COMPLETE and update user model)
  async handleGooglePayPayment(userId: string, token: string, type: SubscriptionType) {
    let price: number;
    let currentPeriodEnd: Date;

    // Set price and currentPeriodEnd based on the subscription type
    switch (type) {
      case SubscriptionType.PREMIUM_MONTHLY:
        price = 4.99;  // Monthly price
        currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  // 30 days from now
        break;
      case SubscriptionType.PREMIUM_YEARLY:
        price = 49.99; // Yearly price
        currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);  // 1 year from now
        break;
      default:
        throw new BadRequestException('Invalid subscription type');
    }

    try {
      // Verify Google Pay token
      const googlePayData = await this.verifyGooglePayToken(token);

      // Retrieve the subscription for the given userId
      const subscription = await this.prisma.subscription.findFirst({
        where: { userId },
      });

      if (!subscription) {
        throw new BadRequestException('Subscription not found for user');
      }

      // Update the subscription with the Google Pay subscription ID and next payment date
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: Status.COMPLETE,  // Set subscription to 'COMPLETE' after successful payment
          currentPeriodEnd,         // Set the next payment date
        },
      });

      // Now update the user's subscription_type
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          subscripton_end_date: currentPeriodEnd,    // Update subscription end date in user model
          subscription_status: 'active',  // Set user subscription status to active
          subscription_type: type,       // Set the subscription type (PREMIUM_MONTHLY or PREMIUM_YEARLY)
        },
      });

      return updatedSubscription;
    } catch (error) {
      throw new BadRequestException('Error processing Google Pay payment: ' + error.message);
    }
  }

  // Verify Google Pay Token (This would be done by sending it to Google Pay or a payment processor for validation)
  async verifyGooglePayToken(token: string) {
    try {
      // Normally, you would send the token to a payment gateway or Google's API for verification.
      // For simplicity, let's assume the token is valid and return some mock data.

      return {
        subscriptionId: token,  // For simplicity, just returning the token as the subscriptionId
      };
    } catch (error) {
      throw new Error('Google Pay token verification failed: ' + error.message);
    }
  }

  // Cancel Subscription (Set status to CANCELED)
  async cancelSubscription(userId: string) {
    try {
      // Find the subscription by userId
      const subscription = await this.prisma.subscription.findFirst({
        where: { userId },  // Find the subscription by userId
      });

      if (!subscription) {
        throw new BadRequestException('Subscription not found for user');
      }

      // Now update the subscription by using the unique 'id' from the found subscription
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: Status.CANCELED,  // Set status to 'CANCELED'
        },
      });

      // Now update the user's status to canceled as well
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          subscription_status: 'inactive',  // Set user subscription status to inactive
          subscripton_end_date: new Date(), // Set subscription end date to the current date
        },
      });

      return updatedSubscription;
    } catch (error) {
      throw new BadRequestException('Error canceling subscription: ' + error.message);
    }
  }

  // Handle Failed Payment (Set status to CANCELED after a failed payment)
  async handleFailedPayment(userId: string) {
    try {
      // Find the subscription by userId
      const subscription = await this.prisma.subscription.findFirst({
        where: { userId },  // Find the subscription by userId
      });

      if (!subscription) {
        throw new BadRequestException('Subscription not found for user');
      }

      // Now update the subscription by using the unique 'id' from the found subscription
      const updatedSubscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: Status.CANCELED,  // Set status to 'CANCELED' due to failed payment
        },
      });

      // Now update the user's status to canceled as well
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          subscription_status: 'inactive',  // Set user subscription status to inactive
          subscripton_end_date: new Date(), // Set subscription end date to the current date
        },
      });

      return updatedSubscription;
    } catch (error) {
      throw new BadRequestException('Error canceling subscription after failed payment: ' + error.message);
    }
  }
}
