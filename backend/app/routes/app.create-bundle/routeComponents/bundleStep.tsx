import {
  ChoiceList,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Text,
  ButtonGroup,
  Box,
  TextField,
  Divider,
  Grid,
  InlineGrid,
} from "@shopify/polaris";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  DeleteIcon,
  PageAddIcon,
} from "@shopify/polaris-icons";
import { BundleStep } from "../types/BundleStep";
import {
  GapBetweenSections,
  GapInsideSection,
  HorizontalGap,
} from "../constants";

export default function Index({
  stepData,
  updateStepData,
}: {
  stepData: BundleStep;
  updateStepData: (stepData: BundleStep) => void;
}) {
  return (
    <Card>
      <BlockStack gap={GapBetweenSections}>
        <InlineStack gap="100" align="space-between">
          <Text as="h2" variant="headingSm">
            Step #{stepData.stepId}
          </Text>

          <ButtonGroup>
            <>
              <Button icon={ArrowDownIcon} size="slim" variant="plain" />
              <Button icon={ArrowUpIcon} size="slim" variant="plain" />
            </>
            <Button variant="plain" icon={DeleteIcon} tone="critical">
              Delete
            </Button>
            <Button variant="plain" icon={PageAddIcon}>
              Duplicate
            </Button>
          </ButtonGroup>
        </InlineStack>
        <BlockStack gap={GapInsideSection}>
          <TextField
            label="Step title"
            value={stepData.title}
            onChange={(value) => {
              updateStepData({ ...stepData, title: value });
            }}
            autoComplete="off"
          />
          <TextField
            label="Step description"
            value={stepData.description}
            onChange={(value) => {
              updateStepData({ ...stepData, description: value });
            }}
            autoComplete="off"
          />
        </BlockStack>
        <Divider />
        <ChoiceList
          title="Step type"
          choices={[
            {
              label: "Product step",
              value: "product",
              helpText: `Customers can choose one products on this step`,
            },
            {
              label: "Content step",
              value: "content",
              helpText: `Customer can add text or images on this step`,
            },
          ]}
          selected={[stepData.stepType]}
          onChange={(value) => {
            updateStepData({
              ...stepData,
              stepType: value[0] as "product" | "content",
            });
          }}
        />

        <Divider />
        <BlockStack gap={GapInsideSection}>
          <ChoiceList
            title="Display products"
            choices={[
              {
                label: "Selected products",
                value: "product",
              },
              {
                label: "Selected collections",
                value: "collection",
              },
            ]}
            selected={[stepData.stepType]}
            onChange={(value) => {
              updateStepData({
                ...stepData,
              });
            }}
          />
          <Button fullWidth variant="primary">
            Select products
          </Button>
        </BlockStack>
        <Divider />
        <BlockStack gap={GapInsideSection}>
          <Text as="p">Rules</Text>

          <InlineGrid columns={2} gap={HorizontalGap}>
            <TextField
              label="Minimum products to select"
              type="number"
              autoComplete="off"
              inputMode="numeric"
              value={stepData.productRules.minProductsOnStep.toString()}
              onChange={(value) => {
                updateStepData({
                  ...stepData,
                  productRules: {
                    ...stepData.productRules,
                    minProductsOnStep: parseInt(value),
                  },
                });
              }}
            />

            <TextField
              label="Maximum products to select"
              type="number"
              autoComplete="off"
              inputMode="numeric"
              value={stepData.productRules.maxProductsOnStep.toString()}
              onChange={(value) => {
                updateStepData({
                  ...stepData,
                  productRules: {
                    ...stepData.productRules,
                    maxProductsOnStep: parseInt(value),
                  },
                });
              }}
            />
          </InlineGrid>
          <ChoiceList
            title="Display products"
            allowMultiple
            choices={[
              {
                label: "Allow customers to select one product more than once",
                value: stepData.stepRules.allowProductDuplicates
                  ? "true"
                  : "false",
                id: "allowMultiple",
              },
              {
                label: "Show price under each product",
                value: stepData.stepRules.showProductPrice ? "true" : "false",
                id: "showPrice",
              },
            ]}
            selected={[stepData.stepType]}
            onChange={(value) => {
              const allowMultipleProducts = value[0] === "true";
              const showProductPrice = value[1] === "true";
              updateStepData({
                ...stepData,
                stepRules: {
                  allowProductDuplicates: allowMultipleProducts,
                  showProductPrice: showProductPrice,
                },
              });
            }}
          />
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
