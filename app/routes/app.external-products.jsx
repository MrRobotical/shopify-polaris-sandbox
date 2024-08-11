import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  DataTable,
  Thumbnail,
  Frame,
  Spinner,
} from "@shopify/polaris";

// Mock API URL
const EXTERNAL_API_URL = "https://fakestoreapi.com/products";

export const loader = async () => {
  const response = await fetch(EXTERNAL_API_URL);
  const data = await response.json();
  console.log(data);

  return json(data);
};

export default function ExternalProducts() {
  const products = useLoaderData();
  const fetcher = useFetcher();

  const rows = products.map((product) => [
    <Thumbnail
      source={product.image || ""}
      alt={product.title || "Product Image"}
    />,
    product.title,
    "Available",
    product.price,
    <Button>Edit</Button>,
    <Button>Delete</Button>,
  ]);

  return (
    <Frame>
      <Page fullWidth title="External Products">
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="h2" variant="headingMd">
                External Products List
              </Text>
              {fetcher.state === "loading" ? (
                <Spinner />
              ) : (
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                    "text",
                  ]}
                  headings={[
                    "Image",
                    "Title",
                    "Status",
                    "Price",
                    "Edit",
                    "Delete",
                  ]}
                  rows={rows}
                />
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
