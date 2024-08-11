import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const id = formData.get("id");
  const title = formData.get("title");
  const price = formData.get("price");
  const variantId = formData.get("variantId");

  try {
    // Update product title and variant price
    const updateResponse = await admin.graphql(
      `
      mutation updateProductAndVariant($productInput: ProductInput!, $variantInput: ProductVariantInput!) {
        productUpdate(input: $productInput) {
          product {
            id
            title
          }
        }
        productVariantUpdate(input: $variantInput) {
          productVariant {
            id
            price
          }
        }
      }
    `,
      {
        variables: {
          productInput: {
            id,
            title,
          },
          variantInput: {
            id: variantId,
            price,
          },
        },
      },
    );

    if (updateResponse.errors) {
      console.error("Update errors:", updateResponse.errors);
      return json({ errors: updateResponse.errors }, { status: 400 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return json({ errors: ["Unexpected error occurred"] }, { status: 500 });
  }
};
