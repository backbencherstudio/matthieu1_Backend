import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { GoogleSubscriptionModule } from './google-subscription/google-subscription.module';
import { BlogModule } from './admin-dashboard/blog/blog.module';
import { BlogCategoriesModule } from './admin-dashboard/blog-categories/blog-categories.module';
import { CategoryModule } from './admin-dashboard/product/category/category.module';
import { SubcategoryModule } from './admin-dashboard/product/subcategory/subcategory.module';
import { MainproductModule } from './admin-dashboard/product/mainproduct/mainproduct.module';

@Module({
  imports: [NotificationModule, ContactModule, FaqModule, SubscriptionModule, GoogleSubscriptionModule, BlogModule, BlogCategoriesModule, CategoryModule, SubcategoryModule, MainproductModule],
})
export class ApplicationModule { }
