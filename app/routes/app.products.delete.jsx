import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const id = formData.get("id");

  try {
    // Delete product
    const deleteResponse = await admin.graphql(
      `
      mutation deleteProduct($id: ID!) {
        productDelete(input: { id: $id }) {
          deletedProductId
        }
      }
    `,
      {
        variables: {
          id,
        },
      },
    );

    if (deleteResponse.errors) {
      console.error("Delete errors:", deleteResponse.errors);
      return json({ errors: deleteResponse.errors }, { status: 400 });
    }

    return json({ success: "Product deleted successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return json({ errors: ["Unexpected error occurred"] }, { status: 500 });
  }
};
