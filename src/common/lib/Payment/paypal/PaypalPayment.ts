// src/common/lib/Payment/paypal/PaypalPayment.ts
import appConfig from '../../../../config/app.config';
import { Fetch } from '../../Fetch';
import { Logger } from '@nestjs/common';

interface PayPalApiResponse {
  data: any;
  status: number;
}

interface PayPalProduct {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
}

interface PayPalPlan {
  id: string;
  product_id: string;
  name: string;
  status: string;
  billing_cycles: any[];
}

interface PayPalSubscription {
  id: string;
  status: string;
  plan_id: string;
  subscriber: {
    email_address: string;
  };
  approval_url?: string;
}

const PAYPAL_API_BASE_URL = appConfig().payment.paypal.api;
const PAYPAL_CLIENT_KEY = appConfig().payment.paypal.client_key;
const PAYPAL_SECRET_KEY = appConfig().payment.paypal.secret_key;

export class PaypalPayment {
  private static readonly logger = new Logger('PaypalPayment');
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  private static validateConfig() {
    if (!PAYPAL_API_BASE_URL || !PAYPAL_CLIENT_KEY || !PAYPAL_SECRET_KEY) {
      throw new Error(
        'PayPal configuration is incomplete. Please check your environment variables.',
      );
    }
  }

