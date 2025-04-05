import { useState, useCallback } from "react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  BlockStack,
  Banner,
  Box,
  InlineStack,
  Divider,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { GooscaleApiService } from "../services/gooscale-api.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Check if the store is already linked to Gooscale
  const gooscaleApi = new GooscaleApiService(session);
  const isLinked = await gooscaleApi.isStoreLinked();
  
  return json({
    shop: session.shop,
    isLinked,
    mainAppUrl: process.env.MAIN_APP_URL || 'https://partners-staging.gooscale.com',
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  try {
    const gooscaleApi = new GooscaleApiService(session);
    
    // Authenticate with Gooscale
    await gooscaleApi.authenticate({ email, password });
    
    // Link the Shopify store to Gooscale
    await gooscaleApi.linkShopifyStore();
    
    return json({
      status: "success",
      message: "Your Shopify store has been successfully connected to your Gooscale account.",
    });
  } catch (error) {
    console.error("Error connecting to Gooscale:", error);
    
    return json({
      status: "error",
      message: "Failed to connect to Gooscale. Please check your credentials and try again.",
    });
  }
};

export default function ConnectGooscale() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = useCallback(() => {
    submit(
      { email, password },
      { method: "post" }
    );
  }, [submit, email, password]);
  
  const handleCreateAccount = useCallback(() => {
    window.open(`${loaderData.mainAppUrl}/auth/register?shop=${loaderData.shop}`, "_blank");
  }, [loaderData.mainAppUrl, loaderData.shop]);
  
  return (
    <Page
      title="Connect to Gooscale"
      subtitle="Link your Shopify store with your Gooscale account to enable multi-market management"
    >
      <Layout>
        <Layout.Section>
          {actionData?.status === "success" && (
            <Banner
              title="Connection Successful"
              tone="success"
              onDismiss={() => {}}
            >
              <p>{actionData.message}</p>
            </Banner>
          )}
          
          {actionData?.status === "error" && (
            <Banner
              title="Connection Failed"
              tone="critical"
              onDismiss={() => {}}
            >
              <p>{actionData.message}</p>
            </Banner>
          )}
          
          {loaderData.isLinked ? (
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Your store is connected to Gooscale
                </Text>
                <Text as="p">
                  Your Shopify store {loaderData.shop} is already connected to your Gooscale account.
                </Text>
                <Box paddingBlockStart="400">
                  <Button
                    variant="primary"
                    url={loaderData.mainAppUrl}
                    external
                  >
                    Go to Gooscale Dashboard
                  </Button>
                </Box>
              </BlockStack>
            </Card>
          ) : (
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Connect your Shopify store to Gooscale
                </Text>
                <Text as="p">
                  Enter your Gooscale account credentials to link your Shopify store.
                </Text>
                
                <FormLayout>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    helpText="The email you use to log in to Gooscale"
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                  />
                  <Button variant="primary" onClick={handleSubmit}>
                    Connect to Gooscale
                  </Button>
                </FormLayout>
              </BlockStack>
            </Card>
          )}
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Don't have a Gooscale account?
              </Text>
              <Text as="p">
                Create a new Gooscale account to manage your Shopify store across multiple markets.
              </Text>
              <Box paddingBlockStart="200">
                <Button variant="primary" onClick={handleCreateAccount}>
                  Create Gooscale Account
                </Button>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Why connect to Gooscale?
              </Text>
              <BlockStack gap="200">
                <Text as="p" fontWeight="bold">
                  Centralized Management
                </Text>
                <Text as="p">
                  Manage multiple markets and storefronts from a single dashboard.
                </Text>
                
                <Text as="p" fontWeight="bold">
                  Multilingual Support
                </Text>
                <Text as="p">
                  Create and manage content in multiple languages to reach global customers.
                </Text>
                
                <Text as="p" fontWeight="bold">
                  Streamlined Operations
                </Text>
                <Text as="p">
                  Simplify inventory, pricing, and order management across all your markets.
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
