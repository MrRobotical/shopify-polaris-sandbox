import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Frame,
  Layout,
  Page,
  Thumbnail,
  Text,
  DataTable,
  Button,
  Modal,
  FormLayout,
  TextField,
  Toast,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
        {
          products(first: 20) {
            edges {
              node {
                id
                title
                handle
                status
                images(first: 1) {
                  edges {
                    node {
                      originalSrc
                      altText
                    }
                  }
                }
                variants(first: 20) {
                  edges {
                    node {
                      id
                      price
                      barcode
                      createdAt
                    }
                  }
                }
              }
            }
          }
        }`,
  );

  const responseJson = await response.json();

  // Log the response to check its structure
  console.log("GraphQL Response:", responseJson);

  return json(responseJson.data); // Make sure you're only returning the necessary data structure
};

export default function Products() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  // Safely access the products and edges
  const products = data?.products?.edges || [];

  const [active, setActive] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [variantId, setVariantId] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState("");
  const [saving, setIsSaving] = useState(false);
  const [deleteProductId, setDeletingProductId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleModalChange = useCallback(
    () => setActive((active) => !active),
    [active],
  );

  const toggleToastActive = useCallback(
    () => setToastActive((active) => !active),
    [],
  );

  const handleEdit = (product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setPrice(product.variants.edges[0]?.node.price || "");
    setVariantId(product.variants.edges[0]?.node.id);
    setActive(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();

    if (isCreating) {
      // Creating a new product
      formData.append("title", title);
      formData.append("price", price);

      await fetcher.submit(formData, {
        method: "POST",
        action: "/app/products/create", // Assuming you have a create route
      });
    } else {
      // Editing an existing product
      formData.append("id", editingProduct.id);
      formData.append("title", title);
      formData.append("price", price);
      formData.append("variantId", variantId);

      await fetcher.submit(formData, {
        method: "POST",
        action: "/app/products/edit",
      });
    }

    setActive(false);
    setIsSaving(false);
    setIsCreating(false); // Reset the create mode
  };

  const handleCreate = () => {
    setIsCreating(true);
    setTitle("");
    setPrice("");
    setActive(true);
  };

  const handleDelete = async (productId) => {
    setDeletingProductId(productId);
    await fetcher.submit(
      { id: productId },
      {
        method: "POST",
        action: "/app/products/delete",
      },
    );
  };

  useEffect(() => {
    if (fetcher.state === "idle") {
      if (fetcher.data?.success) {
        setToastContent(fetcher.data.success);
        setToastActive(true);
        setActive(false); // Close the modal
      } else if (fetcher.data?.errors) {
        console.error(fetcher.data.errors);
      }
      setIsSaving(false);
      setDeletingProductId(null);
    }
  }, [fetcher.state, fetcher.data]);

  const rows = products.map(({ node: product }) => [
    <Thumbnail
      source={product.images.edges[0]?.node.originalSrc || ""}
      alt={product.images.edges[0]?.node.altText || "Product Image"}
    />,
    product.title,
    product.status,
    product.variants.edges[0]?.node.price || ``,
    <Button onClick={() => handleEdit(product)}>Edit</Button>,
    <Button
      onClick={() => handleDelete(product.id)}
      loading={deleteProductId === product.id}
    >
      Delete
    </Button>,
  ]);

  return (
    <Frame>
      <Page
        fullWidth
        primaryAction={{
          content: "Create Product",
          onAction: handleCreate,
        }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="h2" variant="HeadingMd">
                Products List
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
                  "Image",
                  "Title",
                  "Status",
                  "Price",
                  "Edit",
                  "Delete",
                ]}
                rows={rows}
              />
            </Card>
          </Layout.Section>
        </Layout>
        <Modal
          open={active}
          onClose={handleModalChange}
          title="Edit Product"
          primaryAction={{
            content: "Save",
            onAction: handleSave,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleModalChange,
            },
          ]}
        >
          <Modal.Section>
            <FormLayout>
              <TextField
                label="Title"
                value={title}
                onChange={(value) => setTitle(value)}
              ></TextField>

              <TextField
                label="Price"
                type="number"
                value={price}
                onChange={(value) => setPrice(value)}
              ></TextField>
            </FormLayout>
          </Modal.Section>
        </Modal>

        {toastActive && (
          <Toast content={toastContent} onDismiss={toggleToastActive} />
        )}
      </Page>
    </Frame>
  );
}