  private static async retryOperation<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === this.MAX_RETRIES) throw error;
        this.logger.warn(
          `API call failed, retrying (${attempt}/${this.MAX_RETRIES}): ${error.message}`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, this.RETRY_DELAY * attempt),
        );
      }
    }
    throw new Error('Operation failed after maximum retries');
  }

  private static async getAccessToken(): Promise<string> {
    this.validateConfig();

    const authString = Buffer.from(
      `${PAYPAL_CLIENT_KEY}:${PAYPAL_SECRET_KEY}`,
    ).toString('base64');
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authString}`,
    };
    const body = 'grant_type=client_credentials';

    const response = await Fetch.post(
      `${PAYPAL_API_BASE_URL}/v1/oauth2/token`,
      body,
      { headers },
    );
    return response.data.access_token;
  }

  /**
   * Creates a PayPal product. Products are required to create subscription plans.
   * @param name Product name
   * @param description Product description
   * @returns PayPal Product object
   */
  static async createProduct(name: string, description: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    const body = {
      name: name,
      description: description,
      type: 'DIGITAL', // Or 'SERVICE', 'PHYSICAL', etc.
      category: 'SOFTWARE',
      image_url: 'https://example.com/product_image.jpg', // Replace with a real URL
      home_url: 'https://example.com', // Replace with a real URL
    };

    const response = await Fetch.post(
      `${PAYPAL_API_BASE_URL}/v1/catalogs/products`,
      body,
      { headers },
    );
    return response.data;
  }

  /**
   * Creates a PayPal subscription plan.
   * @param productId The ID of the product this plan is for.
   * @param name The name of the plan.
   * @param description The description of the plan.
   * @param interval The billing interval ('MONTH' or 'YEAR').
   * @param amount The billing amount.
   * @param currency The currency (e.g., 'USD').
   * @returns PayPal Plan object
   */
  static async createPlan(
    productId: string,
    name: string,
    description: string,
    interval: 'MONTH' | 'YEAR',
    amount: string,
    currency: string,
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    const body = {
      product_id: productId,
      name: name,
      description: description,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: {
            interval_unit: interval,
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // 0 for indefinite
          pricing_scheme: {
            fixed_price: {
              value: amount,
              currency_code: currency,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        // setup_fee: {
        //   value: "0",
        //   currency_code: "USD"
        // },
      },
      // taxes: {
      //   percentage: "10",
      //   inclusive: false
      // },
    };

    const response = await Fetch.post(
      `${PAYPAL_API_BASE_URL}/v1/billing/plans`,
      body,
      { headers },
    );
    return response.data;
  }

  /**
   * Creates a PayPal subscription for a user.
   * @param planId The ID of the subscription plan.
   * @param userEmail The user's email.
   * @param userId The user's internal ID (for metadata).
   * @returns PayPal Subscription object with approval URL
   */
  //   static async createSubscription(
  //     planId: string,
  //     userEmail: string,
  //     userId: string,
  //   ): Promise<any> {
  //     const accessToken = await this.getAccessToken();
  //     const headers = {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${accessToken}`,
  //       Prefer: 'return=representation', // Important to get the approval URL
  //     };

  //     const body = {
  //       plan_id: planId,
  //       start_time: new Date().toISOString(),
  //       subscriber: { email_address: userEmail },
  //       custom_id: userId,
  //       application_context: {
  //         // return_url: `${appConfig().app.url}/api/subscription/paypal/success`,
  //         // cancel_url: `${appConfig().app.url}/api/subscription/paypal/cancel`,
  //         return_url: process.env.PAYPAL_SUCCESS_URL,
  //         cancel_url: process.env.PAYPAL_CANCEL_URL,

  //         brand_name: appConfig().app.name || 'YourAppName',
  //         locale: 'en-US',
  //         shipping_preference: 'NO_SHIPPING',
  //         user_action: 'SUBSCRIBE_NOW', // Important to trigger instant payment
  //         payment_method: {
  //           payer_selected: 'PAYPAL',
  //           payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED', // Ensure the payment happens instantly
  //         },
  //       },
  //     };

  //     // Make the API call to PayPal to create the subscription
  //     const response = await Fetch.post(
  //       `${PAYPAL_API_BASE_URL}/v1/billing/subscriptions`,
  //       body,
  //       { headers },
  //     );

  //     // Find the approval link in the response
  //     const approvalLink = response.data.links.find(
  //       (link: any) => link.rel === 'approve',
  //     );

  //     // Return the response data including the approval URL
  //     return {
  //       ...response.data,
  //       approval_url: approvalLink ? approvalLink.href : null,
  //     };
  //   }

  static async createSubscription(
  planId: string,
  userEmail: string,
  userId: string,
): Promise<any> {
  const accessToken = await this.getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    Prefer: 'return=representation',
  };

  const body = {
    plan_id: planId,
    subscriber: {
      email_address: userEmail,
    },
    application_context: {
      brand_name: appConfig().app.name || 'YourAppName',
      locale: 'en-US',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      return_url: `${process.env.PAYPAL_SUCCESS_URL}`,
      cancel_url: `${process.env.PAYPAL_CANCEL_URL}`,
    },
    custom_id: userId, // 🔑 Link PayPal subscription to internal user
  };

  console.log("📌 [PayPal] Creating Subscription with:", body);

  try {
    const response = await Fetch.post(
      `${PAYPAL_API_BASE_URL}/v1/billing/subscriptions`,
      body,
      { headers },
    );

    const approvalLink = response.data.links.find(
      (link: any) => link.rel === 'approve',
    );

    return {
      ...response.data,
      approval_url: approvalLink ? approvalLink.href : null,
    };
  } catch (error) {
    console.error("❌ PayPal Subscription Creation Failed:", error.response?.data || error.message);
    throw error;
  }
}


  /**
   * Retrieves a PayPal subscription.
   * @param subscriptionId The PayPal subscription ID.
   * @returns PayPal Subscription object
   */
  static async getSubscription(subscriptionId: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await Fetch.get(
      `${PAYPAL_API_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`,
      { headers },
    );
    return response.data;
  }

  /**
   * Cancels a PayPal subscription.
   * @param subscriptionId The PayPal subscription ID.
   * @param reason The reason for cancellation.
   * @returns
   */
  static async cancelSubscription(
    subscriptionId: string,
    reason: string = 'User requested cancellation',
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    const body = { reason };

    const response = await Fetch.post(
      `${PAYPAL_API_BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      body,
      { headers },
    );
    return response.data;
  }

  // --- Webhook handling ---
  // PayPal webhooks require you to verify the signature of the incoming request.
  // This is a more complex process than Stripe's and involves calling PayPal's API.
  // For simplicity, this example only includes a placeholder.
  // You would typically:
  // 1. Get the transmission ID from the 'Paypal-Transmission-Id' header.
  // 2. Get the timestamp from the 'Paypal-Transmission-Time' header.
  // 3. Get the webhook ID from your PayPal Dashboard.
  // 4. Get the signature from the 'Paypal-Transmission-Sig' header.
  // 5. Get the raw request body.
  // 6. Send these to PayPal's verify webhook signature endpoint.
  /**
   * Verifies PayPal Webhook Signature.
   * @param transmissionId Transmission ID from the headers.
   * @param timestamp Timestamp from the headers.
   * @param signature PayPal's signature.
   * @param rawBody Raw body of the request.
   * @param webhookId PayPal Webhook ID from the dashboard.
   * @returns Whether the webhook signature is valid.
   */
  //   static async verifyWebhookSignature(
  //     transmissionId: string,
  //     timestamp: string,
  //     webhookId: string,
  //     signature: string,
  //     rawBody: string,
  //     certUrl?: string,
  //   authAlgo?: string,
  //   ): Promise<boolean> {
  //     try {
  //       this.logger.debug(
  //         `Verifying webhook signature for transmission: ${transmissionId}`,
  //       );

  //       if (
  //         !transmissionId ||
  //         !timestamp ||
  //         !webhookId ||
  //         !signature ||
  //         !rawBody
  //       ) {
  //         this.logger.error(
  //           'Missing required parameters for webhook verification',
  //         );
  //         throw new Error('Missing required parameters for webhook verification');
  //       }

  //       const parsedBody = this.safeParseJSON(rawBody);
  //       if (!parsedBody) {
  //         this.logger.error('Invalid webhook payload: Unable to parse JSON');
  //         throw new Error('Invalid webhook payload');
  //       }

  //       const accessToken = await this.getAccessToken();
  //       const headers = {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${accessToken}`,
  //         'PayPal-Request-Id': `${Date.now()}-${transmissionId}`, // Idempotency key
  //       };

  //       const verificationPayload = {
  //         transmission_id: transmissionId,
  //         transmission_time: timestamp,
  //         webhook_id: webhookId,
  //         transmission_sig: signature,
  //         auth_algo: headers['paypal-auth-algo'] || 'SHA256withRSA',
  //         cert_url: headers['paypal-cert-url'],
  //         webhook_event: parsedBody,
  //       };

  //       const response = await this.retryOperation(
  //         async () =>
  //           await Fetch.post(
  //             `${PAYPAL_API_BASE_URL}/v1/notifications/verify-webhook-signature`,
  //             verificationPayload,
  //             { headers },
  //           ),
  //       );

  //       const isValid = response.data.verification_status === 'SUCCESS';
  //       this.logger.log(
  //         `Webhook signature verification ${isValid ? 'succeeded' : 'failed'} for transmission: ${transmissionId}`,
  //       );
  //       return isValid;
  //     } catch (error) {
  //       this.logger.error(
  //         `PayPal webhook verification failed for transmission ${transmissionId}: ${error.message}`,
  //         error.stack,
  //       );
  //       throw new Error(`Webhook verification failed: ${error.message}`);
  //     }
  //   }

  //   private static safeParseJSON(str: string): any {
  //     try {
  //       return JSON.parse(str);
  //     } catch (e) {
  //       this.logger.error(`JSON parsing failed: ${e.message}`);
  //       return null;
  //     }
  //   }
  // static async verifyWebhookSignature(
  //   transmissionId: string,
  //   timestamp: string,
  //   webhookId: string,
  //   signature: string,
  //   rawBody: string,
  //   certUrl?: string,
  //   authAlgo?: string,
  // ): Promise<boolean> {
  //   const accessToken = await this.getAccessToken();

  //   const headers = {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${accessToken}`,
  //   };

  //   const body = {
  //     transmission_id: transmissionId,
  //     transmission_time: timestamp,
  //     webhook_id: webhookId,
  //     transmission_sig: signature,
  //     cert_url: certUrl,
  //     auth_algo: authAlgo,
  //     webhook_event: JSON.parse(rawBody),
  //   };

  //   this.logger.log('🔍 Sending webhook verification to PayPal', body);

  //   const response = await Fetch.post(
  //     `${PAYPAL_API_BASE_URL}/v1/notifications/verify-webhook-signature`,
  //     body,
  //     { headers },
  //   );

  //   this.logger.log('🔍 Verification Response:', response.data);
  //   return response.data.verification_status === 'SUCCESS';
  // }

  static async verifyWebhookSignature(
  transmissionId: string,
  timestamp: string,
  webhookId: string,
  signature: string,
  rawBody: string,
  authAlgo?: string,
  certUrl?: string,
): Promise<boolean> {
  try {
    this.logger.debug(`🔍 Verifying PayPal webhook: ${transmissionId}`);

    if (!transmissionId || !timestamp || !webhookId || !signature || !rawBody) {
      this.logger.error('❌ Missing required parameters for webhook verification');
      return false;
    }

    // ✅ Parse rawBody safely
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (err) {
      this.logger.error(`❌ Failed to parse webhook JSON: ${err.message}`);
      return false;
    }

    const accessToken = await this.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    // ✅ Build verification payload
    const verificationPayload = {
      transmission_id: transmissionId,
      transmission_time: timestamp,
      webhook_id: webhookId,
      transmission_sig: signature,
      auth_algo: authAlgo || 'SHA256withRSA',
      cert_url: certUrl || '',
      webhook_event: parsedBody,
    };

    this.logger.log('📩 Sending verification payload to PayPal...');

    const response = await this.retryOperation(async () =>
      await Fetch.post(
        `${PAYPAL_API_BASE_URL}/v1/notifications/verify-webhook-signature`,
        verificationPayload,
        { headers },
      ),
    );

    const isValid = response.data.verification_status === 'SUCCESS';
    this.logger.log(
      `✅ Webhook signature verification ${isValid ? 'PASSED' : 'FAILED'} for ${transmissionId}`,
    );
    return isValid;
  } catch (error) {
    this.logger.error(
      `❌ PayPal webhook verification error: ${error.message}`,
      error.stack,
    );
    return false;
  }
}

}
