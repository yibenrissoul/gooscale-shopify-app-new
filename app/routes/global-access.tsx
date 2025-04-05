import { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

/**
 * This route provides global access to the app and redirects to the main application
 * It doesn't require authentication with a specific Shopify store
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Redirect to the main application URL if set
  const mainAppUrl = process.env.MAIN_APP_URL;
  if (mainAppUrl) {
    return redirect(mainAppUrl);
  }

  // If no main app URL is set, show a fallback message
  return new Response("Please set MAIN_APP_URL in your environment variables.", {
    status: 400,
  });
}
