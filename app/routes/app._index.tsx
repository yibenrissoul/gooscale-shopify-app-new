import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
  Icon,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { GooscaleApiService } from "../services/gooscale-api.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  // Get store information
  const shopDomain = session.shop;
  
  return json({
    shopDomain,
    features: [
      {
        title: "Multi-Market Management",
        description: "Manage your global e-commerce operations from a single dashboard",
        icon: "globe"
      },
      {
        title: "Multi-Language Support",
        description: "Create and manage content in multiple languages for global reach",
        icon: "language"
      },
      {
        title: "Smart Synchronization",
        description: "Automatically sync products across all your markets",
        icon: "sync"
      },
      {
        title: "Centralized Configuration",
        description: "Easily manage settings for all your stores from one place",
        icon: "settings"
      }
    ]
  });
};

export default function Index() {
  const { shopDomain, features } = useLoaderData<typeof loader>();
  
  return (
    <Page>
      <BlockStack gap="500">
        <Banner
          title="Welcome to Gooscale Multi-Market Manager"
          tone="info"
          action={{
            content: "Install",
            url: "/app/connect",
            external: true
          }}
        >
          <Text variant="bodyMd" as="p">
            Gooscale helps you expand your Shopify store globally with multi-market and multilingual support
          </Text>
        </Banner>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Features
                </Text>

                <BlockStack gap="300">
                  {features.map((feature, index) => (
                    <Box key={index} padding="200">
                      <InlineStack gap="200" align="center">
                        <Icon source={feature.icon} tone="highlight" size="large" />
                        <BlockStack gap="100">
                          <Text as="h3" variant="headingSm">
                            {feature.title}
                          </Text>
                          <Text as="p" variant="bodyMd">
                            {feature.description}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </Box>
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Get Started
                </Text>
                <Text as="p" variant="bodyMd">
                  Connect your Shopify store to Gooscale to start managing multiple markets and languages.
                </Text>
                <Button url="/app/connect" variant="primary">
                  Connect Store
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Support
                </Text>
                <List>
                  <List.Item>
                    <Link url="https://help.gooscale.com" external removeUnderline>
                      Help Center
                    </Link>
                  </List.Item>
                  <List.Item>
                    <Link url="https://help.gooscale.com/faq" external removeUnderline>
                      FAQ
                    </Link>
                  </List.Item>
                  <List.Item>
                    <Link url="https://help.gooscale.com/privacy" external removeUnderline>
                      Privacy Policy
                    </Link>
                  </List.Item>
                  <List.Item>
                    <Link url="https://help.gooscale.com/terms" external removeUnderline>
                      Terms of Service
                    </Link>
                  </List.Item>
                </List>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
