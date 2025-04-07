import { useState, useCallback } from "react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  Banner,
  Box,
  InlineStack,
  ProgressBar,
  List,
  Spinner,
  EmptyState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { GooscaleApiService } from "../services/gooscale-api.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Check if the store is already linked to Gooscale
  const gooscaleApi = new GooscaleApiService(session);
  const isLinked = await gooscaleApi.isStoreLinked();
  
  if (!isLinked) {
    return json({
      isLinked,
      shopDomain: session.shop,
      syncStatus: "not_connected",
      lastSync: null,
      productCount: 0,
    });
  }
  
  // In a real implementation, we would fetch the sync status from Gooscale
  // For now, we'll just return some placeholder data
  return json({
    isLinked,
    shopDomain: session.shop,
    syncStatus: "ready", // could be "ready", "in_progress", "completed", "failed"
    lastSync: null, // timestamp of last sync
    productCount: 0, // number of products synced
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  try {
    const gooscaleApi = new GooscaleApiService(session);
    
    // Check if store is linked
    const isLinked = await gooscaleApi.isStoreLinked();
    if (!isLinked) {
      return json({
        status: "error",
        message: "Your store is not connected to Gooscale. Please connect your store first.",
      });
    }
    
    // Start product sync
    const syncResult = await gooscaleApi.syncProducts();
    
    return json({
      status: "success",
      message: "Product synchronization started successfully.",
      syncId: syncResult.syncId || "unknown",
    });
  } catch (error) {
    console.error("Error syncing products with Gooscale:", error);
    
    return json({
      status: "error",
      message: "Failed to sync products with Gooscale. Please try again.",
    });
  }
};

export default function SyncProducts() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSync = useCallback(() => {
    setIsSyncing(true);
    submit({}, { method: "post" });
  }, [submit]);
  
  // Reset syncing state when we get a response
  if (actionData && isSyncing) {
    setIsSyncing(false);
  }
  
  return (
    <Page
      title="Sync Products"
      subtitle="Synchronize your Shopify products with Gooscale"
      backAction={{ url: "/app" }}
    >
      <TitleBar title="Sync Products" primaryAction={undefined} />
      
      <BlockStack gap="500">
        {actionData?.status === "success" && (
          <Banner
            title="Synchronization Started"
            tone="success"
          >
            {actionData.message}
          </Banner>
        )}
        
        {actionData?.status === "error" && (
          <Banner
            title="Synchronization Failed"
            tone="critical"
          >
            {actionData.message}
          </Banner>
        )}
        
        {!loaderData.isLinked ? (
          <Card>
            <EmptyState
              heading="Connect your store first"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              action={{
                content: "Connect to Gooscale",
                url: "/app/connect",
              }}
            >
              You need to connect your Shopify store to Gooscale before you can sync products.
            </EmptyState>
          </Card>
        ) : (
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Product Synchronization
                  </Text>
                  
                  <Text as="p">
                    Synchronize your Shopify products with Gooscale to manage them across multiple markets.
                    This process will:
                  </Text>
                  
                  <List type="bullet">
                    <List.Item>
                      Transfer your product data to Gooscale
                    </List.Item>
                    <List.Item>
                      Sync product images, variants, and metadata
                    </List.Item>
                    <List.Item>
                      Prepare your products for multi-market management
                    </List.Item>
                  </List>
                  
                  <Box paddingBlockStart="400">
                    <Button 
                      variant="primary" 
                      onClick={handleSync} 
                      loading={isSyncing}
                      disabled={isSyncing}
                    >
                      Start Synchronization
                    </Button>
                  </Box>
                </BlockStack>
              </Card>
              
              {loaderData.lastSync && (
                <Box paddingBlockStart="400">
                  <Card>
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">
                        Synchronization Status
                      </Text>
                      
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="span" fontWeight="bold">Last sync:</Text>
                        <Text as="span">
                          {new Date(loaderData.lastSync).toLocaleString()}
                        </Text>
                      </InlineStack>
                      
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="span" fontWeight="bold">Products synced:</Text>
                        <Text as="span">{loaderData.productCount}</Text>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                </Box>
              )}
            </Layout.Section>
            
            <Layout.Section variant="oneThird">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Synchronization Tips
                  </Text>
                  
                  <BlockStack gap="200">
                    <Text as="p" fontWeight="semibold">
                      Initial sync may take time
                    </Text>
                    <Text as="p">
                      The first synchronization may take several minutes depending on your product catalog size.
                    </Text>
                    
                    <Text as="p" fontWeight="semibold">
                      Automatic updates
                    </Text>
                    <Text as="p">
                      After the initial sync, product changes will be automatically synchronized.
                    </Text>
                    
                    <Text as="p" fontWeight="semibold">
                      Need help?
                    </Text>
                    <Text as="p">
                      If you encounter any issues during synchronization, please contact our support team.
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        )}
      </BlockStack>
    </Page>
  );
}
