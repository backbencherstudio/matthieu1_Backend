import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
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

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('stats')
  getStats() {
    return this.paymentService.getStats();
  }
}
