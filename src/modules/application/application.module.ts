import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';


import { SubscriptionModule } from './subscription/subscription.module';




import { GoogleSubscriptionModule } from './google-subscription/google-subscription.module';

@Module({
  imports: [NotificationModule, ContactModule, FaqModule,   SubscriptionModule,  GoogleSubscriptionModule],
})
export class ApplicationModule { }
