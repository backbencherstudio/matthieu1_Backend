import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TpaypalService } from 'src/modules/payment/tpaypal/tpaypal.service';
import { ApplepayService } from 'src/modules/payment/applepay/applepay.service';

@Module({
  imports:[
    NotificationModule,
    PrismaModule
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, PrismaService, TpaypalService, ApplepayService],
  exports: [SubscriptionService], 
})
export class SubscriptionModule {}
