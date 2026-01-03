import { Module } from '@nestjs/common';
import { ContactInfosService } from './contact-infos.service';
import { ContactInfosController } from './contact-infos.controller';

@Module({
  controllers: [ContactInfosController],
  providers: [ContactInfosService],
})
export class ContactInfosModule {}
