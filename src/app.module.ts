import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import appConfig from './config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

import { MailModule } from './mail/mail.module';
import { ApplicationModule } from './modules/application/application.module';
import { AdminModule } from './modules/admin/admin.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SubscriptionModule } from './modules/application/subscription/subscription.module';
import { NotificationModule } from './modules/application/notification/notification.module';


import { GeneralSettingsModule } from './modules/admin/general-setings/general-setings.module';
import { FirebaseGoogleAuthModule } from './modules/firebase-googleauth/firebase-googleauth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DbHeartbeatService } from './db-heartbeat.service';





@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    BullModule.forRoot({
      connection: {
        host: appConfig().redis.host,
        password: appConfig().redis.password,
        port: +appConfig().redis.port,
      },

    }),


      ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
   
    MailModule,
    ApplicationModule,
    NotificationModule,
    AdminModule,
    PaymentModule,
    SubscriptionModule,
   
    GeneralSettingsModule,
    FirebaseGoogleAuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DbHeartbeatService
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
