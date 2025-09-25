import { Module } from '@nestjs/common';
import { StripeModule } from './stripe/stripe.module';
import { TpaypalModule } from './tpaypal/tpaypal.module';
import { ApplepayModule } from './applepay/applepay.module';

@Module({
  imports: [StripeModule, TpaypalModule, ApplepayModule],
})
export class PaymentModule {}
