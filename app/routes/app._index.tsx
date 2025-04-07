import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Banner,
  ProgressBar,
  Icon,
  EmptyState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { CheckIcon, GlobeIcon, LanguageIcon, InventoryIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { GooscaleApiService } from "../services/gooscale-api.server";

// Define the setup step interface
interface SetupStep {
  id: string;
  title: string;
  completed: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Check if the store is already linked to Gooscale
  const gooscaleApi = new GooscaleApiService(session);
  const isLinked = await gooscaleApi.isStoreLinked();
  
  // Get store information
  const shopDomain = session.shop;
  
  return json({
    shopDomain,
    isLinked,
    setupSteps: [
      { id: "connect", title: "Connect your store", completed: isLinked },
      { id: "sync", title: "Sync your products", completed: false },
      { id: "configure", title: "Configure markets", completed: false },
      { id: "launch", title: "Launch global storefronts", completed: false }
    ] as SetupStep[]
  });
};

export default function Index() {
  const { shopDomain, isLinked, setupSteps } = useLoaderData<typeof loader>();
  const [setupProgress, setSetupProgress] = useState(0);
  
  // Calculate setup progress
  useEffect(() => {
    const completedSteps = setupSteps.filter(step => step.completed).length;
    setSetupProgress((completedSteps / setupSteps.length) * 100);
  }, [setupSteps]);

  return (
    <Page>
      <TitleBar
        title="Gooscale Multi-Market Manager"
        primaryAction={undefined}
      />
      
      <BlockStack gap="500">
        {!isLinked && (
          <Banner
            title="Welcome to Gooscale Multi-Market Manager"
            tone="info"
            action={{content: 'Connect your store', url: '/app/connect'}}
          >
            Connect your Shopify store to Gooscale to start managing multiple markets and languages.
          </Banner>
        )}
        
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Getting Started with Gooscale
                </Text>
                
                <BlockStack gap="400">
                  <Text variant="bodyMd" as="p">
                    Your store: <Text as="span" fontWeight="bold">{shopDomain}</Text>
                  </Text>
                  
                  <Box paddingBlockEnd="400">
                    <Text variant="bodyMd" as="p" fontWeight="medium">
                      Setup Progress: {Math.round(setupProgress)}%
                    </Text>
                    <ProgressBar progress={setupProgress} size="small" />
                  </Box>
                  
                  <BlockStack gap="300">
                    {setupSteps.map((step: SetupStep, index: number) => (
                      <InlineStack key={step.id} align="space-between" blockAlign="center">
                        <InlineStack gap="200" blockAlign="center">
                          <Box
                            background={step.completed ? "success-subdued" : "surface-subdued"}
                            borderRadius="full"
                            padding="200"
                            minWidth="24px"
                            minHeight="24px"
                            borderWidth="025"
                            borderColor={step.completed ? "success" : "border"}
                          >
                            <Box style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                              {step.completed ? (
                                <Icon source={CheckIcon} color="success" />
                              ) : (
                                <Text variant="bodyMd" fontWeight="semibold">
                                  {index + 1}
                                </Text>
                              )}
                            </Box>
                          </Box>
                          <Text variant="bodyMd" as="span" fontWeight={step.completed ? "regular" : "medium"}>
                            {step.title}
                          </Text>
                        </InlineStack>
                        
                        {step.id === "connect" && !step.completed && (
                          <Button
                            variant="primary"
                            url="/app/connect"
                          >
                            Connect
                          </Button>
                        )}
                        
                        {step.id === "sync" && isLinked && !step.completed && (
                          <Button
                            variant="primary"
                            url="/app/sync"
                          >
                            Sync Products
                          </Button>
                        )}
                      </InlineStack>
                    ))}
                  </BlockStack>
                </BlockStack>
              </BlockStack>
            </Card>
            
            {!isLinked ? (
              <Box paddingBlockStart="500">
                <Card>
                  <EmptyState
                    heading="Expand your business globally"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    action={{
                      content: "Connect your store",
                      url: "/app/connect",
                    }}
                  >
                    Connect your Shopify store to Gooscale to start managing multiple markets and languages from a single dashboard.
                  </EmptyState>
                </Card>
              </Box>
            ) : (
              <Box paddingBlockStart="500">
                <Card>
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Your Multi-Market Dashboard
                    </Text>
                    <Text as="p">
                      Your store is connected to Gooscale. Continue setting up your multi-market strategy.
                    </Text>
                    <InlineStack gap="300">
                      <Button variant="primary" url="/app/sync">
                        Sync Products
                      </Button>
                      <Button url="/app/markets">
                        Configure Markets
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </Card>
              </Box>
            )}
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Why use Gooscale?
                  </Text>
                  
                  <BlockStack gap="300">
                    <InlineStack gap="300" blockAlign="center">
                      <Icon source={GlobeIcon} color="highlight" />
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        Centralized Management
                      </Text>
                    </InlineStack>
                    <Text as="p" variant="bodyMd">
                      Manage multiple markets and storefronts from a single dashboard.
                    </Text>
                    
                    <InlineStack gap="300" blockAlign="center">
                      <Icon source={LanguageIcon} color="highlight" />
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        Multilingual Support
                      </Text>
                    </InlineStack>
                    <Text as="p" variant="bodyMd">
                      Create and manage content in multiple languages to reach global customers.
                    </Text>
                    
                    <InlineStack gap="300" blockAlign="center">
                      <Icon source={InventoryIcon} color="highlight" />
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        Streamlined Operations
                      </Text>
                    </InlineStack>
                    <Text as="p" variant="bodyMd">
                      Simplify inventory, pricing, and order management across all your markets.
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Resources
                  </Text>
                  <List>
                    <List.Item>
                      <Link url="https://help.gooscale.com/getting-started" external removeUnderline>
                        Getting started with Gooscale
                      </Link>
                    </List.Item>
                    <List.Item>
                      <Link url="https://help.gooscale.com/multi-market-strategy" external removeUnderline>
                        Building a multi-market strategy
                      </Link>
                    </List.Item>
                    <List.Item>
                      <Link url="https://help.gooscale.com/faq" external removeUnderline>
                        Frequently asked questions
                      </Link>
                    </List.Item>
                  </List>
                  
                  <Box paddingBlockStart="200">
                    <InlineStack gap="200">
                      <Link url="/app/help">Help Center</Link>
                      <Text as="span" color="subdued">•</Text>
                      <Link url="/app/privacy">Privacy Policy</Link>
                      <Text as="span" color="subdued">•</Text>
                      <Link url="/app/terms">Terms of Service</Link>
                    </InlineStack>
                  </Box>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
