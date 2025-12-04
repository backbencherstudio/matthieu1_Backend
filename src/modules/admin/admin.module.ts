import { Module } from '@nestjs/common';
import { FaqModule } from './faq/faq.module';
import { ContactModule } from './contact/contact.module';
import { WebsiteInfoModule } from './website-info/website-info.module';
import { PaymentTransactionModule } from './payment-transaction/payment-transaction.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { GeneralSettingsModule } from './general-setings/general-setings.module';
import { SystemSettingsModule } from './system-setings/system-setings.module';
import { TeamsModule } from './teams/teams.module';
import { AmbassadorModule } from './ambassador/ambassador.module';
import { CompetitionModule } from './competition/competition.module';
import { ContactInfoModule } from './contact-info/contact-info.module';
import { ContactUsModule } from './contact_us/contact_us.module';



@Module({
  imports: [
    FaqModule,
    ContactModule,
    WebsiteInfoModule,
    PaymentTransactionModule,
    UserModule,
    NotificationModule,
    GeneralSettingsModule,
    SystemSettingsModule,
    TeamsModule,
    AmbassadorModule,
    CompetitionModule,
    ContactInfoModule,
    ContactUsModule,

  ],
})
export class AdminModule { }
