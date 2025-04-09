import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Session } from "@shopify/shopify-app-remix/server";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import dotenv from "dotenv";
import shopify from "~/shopify.server";

dotenv.config();

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Verify the webhook request
    const verified = await shopify.webhooks.verify(request, {
      secret: process.env.SHOPIFY_API_SECRET || "",
    });

    if (!verified) {
      return json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const body = await request.json();
    const topic = request.headers.get("X-Shopify-Topic");
    const shop = request.headers.get("X-Shopify-Shop-Domain");

    if (!topic || !shop) {
      return json({ error: "Missing required headers" }, { status: 400 });
    }

    // Handle different webhook topics
    switch (topic) {
      case "orders/create":
        return await handleOrderCreate(body, shop);
      case "orders/updated":
        return await handleOrderUpdate(body, shop);
      case "customers/create":
        return await handleCustomerCreate(body, shop);
      default:
        return json({ message: "Webhook received but not handled" });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleOrderCreate(order: any, shop: string) {
  try {
    // Forward order data to Gooscale
    const response = await fetch("https://partners-staging.gooscale.com/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GOOSCALE_API_KEY}`,
      },
      body: JSON.stringify({
        shop,
        order,
        eventType: "create",
      }),
    });

    if (!response.ok) {
      console.error("Failed to forward order to Gooscale:", await response.text());
    }

    return json({ message: "Order webhook processed" });
  } catch (error) {
    console.error("Error processing order webhook:", error);
    return json({ error: "Failed to process order webhook" }, { status: 500 });
  }
}

async function handleOrderUpdate(order: any, shop: string) {
  try {
    // Forward order update to Gooscale
    const response = await fetch("https://partners-staging.gooscale.com/api/order", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GOOSCALE_API_KEY}`,
      },
      body: JSON.stringify({
        shop,
        order,
        eventType: "update",
      }),
    });

    if (!response.ok) {
      console.error("Failed to forward order update to Gooscale:", await response.text());
    }

    return json({ message: "Order update webhook processed" });
  } catch (error) {
    console.error("Error processing order update webhook:", error);
    return json({ error: "Failed to process order update webhook" }, { status: 500 });
  }
}

async function handleCustomerCreate(customer: any, shop: string) {
  try {
    // Forward customer data to Gooscale
    const response = await fetch("https://partners-staging.gooscale.com/api/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GOOSCALE_API_KEY}`,
      },
      body: JSON.stringify({
        shop,
        customer,
        eventType: "create",
      }),
    });

    if (!response.ok) {
      console.error("Failed to forward customer to Gooscale:", await response.text());
    }

    return json({ message: "Customer webhook processed" });
  } catch (error) {
    console.error("Error processing customer webhook:", error);
    return json({ error: "Failed to process customer webhook" }, { status: 500 });
  }
}
