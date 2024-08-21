import { BlockStack, Card, Text } from "@shopify/polaris";
import { GapBetweenSections, GapBetweenTitleAndContent } from "~/constants";

export default function BundlePreview() {
  return (
    <Card>
      <BlockStack gap={GapBetweenTitleAndContent}>
        <BlockStack gap={GapBetweenSections}>
          <Text as="h2" variant="headingMd">
            Step preview
          </Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
