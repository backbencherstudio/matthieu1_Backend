import { Controller, Post, Body, Param } from '@nestjs/common';
import { GoogleSubscriptionService } from './google-subscription.service';
import { SubscriptionType } from '@prisma/client';  // Import SubscriptionType enum
@Controller('google-subscription')
export class GoogleSubscriptionController {
  constructor(private readonly googleSubscriptionService: GoogleSubscriptionService) { }

  // Endpoint to create a subscription using userId as parameter
  @Post('create/:userId')  // userId is now a URL parameter
  async createSubscription(
    @Param('userId') userId: string,  // Get userId from URL parameter
    @Body('type') type: SubscriptionType,  // Subscription type (e.g., PREMIUM_MONTHLY)
  ) {
    return this.googleSubscriptionService.createSubscription(userId, type);
  }

  // Endpoint to handle Google Pay payment using userId as parameter
  @Post('google-pay/:userId')  // userId is now a URL parameter
  async handleGooglePayPayment(
    @Param('userId') userId: string,      // Get userId from URL parameter
    @Body('token') token: string,         // Google Pay token
    @Body('type') type: SubscriptionType, // Subscription type (e.g., PREMIUM_MONTHLY)
  ) {
    return this.googleSubscriptionService.handleGooglePayPayment(userId, token, type);
  }

  // Endpoint to cancel the subscription using userId as parameter
  @Post('cancel/:userId')  // userId is now a URL parameter
  async cancelSubscription(
    @Param('userId') userId: string,  // Get userId from URL parameter
  ) {
    return this.googleSubscriptionService.cancelSubscription(userId);
  }

  // Endpoint to handle failed payment and set status to CANCELED
  @Post('failed-payment/:userId')  // userId is now a URL parameter
  async handleFailedPayment(
    @Param('userId') userId: string,  // Get userId from URL parameter
  ) {
    return this.googleSubscriptionService.handleFailedPayment(userId);
  }
}
