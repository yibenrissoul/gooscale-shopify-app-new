import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Session } from "@shopify/shopify-app-remix/server";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import dotenv from "dotenv";
import https from 'https';
import shopify from "~/shopify.server";

dotenv.config();

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  province: string;
  country: string;
  zip: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const client = await getClient(session);

  try {
    const body = await request.json() as unknown as CustomerFormData;
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address1', 'city', 'province', 'country', 'zip'] as const;
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return json({ success: false, error: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    // Create customer in Shopify
    const customer = await client.rest.resources.Customer.create({
      customer: {
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        addresses: [{
          address1: body.address1,
          city: body.city,
          province: body.province,
          country: body.country,
          zip: body.zip,
          default: true
        }]
      }
    });

    // Forward data to Gooscale platform
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOOSCALE_API_KEY}`
      }
    };

    const data = JSON.stringify({
      shopifyCustomerId: customer.id,
      ...body
    });

    const req = https.request('https://partners-staging.gooscale.com/api/customer-order', options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          throw new Error(`Failed to forward data to Gooscale: ${res.statusMessage}`);
        }
      });
    });

    req.on('error', (error: Error) => {
      throw new Error(`Failed to forward data to Gooscale: ${error.message}`);
    });

    req.write(data);
    req.end();

    return json({ success: true, customerId: customer.id });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 400 });
  }
}

async function getSession(request: Request): Promise<Session> {
  const session = await shopify.session.getOnlineSession(request);
  if (!session) {
    throw new Error('No active session found');
  }
  return session;
}

async function getClient(session: Session) {
  return shopify.client(session);
}
