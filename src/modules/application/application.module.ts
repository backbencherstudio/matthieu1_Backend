import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { GoogleSubscriptionModule } from './google-subscription/google-subscription.module';
import { BlogModule } from './admin-dashboard/blog/blog.module';
<<<<<<< HEAD
// import { BlogCategoriesModule } from './admin-dashboard/blog-categories/blog-categories.module';
import { SubcategoryModule } from './admin-dashboard/product/subcategory/subcategory.module';
import { MainproductModule } from './admin-dashboard/product/mainproduct/mainproduct.module';
=======
// import { MainproductModule } from './admin-dashboard/product/mainproduct/mainproduct.module';
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
import { ContactInfoModule } from './admin-dashboard/contact-info/contact-info.module';
import { CartModule } from './user-portal/cart/cart.module';
import { JobPortalModule } from './job-portal/job-portal.module';
import { SaddleAlertModule } from './saddle-alert/saddle-alert.module';
import { SavedProductModule } from './admin-dashboard/saved-product/saved-product.module';
import { TackproductModule } from './admin-dashboard/product/tackproduct/tackproduct.module';
import { ColorSizeModule } from './admin-dashboard/product/color-size/color-size.module';
import { ExpertsModule } from './experts/experts.module';
import { SadllesModule } from './sadlles/sadlles.module';
<<<<<<< HEAD
=======
import { UsedSaddleModule } from './used-saddle/used-saddle.module';
import { CouponModule } from './admin-dashboard/coupon/coupon.module';
import { PaymentModule } from './payment/payment.module';
import { CheckoutAddressModule } from './user-portal/checkout-address/checkout-address.module';
import { OrderModule } from './user-portal/order/order.module';
import { TrySaddleModule } from './try-saddle/try-saddle.module';
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89

@Module({
  imports: [
    NotificationModule,
    ContactModule,
    FaqModule,
    SubscriptionModule,
    GoogleSubscriptionModule,
    BlogModule,
<<<<<<< HEAD
    SubcategoryModule,
    MainproductModule,
    ContactInfoModule,
    ProductModule,
=======
    ContactInfoModule,
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
    CartModule,
    JobPortalModule,
    SaddleAlertModule,
    SavedProductModule,
<<<<<<< HEAD
    MaincategoryModule,
    MainbaseproductModule,
    ColorSizeModule,
    ExpertsModule,
    SadllesModule,
=======
    TackproductModule,
    ColorSizeModule,
    ExpertsModule,
    SadllesModule,
    UsedSaddleModule,
    CouponModule,
    PaymentModule,
    CheckoutAddressModule,
    OrderModule,
    TrySaddleModule,
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
  ],
})
export class ApplicationModule {}
