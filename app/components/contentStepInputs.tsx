import { BlockStack, Text, Select, TextField, InlineGrid, ChoiceList, InlineStack, Button } from "@shopify/polaris";
import { GapInsideSection, HorizontalGap } from "../constants";
import { ContentInput, InputType } from "@prisma/client";
import { error } from "~/adminBackend/service/dto/jsonData";
import { DeleteIcon } from "@shopify/polaris-icons";

export default function Index({
    contentInput,
    errors,
    inputId,
    index,
    single,
    updateContentInput,
    updateFieldErrorHandler,
    removeContentInputField,
}: {
    contentInput: ContentInput;
    errors: error[];
    inputId: number;
    index: number;
    single?: boolean;
    updateFieldErrorHandler: (fieldName: string) => void;
    updateContentInput: (newContentInput: ContentInput) => void;
    removeContentInputField: (inputId: number) => void;
}) {
    console.log(errors);
    return (
        <BlockStack gap={GapInsideSection}>
            {!single && (
                <InlineStack align="space-between">
                    <Text as="p" variant="headingMd">
                        Input field #{index}
                    </Text>
                    <Button variant="primary" tone="critical" size="micro" icon={DeleteIcon} onClick={() => removeContentInputField(inputId)}></Button>
                </InlineStack>
            )}

            <InlineGrid gap={HorizontalGap} columns={2}>
                <Select
                    label="Input field type"
                    options={[
                        { label: "None", value: "NONE" },
                        { label: "Text", value: InputType.TEXT },
                        { label: "Number", value: InputType.NUMBER },
                        { label: "Image", value: InputType.IMAGE },
                    ]}
                    onChange={(newContentType: string) => {
                        updateContentInput({
                            ...contentInput,
                            inputType: newContentType as InputType,
                        });
                    }}
                    value={contentInput.inputType}
                    helpText="The right input type is important for correct data entry."
                    name={`inputType`}
                />

                <TextField
                    label="Input label"
                    name={`inputLabel${inputId}`}
                    helpText="The label will be visible above the input field."
                    value={contentInput.inputLabel}
                    disabled={contentInput.inputType === "NONE"}
                    error={errors?.find((err: error) => err.fieldId === `inputLabel${inputId}`)?.message}
                    onChange={(newLabel) => {
                        updateContentInput({
                            ...contentInput,
                            inputLabel: newLabel,
                        });
                        updateFieldErrorHandler(`inputLabel${inputId}`);
                    }}
                    autoComplete="off"
                />
            </InlineGrid>
            <InlineGrid gap={HorizontalGap} columns={2} alignItems="center">
                <TextField
                    label="Max length (in characters)"
                    helpText="It lets you limit the number of characters that customers can enter."
                    type="number"
                    name={`maxChars${inputId}`}
                    inputMode="numeric"
                    min={1}
                    disabled={contentInput.inputType === "NONE" || contentInput.inputType === "IMAGE"}
                    error={errors?.find((err: error) => err.fieldId === `maxChars${inputId}`)?.message}
                    value={contentInput.maxChars.toString()}
                    onChange={(newMaxLength) => {
                        updateContentInput({
                            ...contentInput,
                            maxChars: parseInt(newMaxLength),
                        });
                        updateFieldErrorHandler(`maxChars${inputId}`);
                    }}
                    autoComplete="off"
                />
                <ChoiceList
                    allowMultiple
                    title="Input field required"
                    name={`required`}
                    titleHidden
                    choices={[
                        {
                            label: "Field is required",
                            value: "true",
                        },
                    ]}
                    disabled={contentInput.inputType === "NONE" || contentInput.inputType === "IMAGE"}
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
