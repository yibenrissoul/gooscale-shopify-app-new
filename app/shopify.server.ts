import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  Session,
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

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October23,
  scopes: requiredScopes,
  appUrl: process.env.SHOPIFY_APP_URL || "https://partners-staging.gooscale.com",
  authPathPrefix: "/auth",
  sessionStorage,
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  isEmbeddedApp: true,
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  
  // Add privacy policy and terms of service
  privacyPolicyUrl: "https://gooscale.com/privacy",
  termsOfServiceUrl: "https://gooscale.com/terms",
  
  // Add data retention policy
  dataRetentionPolicy: {
    retentionPeriod: "30 days",
    deletionPolicy: "Automatic"
  },
  
  // Add support contact
  supportEmail: "support@gooscale.com"
});

// Function to register webhooks for a shop
async function registerShopWebhooks(shop: string) {
  const session = await sessionStorage.loadSession(shop);
  if (!session) {
    throw new Error(`No session found for shop ${shop}`);
  }

  const webhookTopics = [
    "orders/create",
    "orders/updated",
    "customers/create"
  ];

  for (const topic of webhookTopics) {
    try {
      await shopify.registerWebhooks({
        session: session,
        webhook: {
          path: "/api/webhooks",
          topic,
          accessToken: session.accessToken,
        }
      });
    } catch (error) {
      console.error(`Failed to register webhook for topic ${topic}:`, error);
    }
  }
}

// Register webhooks for all shops
async function registerAllWebhooks() {
  try {
    const sessions = await prisma.session.findMany();
    const shops = sessions.map((session) => session.shop);
    
    for (const shop of shops) {
      try {
        await registerShopWebhooks(shop);
      } catch (error) {
        console.error(`Failed to register webhooks for shop ${shop}:`, error);
      }
    }
  } catch (error) {
    console.error('Failed to get all shops:', error);
  }
}

// Register webhooks when the app starts
registerAllWebhooks().catch(console.error);

export default shopify;
export type { Session };
