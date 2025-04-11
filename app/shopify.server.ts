import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  Session,
  DeliveryMethod,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize session storage
const sessionStorage = new PrismaSessionStorage(prisma);

// Define required scopes for customer data access
const requiredScopes = [
  'read_customers',
  'write_customers',
  'read_orders',
  'write_orders',
  'read_products',
  'write_products',
  'webhooks_read',
  'webhooks_write',
];

// Initialize Shopify app
const shopify = shopifyApp({
  api: {
    apiVersion: ApiVersion.October23,
    apiKey: process.env.SHOPIFY_API_KEY || "",
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    scopes: requiredScopes,
    isEmbeddedApp: true,
    appUrl: process.env.SHOPIFY_APP_URL || "https://partners-staging.gooscale.com",
  },
  sessionStorage,
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  
  // Add privacy policy and terms of service
  legal: {
    privacyPolicyUrl: "https://gooscale.com/privacy",
    termsOfServiceUrl: "https://gooscale.com/terms",
  },
  
  // Add data retention policy
  dataRetention: {
    retentionPeriod: "30 days",
    deletionPolicy: "Automatic"
  },
  
  // Add support contact
  supportEmail: "support@gooscale.com",
  webhooks: {
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks/orders-create",
    },
    ORDERS_UPDATED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks/orders-updated",
    },
    CUSTOMERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks/customers-create",
    },
    CUSTOMERS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks/customers-update",
    },
    PRODUCTS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks/products-create",
    },
    PRODUCTS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks/products-update",
    },
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks/app-uninstalled",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      await shopify.registerWebhooks({ session });
    },
  },
});

// Function to register webhooks for a specific shop
async function registerShopWebhooks(session: Session) {
  try {
    await shopify.registerWebhooks({ session });
    console.log(`Successfully registered webhooks for shop ${session.shop}`);
  } catch (error) {
    console.error(`Failed to register webhooks for shop ${session.shop}:`, error);
  }
}

// Function to register webhooks for all shops
async function registerAllShopWebhooks() {
  try {
    const sessions = await prisma.session.findMany({
      select: {
        shop: true
      }
    });
    
    for (const { shop } of sessions) {
      try {
        const session = await sessionStorage.loadSession(shop);
        if (!session) {
          throw new Error(`No session found for shop ${shop}`);
        }
        await registerShopWebhooks(session);
      } catch (error) {
        console.error(`Failed to register webhooks for shop ${shop}:`, error);
      }
    }
  } catch (error) {
    console.error('Failed to register webhooks:', error);
  }
}

// Register webhooks when the app starts
registerAllShopWebhooks().catch(console.error);

// Export authenticate as a named export
export const authenticate = shopify.authenticate;

// Export default shopify instance
export default shopify;
export type { Session };