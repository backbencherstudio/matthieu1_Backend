import { Module } from '@nestjs/common';
import { FirebaseGoogleAuthService } from './firebase-googleauth.service';
import { FirebaseGoogleAuthController } from './firebase-googleauth.controller';
import { FirebaseAdminService } from './firebase-admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../application/notification/notification.module';
import { StringValue } from 'ms';
// NOTE: NotificationModule should export NotificationService & NotificationGateway.
// If it doesn't, either export them there or add them to `providers` here.
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_jwt_secret',
      // signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as StringValue,
      },
    }),
    NotificationModule,
  ],
  controllers: [FirebaseGoogleAuthController],
  providers: [
    FirebaseGoogleAuthService,
    FirebaseAdminService,
    PrismaService,
    // Do NOT add NotificationService / NotificationGateway here if NotificationModule already provides & exports them
  ],
  exports: [FirebaseGoogleAuthService],
})
export class FirebaseGoogleAuthModule {}
