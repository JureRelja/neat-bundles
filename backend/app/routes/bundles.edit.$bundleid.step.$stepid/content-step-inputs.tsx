import {
  BlockStack,
  Text,
  Select,
  TextField,
  InlineGrid,
  ChoiceList,
} from "@shopify/polaris";
import { GapInsideSection, HorizontalGap } from "../../constants";
import { ContentInput, InputType } from "@prisma/client";

export default function Index({
  contentInput,
  stepNumber,
  inputId,
  updateContentInput,
}: {
  contentInput: ContentInput;
  stepNumber: number;
  inputId: number;
  updateContentInput: (newContentInput: ContentInput) => void;
}) {
  return (
    <BlockStack gap={GapInsideSection}>
      <Text as="p">Input #{inputId}</Text>

      <InlineGrid gap={HorizontalGap} columns={2}>
        <Select
          label="Content type"
          options={[
            { label: "None", value: "NONE" },
            { label: "Text", value: InputType.TEXT },
            { label: "Number", value: InputType.NUMBER },
            { label: "Image", value: InputType.IMAGE },
          ]}
          onChange={(newContentType: string) => {
            console.log(newContentType);
            updateContentInput({
              ...contentInput,
              inputType: newContentType as InputType,
            });
          }}
          value={contentInput.inputType}
          name={`inputType-${stepNumber}-${inputId}`}
        />

        <TextField
          label="Label"
          name={`inputLabel-${stepNumber}-${inputId}`}
          value={contentInput.inputLabel}
          disabled={contentInput.inputType === "NONE"}
          onChange={(newLabel) => {
            updateContentInput({
              ...contentInput,
              inputLabel: newLabel,
            });
          }}
          autoComplete="off"
        />
      </InlineGrid>
      <InlineGrid gap={HorizontalGap} columns={2} alignItems="end">
        <TextField
          label="Max length (in characters)"
          type="number"
          name={`maxChars-${stepNumber}-${inputId}`}
          inputMode="numeric"
          min={1}
          disabled={contentInput.inputType === "NONE"}
          value={contentInput.maxChars.toString()}
          onChange={(newMaxLength) => {
            updateContentInput({
              ...contentInput,
              maxChars: parseInt(newMaxLength),
            });
          }}
          autoComplete="off"
        />
        <ChoiceList
          allowMultiple
          title="Input required"
          name={`required-${stepNumber}-${inputId}`}
          titleHidden
          choices={[
            {
              label: "Field is required",
              value: "true",
            },
          ]}
          disabled={contentInput.inputType === "NONE"}
          selected={[contentInput.required ? "true" : ""]}
          onChange={(selected: string[]) => {
            updateContentInput({
              ...contentInput,
              required: selected.includes("true"),
            });
          }}
        />
      </InlineGrid>
    </BlockStack>
  );
}
