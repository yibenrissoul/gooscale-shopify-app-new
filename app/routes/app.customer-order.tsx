import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  Banner,
  ResourceList,
} from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";

export default function CustomerOrderPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    city: "",
    province: "",
    country: "",
    zip: ""
  });

  const fetcher = useFetcher();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    fetcher.submit(formData, {
      method: "post",
      action: "/api/customer-order"
    });
  };

  return (
    <Page
      title="Customer Order Data"
      primaryAction={{
        content: "Submit Order",
        onAction: handleSubmit
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    label="First Name"
                    value={formData.firstName}
                    onChange={(value) => setFormData({ ...formData, firstName: value })}
                    autoComplete="given-name"
                  />
                  <TextField
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(value) => setFormData({ ...formData, lastName: value })}
                    autoComplete="family-name"
                  />
                </FormLayout.Group>

                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData({ ...formData, email: value })}
                  autoComplete="email"
                />

                <TextField
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  autoComplete="tel"
                />

                <FormLayout.Group>
                  <TextField
                    label="Address"
                    value={formData.address1}
                    onChange={(value) => setFormData({ ...formData, address1: value })}
                    autoComplete="address-line1"
                  />
                  <TextField
                    label="City"
                    value={formData.city}
                    onChange={(value) => setFormData({ ...formData, city: value })}
                    autoComplete="address-level2"
                  />
                </FormLayout.Group>

                <FormLayout.Group>
                  <TextField
                    label="Province/State"
                    value={formData.province}
                    onChange={(value) => setFormData({ ...formData, province: value })}
                    autoComplete="address-level1"
                  />
                  <TextField
                    label="Country"
                    value={formData.country}
                    onChange={(value) => setFormData({ ...formData, country: value })}
                    autoComplete="country"
                  />
                </FormLayout.Group>

                <TextField
                  label="Postal/Zip Code"
                  value={formData.zip}
                  onChange={(value) => setFormData({ ...formData, zip: value })}
                  autoComplete="postal-code"
                />

                <Button type="submit" primary>
                  Submit Order Data
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>

        {fetcher.data && fetcher.data.success && (
          <Banner tone="success">
            Order data submitted successfully!
          </Banner>
        )}
      </Layout>
    </Page>
  );
}
