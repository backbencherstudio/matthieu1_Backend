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
import { ContactInfoModule } from './admin-dashboard/contact-info/contact-info.module';
import { ProductModule } from './user-portal/product/product.module';
import { CartModule } from './user-portal/cart/cart.module';


@Module({
  imports: [NotificationModule, ContactModule, FaqModule, SubscriptionModule, GoogleSubscriptionModule, BlogModule, BlogCategoriesModule, CategoryModule, SubcategoryModule, MainproductModule, ContactInfoModule, ProductModule, CartModule],
})
export class ApplicationModule { }
