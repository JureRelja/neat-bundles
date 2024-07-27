import { BundleStepInputType, BundleStep } from "../types/BundleStep";
import {
  BlockStack,
  Text,
  Select,
  TextField,
  InlineGrid,
  ChoiceList,
} from "@shopify/polaris";
import { GapInsideSection, HorizontalGap } from "../constants";

export default function Index({
  stepData,
  title,
  inputId,
  updateStepData,
}: {
  stepData: BundleStep;
  title: string;
  inputId: number;
  updateStepData: (stepData: BundleStep) => void;
}) {
  const contentInputData = inputId === 1 ? stepData.input1 : stepData.input2;

  return (
    <BlockStack gap={GapInsideSection}>
      <Text as="p">{title}</Text>

      <InlineGrid gap={HorizontalGap} columns={2}>
        <Select
          label="Content type"
          options={[
            { label: "Text", value: BundleStepInputType.TEXT },
            { label: "Number", value: BundleStepInputType.NUMBER },
            { label: "Image", value: BundleStepInputType.IMAGE },
            { label: "None", value: BundleStepInputType.NONE },
          ]}
          onChange={(newContentType) => {
            updateStepData({
              ...stepData,
              [inputId === 1 ? "input1" : "input2"]: {
                ...contentInputData,
                type: newContentType as BundleStepInputType,
              },
            });
          }}
          value={contentInputData.type}
        />
        <TextField
          label="Label"
          value={contentInputData.label}
          onChange={(newLabel) => {
            updateStepData({
              ...stepData,
              [inputId === 1 ? "input1" : "input2"]: {
                ...contentInputData,
                label: newLabel,
              },
            });
          }}
          autoComplete="off"
        />
      </InlineGrid>
      <InlineGrid gap={HorizontalGap} columns={2}>
        <TextField
          label="Max length"
          type="number"
          inputMode="numeric"
          min={1}
          value={contentInputData.maxLength.toString()}
          onChange={(newMaxLength) => {
            updateStepData({
              ...stepData,
              [inputId === 1 ? "input1" : "input2"]: {
                ...contentInputData,
                maxLength: parseInt(newMaxLength),
              },
            });
          }}
          autoComplete="off"
        />
        <ChoiceList
          allowMultiple
          title="Display products"
          choices={[
            {
              label: "Can be empty",
              value: "true",
            },
          ]}
          selected={[contentInputData.canBeEmpty ? "true" : ""]}
          onChange={(newCanBeEmpty: string[]) => {
            updateStepData({
              ...stepData,
              [inputId === 1 ? "input1" : "input2"]: {
                ...contentInputData,
                canBeEmpty: newCanBeEmpty.includes("true"),
              },
            });
          }}
        />
      </InlineGrid>
    </BlockStack>
  );
}
