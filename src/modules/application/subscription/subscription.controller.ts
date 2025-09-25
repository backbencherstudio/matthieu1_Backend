

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Logger,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { TpaypalService } from 'src/modules/payment/tpaypal/tpaypal.service';
import { ApplepayService } from 'src/modules/payment/applepay/applepay.service';

interface SubscriptionResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

@ApiTags('Subscription')
@ApiBearerAuth()
@Controller('subscription')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly TpaypalService: TpaypalService,
    private readonly appleService: ApplepayService,
  ) { }

  @Post('create/stripe/monthly')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create monthly Stripe subscription' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request',
  })
  async create(
    @Req() req: Request,
    @Body() body: { paymentMethodId?: string },
  ): Promise<SubscriptionResponse> {
    try {
      const result = await this.subscriptionService.create(
        req.user.userId,
        body.paymentMethodId,
      );
      return {
        success: true,
        message: 'Monthly subscription created successfully',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Failed to create subscription',
        error: error.message,
      });
    }
  }



  @Post('create/stripe/yearly')
  @UseGuards(JwtAuthGuard)
  createYearlySubscription(
    @Req() req: Request,
    @Body() body: { paymentMethodId?: string },
  ) {
    return this.subscriptionService.createYearlySubscriptionStripe(
      req.user.userId,
      body.paymentMethodId,
    );
  }


  // Tohidul Paypal Code-------------------------
  @Post('create/tpaypal/monthlySubscription')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create monthly PayPal subscription' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request',
  })
  async createMonthlyTPaypal(@Req() req: Request) {
    try {

      const subscription = await this.TpaypalService.createSubscription(
        req.user.userId,
      );
      return {
        approveUrl: subscription.links.find((link) => link.rel === 'approve')
          .href,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create monthly PayPal subscription: ${error.message}`,
      );
      throw new BadRequestException({
        success: false,
        message: 'Failed to create PayPal subscription',
        error: error.message,
      });
    }
  }


  @Post('create/tpaypal/yearlySubscription')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create Yearly PayPal subscription' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request',
  })
  async createYearlyTPaypal(@Req() req: Request) {
    try {

      const subscription = await this.TpaypalService.createSubscriptionYearly(
        req.user.userId,
      );
      return {
        approveUrl: subscription.links.find((link) => link.rel === 'approve')
          .href,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create monthly PayPal subscription: ${error.message}`,
      );
      throw new BadRequestException({
        success: false,
        message: 'Failed to create PayPal subscription',
        error: error.message,
      });
    }
  }


  @Get('check/Subscription')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: ' subscription check' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request',
  })
  async subscriptioncheck(@Req() req: Request) {
    try{
     const valid =  await this.subscriptionService.checkAlreadySubscription(req.user.userId)
       return {
        success: true,
        Subscription: valid,
      };
    }
    catch(error){
        throw new BadRequestException({
        success: false,
        message: 'Failed to get subscription',
        error: error.message,
      });
    }
  }
  

  @Post('create/applepay/monthly')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create monthly Apple Pay subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
  })
  async createApplePay(
    @Req() req: Request,
    @Body() body: { receiptData: string }, 
  ): Promise<any> {
    try {
     
      const appleValidationResponse = await this.appleService.verifyReceipt(body.receiptData);

     
      const isActive = this.appleService.isSubscriptionActive(appleValidationResponse);

      if (!isActive) {
        throw new Error('Subscription is not active.');
      }

      
      const result = await this.subscriptionService.createApplePayservice(
        req.user.userId,
        'monthly', 
        appleValidationResponse, 
      );

      return {
        success: true,
        message: 'Monthly Apple Pay subscription created successfully',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Failed to create subscription',
        error: error.message,
      });
    }
  }




  @Post('create/applepay/yearly')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create monthly Apple Pay subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
  })
  async createApplePayYearly(
    @Req() req: Request,
    @Body() body: { receiptData: string }, 
  ): Promise<any> {
    try {
     
      const appleValidationResponse = await this.appleService.verifyReceipt(body.receiptData);

     
      const isActive = this.appleService.isSubscriptionActive(appleValidationResponse);

      if (!isActive) {
        throw new Error('Subscription is not active.');
      }

      
      const result = await this.subscriptionService.createApplePayservice(
        req.user.userId,
        'monthly', 
        appleValidationResponse, 
      );

      return {
        success: true,
        message: 'Monthly Apple Pay subscription created successfully',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'Failed to create subscription',
        error: error.message,
      });
    }
  }






}
