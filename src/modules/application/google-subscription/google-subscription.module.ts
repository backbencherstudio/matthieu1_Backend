import { Module } from '@nestjs/common';
import { GoogleSubscriptionService } from './google-subscription.service';
import { GoogleSubscriptionController } from './google-subscription.controller';

@Module({
  controllers: [GoogleSubscriptionController],
  providers: [GoogleSubscriptionService],
})
export class GoogleSubscriptionModule {}
