import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  DataTable,
  Frame,
} from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
      {
        orders(first: 10, query: "test:true") {
          edges {
            node {
              name
              email
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
              displayFinancialStatus
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
  );

  const responseJson = await response.json();
  console.log("GraphQL Response:", responseJson);
  return json(responseJson.data);
};

export default function Order() {
  const data = useLoaderData();
  const orders = data.orders.edges;

  const rows = orders.map(({ node: order }) => [
    order.name,
    order.email,
    order.totalPriceSet.shopMoney.amount,
    order.displayFinancialStatus,
    order.lineItems.edges.map((item) => (
      <div key={item.node.title}>
        {item.node.quantity} x {item.node.title} @{" "}
        {item.node.originalUnitPriceSet.shopMoney.amount}
      </div>
    )),
    <Button onClick={() => console.log(`View Order: ${order.name}`)}>
      View
    </Button>,
  ]);

  return (
    <Frame>
      <Page fullWidth>
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="h2" variant="headingMd">
                Orders List
              </Text>
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
                  "Order Name",
                  "Email",
                  "Total Price",
                  "Status",
                  "Line Items",
                  "Actions",
                ]}
                rows={rows}
              />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
