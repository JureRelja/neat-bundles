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
import {
  BundleStep,
  ProductResourceType,
  BundleStepType,
} from "../types/BundleStep";
import {
  GapBetweenSections,
  GapInsideSection,
  HorizontalGap,
} from "../constants";
import PickerModal from "./picker-modal";
import { BaseResource } from "@shopify/app-bridge-types";

export default function Index({
  stepData,
  updateStepData,
}: {
  stepData: BundleStep;
  updateStepData: (stepData: BundleStep) => void;
}) {
  //Updating selected products/collections depending on what is choosen in the Resource Picker modal
  const updateSelectedResources = (productResourceList: BaseResource[]) => {
    updateStepData({
      ...stepData,
      productResources: {
        ...stepData.productResources,
        selectedResources: productResourceList,
      },
    });
  };

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
        <ChoiceList
          title="Step type"
          choices={[
            {
              label: "Product step",
              value: BundleStepType.PRODUCT,
              helpText: `Customers can choose products on this step`,
            },
            {
              label: "Content step",
              value: BundleStepType.CONTENT,
              helpText: `Customer can add text or images on this step`,
            },
          ]}
          selected={[stepData.stepType]}
          onChange={(value) => {
            updateStepData({
              ...stepData,
              stepType: value[0] as BundleStepType,
            });
          }}
        />

        <Divider borderColor="border-inverse" />
        {stepData.stepType === BundleStepType.PRODUCT ? (
          <>
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
                selected={[stepData.productResources.resourceType]}
                onChange={(value) => {
                  updateStepData({
                    ...stepData,
                    productResources: {
                      ...stepData.productResources,
                      resourceType: value[0] as ProductResourceType,
                    },
                  });
                }}
              />
              <PickerModal
                type={stepData.productResources.resourceType}
                selectedResources={stepData.productResources.selectedResources}
                updateSelectedResources={updateSelectedResources}
              />
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
                  min={1}
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
                  min={1}
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
                    label:
                      "Allow customers to select one product more than once",
                    value: "allowProductDuplicates",
                  },
                  {
                    label: "Show price under each product",
                    value: "showProductPrice",
                  },
                ]}
                selected={[
                  stepData.stepRules.allowProductDuplicates
                    ? "allowProductDuplicates"
                    : "",
                  stepData.stepRules.showProductPrice ? "showProductPrice" : "",
                ]}
                onChange={(selectedValues) => {
                  updateStepData({
                    ...stepData,
                    stepRules: {
                      allowProductDuplicates: selectedValues.includes(
                        "allowProductDuplicates",
                      ),
                      showProductPrice:
                        selectedValues.includes("showProductPrice"),
                    },
                  });
                }}
              />
            </BlockStack>
          </>
        ) : (
          <></>
        )}
      </BlockStack>
    </Card>
  );
}
