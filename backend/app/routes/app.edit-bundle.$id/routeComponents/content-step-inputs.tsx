import {
  BlockStack,
  Text,
  Select,
  TextField,
  InlineGrid,
  ChoiceList,
} from "@shopify/polaris";
import { GapInsideSection, HorizontalGap } from "../constants";
import { ContentInput, InputType } from "@prisma/client";

export default function Index({
  contentInput,
  inputId,
  updateContentInput,
}: {
  contentInput: ContentInput;
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
            { label: "Text", value: InputType.TEXT },
            { label: "Number", value: InputType.NUMBER },
            { label: "Image", value: InputType.IMAGE },
            { label: "None", value: InputType.NONE },
          ]}
          onChange={(newContentType) => {
            updateContentInput({
              ...contentInput,
              inputType: newContentType as InputType,
            });
          }}
          value={contentInput.inputType}
          name={"inputType"}
        />

        <TextField
          label="Label"
          name="inputLabel"
          value={contentInput.inputLabel}
          disabled={contentInput.inputType === InputType.NONE}
          onChange={(newLabel) => {
            updateContentInput({
              ...contentInput,
              inputLabel: newLabel,
            });
          }}
          autoComplete="off"
        />
      </InlineGrid>
      <InlineGrid gap={HorizontalGap} columns={2}>
        <TextField
          label="Max length (in characters)"
          type="number"
          inputMode="numeric"
          min={1}
          disabled={contentInput.inputType === InputType.NONE}
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
          disabled={contentInput.inputType === InputType.NONE}
          choices={[
            {
              label: "Required",
              value: "true",
            },
          ]}
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
