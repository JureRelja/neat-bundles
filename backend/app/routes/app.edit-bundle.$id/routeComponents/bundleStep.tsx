import {
  ChoiceList,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Text,
  ButtonGroup,
  TextField,
  Divider,
  InlineGrid,
} from "@shopify/polaris";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  DeleteIcon,
  PageAddIcon,
} from "@shopify/polaris-icons";

import {
  GapBetweenSections,
  GapInsideSection,
  HorizontalGap,
} from "../constants";
import ResourcePicker from "./resource-picker";
import ContentStepInputs from "./content-step-inputs";
import { StepType, ProductResourceType, ContentInput } from "@prisma/client";
import { BundleStepWithAllResources } from "../types/BundleStep";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";

export default function Index({
  stepData,
  updateStepData,
}: {
  stepData: BundleStepWithAllResources;
  updateStepData: (newStepData: BundleStepWithAllResources) => void;
}) {
  const submit = useSubmit();

  // Update the content inputs for the step
  const updateContentInput = (newContentInput: ContentInput) => {
    updateStepData({
      ...stepData,
      contentInputs: stepData.contentInputs.map(
        (contentInput: ContentInput) => {
          if (contentInput.id === newContentInput.id) {
            return newContentInput;
          }
          return contentInput;
        },
      ),
    });
  };

  //Updating selected resources
  const updateSelectedResources = (selectedResources: string[]) => {
    updateStepData({
      ...stepData,
      productResources: selectedResources,
    });
  };

  const [selected, setSelected] = useState<string[]>(["PRODUCT"]);

  const handleChange = (selected: string[]) => {
    setSelected(selected);
  };

  const [selected2, setSelected2] = useState<string[]>(["COLLECTION"]);

  const handleChange2 = (selected: string[]) => {
    setSelected2(selected);
  };

  return (
    <Card>
      <BlockStack gap={GapBetweenSections}>
        <InlineStack gap="100" align="space-between">
          <Text as="h2" variant="headingLg">
            Step #{stepData.stepNumber}
          </Text>

          <ButtonGroup>
            <>
              <Button
                icon={ArrowDownIcon}
                size="slim"
                variant="plain"
                onClick={() => {
                  submit(
                    {
                      action: "moveStepDown",
                      stepNumber: stepData.stepNumber,
                    },
                    { method: "POST" },
                  );
                }}
              />
              <Button
                icon={ArrowUpIcon}
                size="slim"
                variant="plain"
                onClick={() => {
                  submit(
                    {
                      action: "moveStepUp",
                      stepNumber: stepData.stepNumber,
                    },
                    { method: "POST" },
                  );
                }}
              />
            </>
            <Button
              variant="plain"
              icon={DeleteIcon}
              tone="critical"
              onClick={() => {
                submit(
                  { action: "deleteStep", stepId: stepData.id },
                  { method: "POST" },
                );
              }}
            >
              Delete
            </Button>
            <Button
              variant="plain"
              icon={PageAddIcon}
              onClick={() =>
                submit(
                  {
                    action: "duplicateStep",
                    stepNumber: stepData.stepNumber,
                  },
                  { method: "POST" },
                )
              }
            >
              Duplicate
            </Button>
          </ButtonGroup>
        </InlineStack>
        <BlockStack gap={GapInsideSection}>
          <TextField
            label="Step title"
            value={stepData.title}
            onChange={(newTitle) => {
              updateStepData({
                ...stepData,
                title: newTitle,
              });
            }}
            autoComplete="off"
            name={`stepTitle-${stepData.stepNumber}`}
          />
          <TextField
            label="Step description"
            value={stepData.description}
            name={`stepDescription-${stepData.stepNumber}`}
            onChange={(newDesc) => {
              updateStepData({
                ...stepData,
                description: newDesc,
              });
            }}
            autoComplete="off"
          />
        </BlockStack>
        <ChoiceList
          title="Step type:"
          name={`stepType-${stepData.stepNumber}`}
          choices={[
            {
              label: "Product step",
              value: StepType.PRODUCT,
              helpText: `Customers can choose products on this step`,
            },
            {
              label: "Content step",
              value: StepType.CONTENT,
              helpText: `Customer can add text or images on this step`,
            },
          ]}
          selected={[stepData.stepType]}
          onChange={(selected: string[]) => {
            updateStepData({
              ...stepData,
              stepType: selected[0] as StepType,
            });
          }}
        />

        <Divider borderColor="border-inverse" />
        {stepData.stepType === StepType.PRODUCT ? (
          <>
            <BlockStack gap={GapInsideSection}>
              <ChoiceList
                title="Display products:"
                name={`productResourceType-${stepData.stepNumber}`}
                choices={[
                  {
                    label: "Selected products",
                    value: ProductResourceType.PRODUCT,
                  },
                  {
                    label: "Selected collections",
                    value: ProductResourceType.COLLECTION,
                  },
                ]}
                selected={[stepData.resourceType]}
                onChange={(selected: string[]) => {
                  updateStepData({
                    ...stepData,
                    resourceType: selected[0] as ProductResourceType,
                    productResources: [],
                  });
                }}
              />

              <ResourcePicker
                resourceType={stepData.resourceType}
                selectedResources={stepData.productResources}
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
                  name={`minProductsToSelect-${stepData.stepNumber}`}
                  min={1}
                  value={stepData.minProductsOnStep.toString()}
                  onChange={(value) => {
                    updateStepData({
                      ...stepData,
                      minProductsOnStep: parseInt(value),
                    });
                  }}
                />

                <TextField
                  label="Maximum products to select"
                  type="number"
                  autoComplete="off"
                  inputMode="numeric"
                  name={`maxProductsToSelect-${stepData.stepNumber}`}
                  min={1}
                  value={stepData.maxProductsOnStep.toString()}
                  onChange={(value) => {
                    updateStepData({
                      ...stepData,
                      maxProductsOnStep: parseInt(value),
                    });
                  }}
                />
              </InlineGrid>
              <ChoiceList
                title="Display products"
                allowMultiple
                name={`displayProducts-${stepData.stepNumber}`}
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
                  stepData.allowProductDuplicates
                    ? "allowProductDuplicates"
                    : "",
                  stepData.showProductPrice ? "showProductPrice" : "",
                ]}
                onChange={(selectedValues) => {
                  updateStepData({
                    ...stepData,
                    allowProductDuplicates: selectedValues.includes(
                      "allowProductDuplicates",
                    ),
                    showProductPrice:
                      selectedValues.includes("showProductPrice"),
                  });
                }}
              />
            </BlockStack>
          </>
        ) : (
          <BlockStack gap={GapBetweenSections}>
            {stepData.contentInputs.map((contentInput, index) => (
              <ContentStepInputs
                key={contentInput.id}
                contentInput={contentInput}
                inputId={index + 1}
                updateContentInput={updateContentInput}
                stepNumber={stepData.stepNumber}
              />
            ))}
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
