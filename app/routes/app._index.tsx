import { useEffect } from "react";
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
  Link,
  InlineStack,
  Banner,
  Icon,
  EmptyState,
} from "@shopify/polaris";
import shopify from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await shopify.authenticate.admin(request);
  
  // Get store information
  const shopDomain = session.shop;
  
  return json({
    shopDomain,
  });
};

export default function Index() {
  const { shopDomain } = useLoaderData<typeof loader>();
  
  // Redirect to Gooscale platform after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "https://partners-staging.gooscale.com/auth/login";
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Page>
      <BlockStack gap="500">
        <Banner
          title="Welcome to Gooscale"
          tone="info"
          action={{
            content: "Go to Gooscale Platform",
            url: "https://partners-staging.gooscale.com/auth/login",
            external: true
          }}
        >
          <Text variant="bodyMd" as="p">
            Gooscale is your all-in-one solution for global e-commerce management. 
            This Shopify app integrates seamlessly with the Gooscale platform to help 
            you expand your business internationally.
          </Text>
        </Banner>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Your Global E-commerce Solution
                </Text>
                <Text as="p" variant="bodyMd">
                  This app connects your Shopify store to the Gooscale platform, 
                  enabling you to manage multiple markets and languages from a single 
                  dashboard. Visit the Gooscale platform to get started.
                </Text>
                <Button
                  url="https://partners-staging.gooscale.com/auth/login"
                  variant="primary"
                  external
                >
                  Go to Gooscale Platform
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Learn More
                </Text>
                <List>
                  <List.Item>
                    <Link 
                      url="https://gooscale.com"
                      external
                      removeUnderline
                    >
                      Visit Gooscale Website
                    </Link>
                  </List.Item>
                  <List.Item>
                    <Link 
                      url="https://partners-staging.gooscale.com/auth/login"
                      external
                      removeUnderline
                    >
                      Access Platform
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
