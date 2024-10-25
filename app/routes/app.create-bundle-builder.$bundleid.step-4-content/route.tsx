import { json, redirect } from "@remix-run/node";
import { useFetcher, useParams, useSubmit } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Text, TextField } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import type { error } from "../../adminBackend/service/dto/jsonData";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import styles from "./route.module.css";
import userRepository from "@adminBackend/repository/impl/UserRepository";
import { BundleBuilderRepository } from "~/adminBackend/repository/impl/BundleBuilderRepository";
import type { BundleBuilder, ContentInput } from "@prisma/client";
import { useState } from "react";
import { GapBetweenTitleAndContent, GapInsideSection } from "../../constants";
import WideButton from "../../components/wideButton";
import { AuthorizationCheck } from "~/adminBackend/service/utils/AuthorizationCheck";
import ContentStepInput from "../../components/contentStepInputs";
import type { ContentStepDataDto } from "~/adminBackend/service/dto/ContentStepDataDto";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));

    if (!isAuthorized) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect("/app");

    if (!params.bundleid) {
        throw new Response(null, {
            status: 404,
            statusText: "Bundle id is required",
        });
    }

    const bundleBuilder: BundleBuilder | null = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: "Bundle with this id not found",
        });
    }

    return json(new JsonData(true, "success", "Loader response", [], bundleBuilder), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get("action");

    return json(
        {
            ...new JsonData(true, "success", "This is the default action that doesn't do anything."),
        },
        { status: 200 },
    );
};

export default function Index() {
    const submit = useSubmit();
    const params = useParams();

    const [errors, setErrors] = useState<error[]>([]);

    const handleNextBtnHandler = () => {
        if (!stepTitle) {
            return;
        }

        if (contentInput.inputLabel.length === 0) {
            setErrors((errors) => {
                if (!errors) {
                    return [
                        {
                            fieldId: `inputLabel${contentInput.id}`,
                            field: "Input label",
                            message: "Input label is required",
                        },
                    ];
                }
                return [
                    ...errors,
                    {
                        fieldId: `inputLabel${contentInput.id}`,
                        field: "Input label",
                        message: "Input label is required",
                    },
                ];
            });
        } else if (contentInput.inputType != "IMAGE" && (!contentInput.maxChars || contentInput.maxChars < 1)) {
            setErrors((errors) => {
                if (!errors) {
                    return [
                        {
                            fieldId: `maxChars${contentInput.id}`,
                            field: "Max length",
                            message: "Max length is required and must be greater than 0",
                        },
                    ];
                }
                return [
                    ...errors,
                    {
                        fieldId: `maxChars${contentInput.id}`,
                        field: "Max length",
                        message: "Max length is required and must be greater than 0",
                    },
                ];
            });
        }

        if (errors && errors.length > 0) {
            return;
        }

        const form = new FormData();

        const stepData: ContentStepDataDto = {
            title: stepTitle,
            description: "",
            stepType: "CONTENT",
            stepNumber: 1,
            contentInputs: [{ inputLabel: contentInput.inputLabel, required: contentInput.required, maxChars: contentInput.maxChars, inputType: contentInput.inputType }],
        };

        form.append("stepData", JSON.stringify(stepData));
        form.append("action", "addContentStep");

        submit(form, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps?onboarding=true&stepNumber=4` });
    };

    const [stepTitle, setStepTitle] = useState<string>();
    const [contentInput, setContentInput] = useState<ContentInput>({
        id: 1,
        inputType: "TEXT",
        inputLabel: "",
        required: true,
        maxChars: 0,
        bundleStepId: 1,
    });

    const updateContentInput = (contentInput: ContentInput) => {
        setContentInput(contentInput);
    };

    //Update field error on change
    const updateFieldErrorHandler = (fieldId: string) => {
        setErrors((errors: error[]) => {
            const newErrors: error[] = errors.filter((error: error) => error.fieldId === fieldId);

            return newErrors;
        });
    };

    const removeContentInputFieldHandler = (inputId: number) => {
        setContentInput((contentInput: ContentInput) => {
            return {
                ...contentInput,
                id: contentInput.id - 1,
            };
        });
    };

    return (
        <div className={styles.fadeIn}>
            <BlockStack gap={"1000"} inlineAlign="center">
                {/*  */}
                <BlockStack gap={GapInsideSection}>
                    <Text as={"p"} variant="headingLg" alignment="center">
                        Enter the title for the second step
                    </Text>

                    <TextField
                        label="Step title"
                        labelHidden
                        error={stepTitle === "" ? "Step title is required" : ""}
                        type="text"
                        name={`stepTitle`}
                        value={stepTitle}
                        helpText="Customer will see this title when they build a bundle."
                        onChange={(newTitle: string) => {
                            setStepTitle(newTitle);
                        }}
                        autoComplete="off"
                    />
                </BlockStack>

                <BlockStack gap={"600"} inlineAlign="center">
                    <BlockStack gap={GapBetweenTitleAndContent}>
                        <Text as={"p"} variant="headingLg" alignment="center">
                            Configure the input fields for the second step
                        </Text>
                        <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                            This is a content step, where customers will need to enter content (text, numbers or image) into the input fields.
                        </Text>
                    </BlockStack>

                    <ContentStepInput
                        removeContentInputField={removeContentInputFieldHandler}
                        key={contentInput.id}
                        contentInput={contentInput}
                        single
                        errors={errors}
                        inputId={contentInput.id}
                        index={1}
                        updateFieldErrorHandler={updateFieldErrorHandler}
                        updateContentInput={updateContentInput}
                    />
                </BlockStack>

                {/*  */}
                <WideButton onClick={handleNextBtnHandler} />
            </BlockStack>
        </div>
    );
}
