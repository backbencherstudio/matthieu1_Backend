import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CreatePaymentDto,
  CreatePaymentIntentDto,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('intent')
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(createPaymentIntentDto);
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
