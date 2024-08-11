import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const price = formData.get("price");

  try {
    // Create product without variant
    const productResponse = await admin.graphql(
      `#graphql
      mutation createProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
          }
        }
      }`,
      {
        variables: {
          input: {
            title,
          },
        },
      },
    );

    if (productResponse.errors) {
      console.error("Product creation errors:", productResponse.errors);
      return json({ errors: productResponse.errors }, { status: 400 });
    }

    const productId = productResponse.data.productCreate.product.id;

    // Add variant separately
    const variantResponse = await admin.graphql(
      `#graphql
      mutation createVariant($input: ProductVariantInput!) {
        productVariantCreate(input: $input) {
          productVariant {
            id
            price
          }
        }
      }`,
      {
        variables: {
          input: {
            productId,
            price,
          },
        },
      },
    );

    if (variantResponse.errors) {
      console.error("Variant creation errors:", variantResponse.errors);
      return json({ errors: variantResponse.errors }, { status: 400 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return json({ errors: ["Unexpected error occurred"] }, { status: 500 });
  }
};
