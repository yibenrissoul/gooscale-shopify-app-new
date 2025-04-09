import { Session } from "@shopify/shopify-app-remix/server";

declare module "@shopify/shopify-app-remix/server" {
  export interface ShopifyRestResources {
    Customer: {
      create: (params: { customer: CustomerParams }) => Promise<CustomerResponse>;
    };
  }

  export interface CustomerParams {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    addresses: Array<{
      address1: string;
      city: string;
      province: string;
      country: string;
      zip: string;
      default: boolean;
    }>;
  }

  export interface CustomerResponse {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    addresses: Array<{
      id: number;
      address1: string;
      city: string;
      province: string;
      country: string;
      zip: string;
      default: boolean;
    }>;
  }

  export interface SessionStorage {
    storeSession: (session: Session) => Promise<void>;
    loadSession: (id: string) => Promise<Session | null>;
    deleteSession: (id: string) => Promise<void>;
  }
}
