import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { GoogleSubscriptionModule } from './google-subscription/google-subscription.module';
import { BlogModule } from './admin-dashboard/blog/blog.module';
import { BlogCategoriesModule } from './admin-dashboard/blog-categories/blog-categories.module';

@Module({
  imports: [NotificationModule, ContactModule, FaqModule, SubscriptionModule, GoogleSubscriptionModule, BlogModule, BlogCategoriesModule],
})
export class ApplicationModule { }
