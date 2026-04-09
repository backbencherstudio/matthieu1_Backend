import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { GoogleSubscriptionModule } from './google-subscription/google-subscription.module';
import { BlogModule } from './admin-dashboard/blog/blog.module';
// import { MainproductModule } from './admin-dashboard/product/mainproduct/mainproduct.module';
import { ContactInfoModule } from './admin-dashboard/contact-info/contact-info.module';
import { CartModule } from './user-portal/cart/cart.module';
import { JobPortalModule } from './job-portal/job-portal.module';
import { SaddleAlertModule } from './saddle-alert/saddle-alert.module';
import { SavedProductModule } from './admin-dashboard/saved-product/saved-product.module';
import { TackproductModule } from './admin-dashboard/product/tackproduct/tackproduct.module';
import { ColorSizeModule } from './admin-dashboard/product/color-size/color-size.module';
import { ExpertsModule } from './experts/experts.module';
import { SadllesModule } from './sadlles/sadlles.module';
import { UsedSaddleModule } from './used-saddle/used-saddle.module';
import { CouponModule } from './admin-dashboard/coupon/coupon.module';
import { PaymentModule } from './payment/payment.module';
import { CheckoutAddressModule } from './user-portal/checkout-address/checkout-address.module';
import { OrderModule } from './user-portal/order/order.module';
import { TrySaddleModule } from './try-saddle/try-saddle.module';

@Module({
  imports: [
    NotificationModule,
    ContactModule,
    FaqModule,
    SubscriptionModule,
    GoogleSubscriptionModule,
    BlogModule,
    ContactInfoModule,
    CartModule,
    JobPortalModule,
    SaddleAlertModule,
    SavedProductModule,
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
  ],
})
export class ApplicationModule {}
