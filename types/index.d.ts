declare module "~/shopify.server" {
  import { Session } from "@shopify/shopify-app-remix/server";

  const shopify: any;
  export default shopify;
  export type { Session };
}
