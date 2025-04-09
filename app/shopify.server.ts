import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  Session,
} from "@shopify/shopify-app-remix/server";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Initialize session storage
const sessionStorage = new SQLiteSessionStorage(
  process.env.DATABASE_URL || "file:./dev.sqlite"
);

// Define required scopes for customer data access
const requiredScopes = [
  'read_customers',
  'write_customers',
  'read_orders',
  'write_orders',
  'read_products',
  'write_products',
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

export default shopify;
export type { Session };
