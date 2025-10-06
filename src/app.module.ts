// external imports
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

// internal imports
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
//import { PaypalModule } from './modules/payment/paypal/paypal.module';
import { SubscriptionModule } from './modules/application/subscription/subscription.module';
import { NotificationModule } from './modules/application/notification/notification.module';


import { GeneralSettingsModule } from './modules/admin/general-setings/general-setings.module';
import { FirebaseGoogleAuthModule } from './modules/firebase-googleauth/firebase-googleauth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DbHeartbeatService } from './db-heartbeat.service';
import { CustomerAlertModule } from './modules/applications/user-portal/customer-alert/customer-alert.module';





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
      // redis: {
      //   host: appConfig().redis.host,
      //   password: appConfig().redis.password,
      //   port: +appConfig().redis.port,
      // },
    }),
    // disabling throttling for dev
    // ThrottlerModule.forRoot([
    //   {
    //     name: 'short',
    //     ttl: 1000,
    //     limit: 3,
    //   },
    //   {
    //     name: 'medium',
    //     ttl: 10000,
    //     limit: 20,
    //   },
    //   {
    //     name: 'long',
    //     ttl: 60000,
    //     limit: 100,
    //   },
    // ]),
    // General modules

      ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
   
    MailModule,
    ApplicationModule,
    NotificationModule,
    AdminModule,
    PaymentModule,
    //PaypalModule,
    SubscriptionModule,
   
    GeneralSettingsModule,
    FirebaseGoogleAuthModule,
    CustomerAlertModule,
  ],
  controllers: [AppController],
  providers: [
    // disabling throttling for dev
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    // disbling throttling for dev {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerBehindProxyGuard,
    // },
    AppService,
    DbHeartbeatService
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');

    // consumer
    //   .apply(RawBodyMiddleware)  // Apply RawBodyMiddleware second
    //   .forRoutes({ path: 'payment/paypal/webhook', method: RequestMethod.POST });


  }
}
