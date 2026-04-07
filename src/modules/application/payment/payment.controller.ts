import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('intent')
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(createPaymentIntentDto);
  }

  @Get('verify/:intent_id')
  verifyPayment(@Param('intent_id') intent_id: string) {
    return this.paymentService.verifyPayment(intent_id);
  }

  @Get('transactions')
  getAllTransaction(
    @Query()
    query: {
      search: string;
      status: 'all' | 'pending' | 'paid' | 'failed' | 'cancelled';
      duration: 'all' | 'day' | 'week' | 'month' | 'year';
      page: number;
      limit: number;
    },
  ) {
    return this.paymentService.getAllTransaction(query);
  }

  @Get('stats')
  getStats() {
    return this.paymentService.getStats();
  }
}
