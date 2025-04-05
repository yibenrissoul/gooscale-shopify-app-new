import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Handles the customers/data_request webhook
 * This webhook is triggered when a customer requests their data from a store.
 * Your app should respond with any customer data you've stored.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);

  console.log(`Received customers/data_request webhook for ${shop}`);

  // Extract customer information from the payload
  const { customer } = payload;
  const customerId = customer.id;
  const customerEmail = customer.email;

  console.log(`Processing data request for customer ID: ${customerId}, email: ${customerEmail}`);

  try {
    // TODO: Implement your data retrieval logic here
    // 1. Query your database for any data associated with this customer
    // 2. Format the data in a structured way
    // 3. Send the data to the customer or store admin via email or other secure means
    
    // Example implementation (commented out):
    /*
    const customerData = await db.customerData.findMany({
      where: { customerId: customerId }
    });
    
    // Send the data to a secure endpoint or email
    await sendCustomerData(customerEmail, customerData);
    */
    
    console.log(`Successfully processed data request for customer ID: ${customerId}`);
    
    // Return a 200 response to acknowledge receipt of the webhook
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(`Error processing data request for customer ${customerId}:`, error);
    
    // Still return a 200 to acknowledge receipt, even if processing failed
    // This prevents Shopify from retrying the webhook
    return new Response(null, { status: 200 });
  }
};
