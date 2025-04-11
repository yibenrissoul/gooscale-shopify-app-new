import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import shopify from "~/shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await shopify.authenticate.admin(request);
  
  // This is important for session token authentication
  // It ensures the app has the necessary session data for API calls
  await admin.graphql(
    `#graphql
      query ShopInfo {
        shop {
          name
        }
      }
    `
  );

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop: session.shop,
  });
};

export default function App() {
  const { apiKey, shop } = useLoaderData<typeof loader>();

  return (
    <AppProvider 
      isEmbeddedApp
      apiKey={apiKey}
    >
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/connect">
          Connect to Gooscale
        </Link>
        <Link to="/app/webhooks">
          Webhook Setup
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
