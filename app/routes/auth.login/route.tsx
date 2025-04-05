import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
  Layout,
  BlockStack,
  Box,
  List,
  InlineStack,
  Link,
  Banner,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { login } from "../../shopify.server";

import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors, polarisTranslations };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <PolarisAppProvider i18n={loaderData.polarisTranslations}>
      <Page>
        <Layout>
          <Layout.Section>
            <BlockStack gap="800">
              <Card>
                <BlockStack gap="400">
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <img 
                      src="https://partners-staging.gooscale.com/logo_dark.svg" 
                      alt="Gooscale Logo" 
                      style={{ maxWidth: '180px', margin: '0 auto' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTgwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zMC4yIDEyLjRDMzAuMiA1LjYgMjQuOCAwLjIgMTggMC4yQzExLjIgMC4yIDUuOCA1LjYgNS44IDEyLjRDNS44IDE5LjIgMTEuMiAyNC42IDE4IDI0LjZDMjQuOCAyNC42IDMwLjIgMTkuMiAzMC4yIDEyLjRaIiBmaWxsPSIjNWYwMzkyIi8+PHBhdGggZD0iTTQ4LjIgMTIuNEM0OC4yIDUuNiA0Mi44IDAuMiAzNiAwLjJDMjkuMiAwLjIgMjMuOCA1LjYgMjMuOCAxMi40QzIzLjggMTkuMiAyOS4yIDI0LjYgMzYgMjQuNkM0Mi44IDI0LjYgNDguMiAxOS4yIDQ4LjIgMTIuNFoiIGZpbGw9IiM1ZjAzOTIiLz48cGF0aCBkPSJNNjYuMiAxMi40QzY2LjIgNS42IDYwLjggMC4yIDU0IDAuMkM0Ny4yIDAuMiA0MS44IDUuNiA0MS44IDEyLjRDNDEuOCAxOS4yIDQ3LjIgMjQuNiA1NCAyNC42QzYwLjggMjQuNiA2Ni4yIDE5LjIgNjYuMiAxMi40WiIgZmlsbD0iIzVmMDM5MiIvPjxwYXRoIGQ9Ik03NC4yIDI4LjRDNzQuMiAyMS42IDY4LjggMTYuMiA2MiAxNi4yQzU1LjIgMTYuMiA0OS44IDIxLjYgNDkuOCAyOC40QzQ5LjggMzUuMiA1NS4yIDQwLjYgNjIgNDAuNkM2OC44IDQwLjYgNzQuMiAzNS4yIDc0LjIgMjguNFoiIGZpbGw9IiM1ZjAzOTIiLz48cGF0aCBkPSJNOTIuMiAyOC40QzkyLjIgMjEuNiA4Ni44IDE2LjIgODAgMTYuMkM3My4yIDE2LjIgNjcuOCAyMS42IDY3LjggMjguNEM2Ny44IDM1LjIgNzMuMiA0MC42IDgwIDQwLjZDODYuOCA0MC42IDkyLjIgMzUuMiA5Mi4yIDI4LjRaIiBmaWxsPSIjNWYwMzkyIi8+PHBhdGggZD0iTTExMC4yIDI4LjRDMTEwLjIgMjEuNiAxMDQuOCAxNi4yIDk4IDE2LjJDOTEuMiAxNi4yIDg1LjggMjEuNiA4NS44IDI4LjRDODUuOCAzNS4yIDkxLjIgNDAuNiA5OCA0MC42QzEwNC44IDQwLjYgMTEwLjIgMzUuMiAxMTAuMiAyOC40WiIgZmlsbD0iIzVmMDM5MiIvPjx0ZXh0IHg9IjEyMCIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzVmMDM5MiI+R29vc2NhbGU8L3RleHQ+PC9zdmc+";
                      }}
                    />
                  </div>
                  <Text variant="headingMd" as="h2" alignment="center">
                    Connect your Shopify store to Gooscale
                  </Text>
                  <Text variant="bodyMd" as="p" alignment="center">
                    Simplify multi-market management and boost your global e-commerce operations
                  </Text>
                  
                  <Form method="post">
                    <FormLayout>
                      <TextField
                        type="text"
                        name="shop"
                        label="Shop domain"
                        helpText="e.g: your-shop.myshopify.com"
                        value={shop}
                        onChange={setShop}
                        autoComplete="on"
                        error={errors.shop}
                      />
                      <Button variant="primary" fullWidth submit>Log in with Shopify</Button>
                    </FormLayout>
                  </Form>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h2">
                    Why connect to Gooscale?
                  </Text>
                  <List type="bullet">
                    <List.Item>
                      <Text variant="bodyMd" as="span">
                        <strong>Centralized Management:</strong> Manage multiple markets and storefronts from a single dashboard
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text variant="bodyMd" as="span">
                        <strong>Multilingual Support:</strong> Create and manage content in multiple languages to reach global customers
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text variant="bodyMd" as="span">
                        <strong>Streamlined Operations:</strong> Simplify inventory, pricing, and order management across all your markets
                      </Text>
                    </List.Item>
                  </List>
                  
                  <Banner
                    title="Already have a Gooscale account?"
                    action={{content: 'Go to main platform', url: 'https://partners-staging.gooscale.com/auth/login'}}
                    tone="info"
                  >
                    <p>Access your full Gooscale dashboard to manage all your connected stores and markets.</p>
                  </Banner>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    </PolarisAppProvider>
  );
}
