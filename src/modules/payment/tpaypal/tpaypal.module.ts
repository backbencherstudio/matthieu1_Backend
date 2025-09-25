import { Module } from '@nestjs/common';
import { TpaypalService } from './tpaypal.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TPayPalController } from './tpaypal.controller';
import { SubscriptionService } from 'src/modules/application/subscription/subscription.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from 'src/modules/application/notification/notification.module';

@Module({
   imports: [PrismaModule, NotificationModule],
  controllers: [TPayPalController],
  providers: [TpaypalService, PrismaService, SubscriptionService
  ],
})
export class TpaypalModule {}
