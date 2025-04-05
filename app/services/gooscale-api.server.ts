/**
 * Gooscale API Service
 * 
 * This service handles communication between the Shopify app and the main Gooscale platform.
 * It provides methods for authentication, data synchronization, and API calls.
 */

// Main Gooscale platform URL from environment variables
const GOOSCALE_API_URL = process.env.MAIN_APP_URL || 'https://partners-staging.gooscale.com';
const GOOSCALE_API_KEY = process.env.GOOSCALE_API_KEY || '';

// Define the session interface type
interface ShopifySession {
  shop: string;
  accessToken?: string;
  [key: string]: any;
}

/**
 * GooscaleApiService provides methods to interact with the main Gooscale platform
 */
export class GooscaleApiService {
  private session: ShopifySession | null;
  private shopDomain: string;
  private accessToken: string | null;
  
  constructor(session: ShopifySession | null = null) {
    this.session = session;
    this.shopDomain = session?.shop || '';
    this.accessToken = null;
  }

  /**
   * Authenticate with the Gooscale platform
   * @param credentials User credentials for Gooscale
   * @returns Authentication token
   */
  async authenticate(credentials: { email: string; password: string }) {
    try {
      const response = await fetch(`${GOOSCALE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          shopify_store: this.shopDomain,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.token;
      return data;
    } catch (error) {
      console.error('Gooscale authentication error:', error);
      throw error;
    }
  }

  /**
   * Link a Shopify store to a Gooscale account
   * @returns Result of the linking operation
   */
  async linkShopifyStore() {
    if (!this.session) {
      throw new Error('No active Shopify session');
    }

    try {
      const response = await fetch(`${GOOSCALE_API_URL}/api/shopify/link-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          shop_domain: this.shopDomain,
          shopify_token: this.session.accessToken,
          shopify_scope: process.env.SCOPES,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to link store: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error linking Shopify store to Gooscale:', error);
      throw error;
    }
  }

  /**
   * Sync products from Shopify to Gooscale
   * @returns Result of the product sync operation
   */
  async syncProducts() {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Gooscale');
    }

    try {
      const response = await fetch(`${GOOSCALE_API_URL}/api/shopify/sync-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          shop_domain: this.shopDomain,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync products: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing products to Gooscale:', error);
      throw error;
    }
  }

  /**
   * Get store configuration from Gooscale
   * @returns Store configuration data
   */
  async getStoreConfig() {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Gooscale');
    }

    try {
      const response = await fetch(`${GOOSCALE_API_URL}/api/shopify/store-config?shop=${this.shopDomain}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get store config: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting store config from Gooscale:', error);
      throw error;
    }
  }

  /**
   * Check if a Shopify store is already linked to Gooscale
   * @returns Boolean indicating if the store is linked
   */
  async isStoreLinked() {
    try {
      const response = await fetch(`${GOOSCALE_API_URL}/api/shopify/check-store?shop=${this.shopDomain}`);
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.linked === true;
    } catch (error) {
      console.error('Error checking if store is linked:', error);
      return false;
    }
  }
}

/**
 * Create a new instance of the Gooscale API service
 * @param session Shopify session
 * @returns GooscaleApiService instance
 */
export function createGooscaleApiService(session: ShopifySession | null = null) {
  return new GooscaleApiService(session);
}
