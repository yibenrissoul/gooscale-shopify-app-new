import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * Handles the shop/redact webhook
 * This webhook is triggered when a store owner uninstalls your app and requests deletion of their store data.
 * Your app must permanently delete all data related to the store when this webhook is received.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  console.log(`Received shop/redact webhook for ${shop}`);

  // Extract shop information from the payload
  const shopId = payload.shop_id;
  const shopDomain = shop;

  console.log(`Processing shop redaction request for shop ID: ${shopId}, domain: ${shopDomain}`);

  try {
    // TODO: Implement your shop data deletion logic here
    // 1. Delete all data associated with this shop
    // 2. This includes customer data, order data, product data, etc.
    // 3. Keep minimal records only if required for compliance or analytics
    
    // Example implementation:
    // Delete all sessions for this shop
    await db.session.deleteMany({
      where: { shop: shopDomain }
    });
    
    // Example of other data you might need to delete (commented out):
    /*
    // Delete all customer data for this shop
    await db.customerData.deleteMany({
      where: { shopId: shopId }
    });
    
    // Delete all order data for this shop
    await db.orderData.deleteMany({
      where: { shopId: shopId }
    });
    
    // Delete all product data for this shop
    await db.productData.deleteMany({
      where: { shopId: shopId }
    });
    
    // You might want to log that this deletion occurred (without storing shop details)
    await db.shopRedactionLog.create({
      data: {
        redactionDate: new Date(),
        // Do NOT store shop identifiable information in this log
      }
    });
    */
    
    console.log(`Successfully processed shop redaction request for shop: ${shopDomain}`);
    
    // Return a 200 response to acknowledge receipt of the webhook
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Error processing shop redaction request for ${shopDomain}:`, error);
    
    // Still return a 200 to acknowledge receipt, even if processing failed
    // This prevents Shopify from retrying the webhook
    return new Response(null, { status: 200 });
  }
};
