import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { GoogleSubscriptionModule } from './google-subscription/google-subscription.module';
import { BlogModule } from './admin-dashboard/blog/blog.module';
// import { BlogCategoriesModule } from './admin-dashboard/blog-categories/blog-categories.module';
import { SubcategoryModule } from './admin-dashboard/product/subcategory/subcategory.module';
import { MainproductModule } from './admin-dashboard/product/mainproduct/mainproduct.module';
import { ContactInfoModule } from './admin-dashboard/contact-info/contact-info.module';
import { ProductModule } from './user-portal/product/product.module';
import { CartModule } from './user-portal/cart/cart.module';
import { JobPortalModule } from './job-portal/job-portal.module';
import { SaddleAlertModule } from './saddle-alert/saddle-alert.module';
import { SavedProductModule } from './admin-dashboard/saved-product/saved-product.module';
import { MaincategoryModule } from './admin-dashboard/product/maincategory/maincategory.module';
import { MainbaseproductModule } from './admin-dashboard/product/mainbaseproduct/mainbaseproduct.module';
import { ColorSizeModule } from './admin-dashboard/product/color-size/color-size.module';
import { ExpertsModule } from './experts/experts.module';
import { SadllesModule } from './sadlles/sadlles.module';
import { UsedSaddleModule } from './used-saddle/used-saddle.module';

@Module({
  imports: [
    NotificationModule,
    ContactModule,
    FaqModule,
    SubscriptionModule,
    GoogleSubscriptionModule,
    BlogModule,
    SubcategoryModule,
    MainproductModule,
    ContactInfoModule,
    ProductModule,
    CartModule,
    JobPortalModule,
    SaddleAlertModule,
    SavedProductModule,
    MaincategoryModule,
    MainbaseproductModule,
    ColorSizeModule,
    ExpertsModule,
    SadllesModule,
    UsedSaddleModule,
  ],
})
export class ApplicationModule {}
