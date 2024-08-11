import { Badge, LegacyCard, Page } from "@shopify/polaris";

export default function PageExample() {
  return (
    <Page
      title="3/4 inch Leather pet collar"
      titleMetadata={<Badge tone="success">Paid</Badge>}
      subtitle="Perfect for any pet"
      compactTitle
      primaryAction={{ content: "Save", disabled: true }}
      secondaryActions={[
        {
          content: "Duplicate",
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
        {
          content: "View on your store",
          onAction: () => alert("View on Store action"),
        },
      ]}
      actionGroups={[
        {
          title: "Promote",
          actions: [
            {
              content: "Share on Facebook",
              accessibilityLabel: "Individual action label",
              onAction: () => alert("Share on facebook action"),
            },
          ],
        },
      ]}
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <LegacyCard title="Credit Card" sectioned>
        <p>Credit card information</p>
      </LegacyCard>
    </Page>
  );
}
