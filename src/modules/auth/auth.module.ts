import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import appConfig from '../../config/app.config';
import { PrismaModule } from '../../prisma/prisma.module';
import { MailModule } from '../../mail/mail.module';
import { NotificationModule } from '../application/notification/notification.module';

import { AccountManagementModule } from './account-management/account-management.module';
import { AccountPrivacyController } from './account-privacy/account-privacy.controller';
import { AccountPrivacyService } from './account-privacy/account-privacy.service';
import { SubscriptionModule } from '../application/subscription/subscription.module';
import { NotificationService } from '../application/notification/notification.service';

@Module({
  imports: [
    PassportModule.register({}),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: appConfig().jwt.secret,
        signOptions: {
          expiresIn: Number(appConfig().jwt.expiry) / 1000,
        },
      }),
    }),
    PrismaModule,
    MailModule,
    NotificationModule,
    AccountManagementModule,
    SubscriptionModule,
  ],
  controllers: [AuthController, AccountPrivacyController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    NotificationService,
    AccountPrivacyService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
