import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Handles the customers/redact webhook
 * This webhook is triggered when a customer requests deletion of their data from a store.
 * Your app must permanently delete all customer data when this webhook is received.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  console.log(`Received customers/redact webhook for ${shop}`);

  // Extract customer information from the payload
  const { customer } = payload;
  const customerId = customer.id;
  const customerEmail = customer.email;
  const ordersToRedact = payload.orders_to_redact || [];

  console.log(`Processing redaction request for customer ID: ${customerId}, email: ${customerEmail}`);
  console.log(`Orders to redact: ${ordersToRedact.length}`);

  try {
    // TODO: Implement your data deletion logic here
    // 1. Delete all personally identifiable information (PII) for this customer
    // 2. Delete any order data associated with the customer if specified in orders_to_redact
    // 3. Keep records of non-personal data for analytics if needed
    
    // Example implementation (commented out):
    /*
    // Delete customer personal data
    await db.customerData.deleteMany({
      where: { customerId: customerId }
    });
    
    // Delete order data if specified
    if (ordersToRedact.length > 0) {
      await db.orderData.deleteMany({
        where: { orderId: { in: ordersToRedact } }
      });
    }
    
    // You might want to log that this deletion occurred (without storing the customer details)
    await db.dataRedactionLog.create({
      data: {
        shopId: shop,
        redactionDate: new Date(),
        // Do NOT store customer identifiable information in this log
      }
    });
    */
    
    console.log(`Successfully processed redaction request for customer ID: ${customerId}`);
    
    // Return a 200 response to acknowledge receipt of the webhook
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Error processing redaction request for customer ${customerId}:`, error);
    
    // Still return a 200 to acknowledge receipt, even if processing failed
    // This prevents Shopify from retrying the webhook
    return new Response(null, { status: 200 });
  }
};
