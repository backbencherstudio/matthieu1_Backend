import { Module } from '@nestjs/common';
import { CustomerAlertService } from './customer-alert.service';
import { CustomerAlertController } from './customer-alert.controller';

@Module({
  controllers: [CustomerAlertController],
  providers: [CustomerAlertService],
})
export class CustomerAlertModule {}
