import { useState } from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Banner,
  Button,
  InlineStack,
} from "@shopify/polaris";
import shopify from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await shopify.authenticate.admin(request);
  return json({ shop: session.shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await shopify.authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "setup") {
    try {
      // Register multiple webhook topics
      const webhookTopics = [
        "orders/create",
        "orders/updated",
        "customers/create"
      ];

      for (const topic of webhookTopics) {
        await shopify.app.registerWebhooks({
          session: session,
          webhook: {
            path: "/api/webhooks",
            topic,
            accessToken: session.accessToken,
            address: `https://${process.env.SHOPIFY_APP_URL}/api/webhooks`,
          }
        });
      }
      
      return json({
        status: "success",
        message: "Webhooks have been successfully set up. Your store will now sync with Gooscale automatically."
      });
    } catch (error) {
      console.error("Error setting up webhooks:", error);
      return json({
        status: "error",
        message: "Failed to set up webhooks. Please try again later."
      });
    }
  }

  return json({ status: "error", message: "Invalid action" });
};

export default function WebhooksSetup() {
  const { shop } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const handleSetup = () => {
    submit(new FormData(), { method: "post", action: "/app/webhooks" });
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              {actionData?.status === "success" ? (
                <Banner title={actionData.message} tone="success" />
              ) : (
                <BlockStack gap="400">
                  <Text variant="headingLg" as="h2">
                    Webhook Setup
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Let us handle the technical details of connecting your Shopify store to Gooscale.
                  </Text>
                  <Text as="p" variant="bodyMd">
                    By clicking "Set Up Webhooks", we will automatically configure the necessary connections between your Shopify store and Gooscale. This will enable real-time synchronization of your orders and customers.
                  </Text>
                  <Button
                    onClick={handleSetup}
                    loading={actionData?.status === "loading"}
                  >
                    Set Up Webhooks
                  </Button>
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
