export default () => ({
  app: {
    name: process.env.APP_NAME,
    key: process.env.APP_KEY,
    url: process.env.APP_URL,
    client_app_url: process.env.CLIENT_APP_URL,
    port: parseInt(process.env.PORT, 10) || 3000,
  },

  fileSystems: {
    public: {},
    s3: {
      driver: 's3',
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEFAULT_REGION,
      bucket: process.env.AWS_BUCKET,
      url: process.env.AWS_URL,
      endpoint: process.env.AWS_ENDPOINT,
    },
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
  },

  security: {
    salt: 10,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRY,
  },

  mail: {
    host: 'smtp.gmail.com',
    port: 587,
    user: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM_NAME,
  },

  auth: {
    google: {
      app_id: process.env.GOOGLE_APP_ID,
    },

    facebook: {
      app_id: process.env.FACEBOOK_APP_ID,
      app_secret: process.env.FACEBOOK_APP_SECRET,
      callback: 'http://localhost:3000/api/auth/facebook/redirect',
    },
  },

  payment: {
    stripe: {
      secret_key: process.env.STRIPE_SECRET_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
      priceid_monthly: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
      priceid_yearly: process.env.STRIPE_SUBSCRIPTION_PRICE_ID_YEARLY,
    },


    paypal: {
      mode: process.env.PAYPAL_MODE || 'sandbox',
      client_key: process.env.PAYPAL_CLIENT_KEY,
      secret_key: process.env.PAYPAL_SECRET_KEY,
      api: process.env.PAYPAL_API || 'https://api-m.sandbox.paypal.com',
      product_id: process.env.PAYPAL_PRODUCT_ID, 
      priceid_monthly: process.env.PAYPAL_SUBSCRIPTION_PLAN_ID_MONTHLY,
      priceid_yearly: process.env.PAYPAL_SUBSCRIPTION_PLAN_ID_YEARLY, 
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    },
  },


  storageUrl: {
    rootUrl: './public/storage',
    rootUrlPublic: '/public/storage',
    package: '/package/',
    destination: '/destination/',
    blog: '/blog/',
    avatar: '/avatar/',
    websiteInfo: '/website-info/',
    attachment: '/attachment/',
  },

  defaultUser: {
    system: {
      username: process.env.SYSTEM_USERNAME,
      email: process.env.SYSTEM_EMAIL,
      password: process.env.SYSTEM_PASSWORD,
    },
  },
});
