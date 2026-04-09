import { Module } from '@nestjs/common';
import { SaddleAlertService } from './saddle-alert.service';
import { SaddleAlertController } from './saddle-alert.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [SaddleAlertController],
  providers: [SaddleAlertService],
  exports: [SaddleAlertService],
})
export class SaddleAlertModule { }
