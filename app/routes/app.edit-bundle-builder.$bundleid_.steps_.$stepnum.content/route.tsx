import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useNavigation, useLoaderData, useParams, useActionData } from "@remix-run/react";
import { useNavigateSubmit } from "~/hooks/useNavigateSubmit";
import { Card, Button, BlockStack, TextField, Text, Box, SkeletonPage, ButtonGroup, Layout, Banner } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { useEffect, useState } from "react";
import { GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection } from "../../constants";
import { BundleStep, ContentInput, StepType } from "@prisma/client";
import { BundleStepContent, BundleStepProduct } from "~/adminBackend/service/dto/BundleStep";
import { error, JsonData } from "../../adminBackend/service/dto/jsonData";
import ContentStepInputs from "~/components/contentStepInputs";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import bundleBuilderContentStepRepository from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderContentStepRepository";
import { bundleBuilderContentStepService } from "~/adminBackend/service/impl/bundleBuilder/step/BundleBuilderContentStepService";
import { bundleBuilderProductStepService } from "~/adminBackend/service/impl/bundleBuilder/step/BundleBuilderProductStepService";
import { bundleBuilderStepService } from "~/adminBackend/service/impl/bundleBuilder/step/BundleBuilderStepService";
import { ApiCacheKeyService } from "~/adminBackend/service/utils/ApiCacheKeyService";
import { ApiCacheService } from "~/adminBackend/service/utils/ApiCacheService";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await authenticate.admin(request);

    console.log("I'm on stepnum.content loader");

    const stepData: BundleStepContent | null = await bundleBuilderContentStepRepository.getStepByBundleIdAndStepNumber(Number(params.bundleid), Number(params.stepnum));

    if (!stepData) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    return json({
        ...new JsonData(true, "success", "Step data was loaded", [], stepData),
    });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);
    if (!user) return redirect("/app");

    const formData = await request.formData();
    const action = formData.get("action") as string;

    console.log("I'm on stepnum.content", action);

    switch (action) {
        //Updating the step
        case "updateStep": {
            const stepData: BundleStep | BundleStepProduct | BundleStepContent = JSON.parse(formData.get("stepData") as string);

            const errors: error[] = [];

            const basicErrors = bundleBuilderStepService.checkIfErrorsInStepData(stepData);
            errors.push(...basicErrors);

            const stepSpecificErrors = bundleBuilderContentStepService.checkIfErrorsInStepData(stepData as BundleStepContent);
            errors.push(...stepSpecificErrors);

            if (errors.length > 0) {
                return json(
                    {
                        ...new JsonData(false, "error", "There was an error with your request", errors, stepData),
                    },
                    { status: 400 },
                );
            }

            try {
                await bundleBuilderContentStepService.updateStep(stepData as BundleStepContent);

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await Promise.all([
                    ApiCacheService.singleKeyDelete(cacheKeyService.getStepKey(stepData.stepNumber.toString(), params.bundleid as string)),
                    ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string)),
                ]);

                return json(
                    {
                        ...new JsonData(true, "success", "Step succesfully updated", errors, stepData),
                    },
                    { status: 400 },
                );

                // return redirect(`/app/edit-bundle-builder/${params.bundleid}/steps/${params.stepnum}/${stepData.stepType === StepType.PRODUCT ? "product" : "content"}`);
            } catch (error) {
                console.log(error);
                return json(
                    {
                        ...new JsonData(false, "error", "There was an error with your request"),
                    },
                    { status: 400 },
                );
            }
        }
        default:
            return json(
                {
                    ...new JsonData(true, "success", "This is the default action that doesn't do anything"),
                },
                { status: 200 },
            );
    }
};

export default function Index() {
    const nav = useNavigation();
    const isLoading = nav.state === "loading";
    const isSubmitting = nav.state === "submitting";
    const navigateSubmit = useNavigateSubmit();

    const params = useParams();
    const actionData = useActionData<typeof action>();

    //Data that was previously submitted in the from
    const submittedStepData: BundleStepContent = actionData?.data as BundleStepContent;

    const errors = actionData?.errors as error[]; //Errors from the form submission

    const serverStepData: BundleStepContent = useLoaderData<typeof loader>().data; //Data that was loaded from the server

    //Diplaying previously submitted data if there were errors, otherwise displaying the data that was loaded from the server.
    const [stepData, setStepData] = useState<BundleStepContent>(errors?.length === 0 || !errors ? serverStepData : submittedStepData);

    const updateContentInput = (contentInput: ContentInput) => {
        setStepData((stepData: BundleStepContent) => {
            return {
                ...stepData,
                contentInputs: stepData.contentInputs.map((input: ContentInput) => {
                    if (input.id === contentInput.id) {
                        return contentInput;
                    }
                    return input;
                }),
            };
        });
    };

    //Navigating to the first error
    useEffect(() => {
        if (errors && errors.length === 0) {
            window.scrollTo(0, 0);
            return;
        }

        errors?.forEach((err: error) => {
            if (err.fieldId) {
                document.getElementById(err.fieldId)?.scrollIntoView();
                return;
            }
        });
    }, [isLoading]);

    //Update field error on change
    const updateFieldErrorHandler = (fieldId: string) => {
        errors?.forEach((err: error) => {
            if (err.fieldId === fieldId) {
                err.message = "";
            }
        });
    };

    return (
        <>
            {isLoading || isSubmitting ? (
                <SkeletonPage primaryAction fullWidth></SkeletonPage>
            ) : (
                <BlockStack gap={GapBetweenTitleAndContent}>
                    {errors && errors.length === 0 ? (
                        <Banner title="Step updated!" tone="success" onDismiss={() => {}}>
                            <BlockStack gap={GapInsideSection}>
                                <Text as={"p"} variant="headingMd">
                                    You succesfuly updated this step.
                                </Text>
                            </BlockStack>
                        </Banner>
                    ) : null}
                    <Form method="POST" data-discard-confirmation data-save-bar>
                        <input type="hidden" name="action" defaultValue="updateStep" />
                        <input type="hidden" name="stepData" value={JSON.stringify(stepData)} />
                        <BlockStack gap={GapBetweenSections}>
                            <Layout>
                                <Layout.Section>
                                    <Card>
                                        <BlockStack gap={GapBetweenTitleAndContent}>
                                            <Text as="h2" variant="headingMd">
                                                Step settings
                                            </Text>

                                            <BlockStack gap={GapBetweenSections}>
                                                {stepData.contentInputs.map((contentInput) => (
                                                    <ContentStepInputs
                                                        key={contentInput.id}
                                                        contentInput={contentInput}
                                                        errors={errors}
                                                        inputId={contentInput.id}
                                                        updateFieldErrorHandler={updateFieldErrorHandler}
                                                        updateContentInput={updateContentInput}
                                                    />
                                                ))}
                                            </BlockStack>
                                        </BlockStack>
                                    </Card>
                                </Layout.Section>

                                <Layout.Section variant="oneThird">
                                    <BlockStack gap={GapBetweenSections}>
                                        <Card>
                                            <BlockStack gap={GapInsideSection}>
                                                <Text as="h2" variant="headingMd">
                                                    Step details
                                                </Text>

                                                <TextField
                                                    label="Step title"
                                                    error={errors?.find((err: error) => err.fieldId === "stepTitle")?.message}
                                                    type="text"
                                                    name={`stepTitle`}
                                                    value={stepData.title}
                                                    helpText="Customer will see this title when they build a bundle."
                                                    onChange={(newTitle: string) => {
                                                        setStepData((stepData: BundleStepContent) => {
                                                            return {
                                                                ...stepData,
                                                                title: newTitle,
                                                            };
                                                        });
                                                        updateFieldErrorHandler("stepTitle");
                                                    }}
                                                    autoComplete="off"
                                                />

                                                <TextField
                                                    label="Step description"
                                                    value={stepData.description}
                                                    type="text"
                                                    name={`stepDescription`}
                                                    helpText="This description will be displayed to the customer."
                                                    onChange={(newDesc: string) => {
                                                        setStepData((stepData: BundleStepContent) => {
                                                            return {
                                                                ...stepData,
                                                                description: newDesc,
                                                            };
                                                        });
                                                        updateFieldErrorHandler("stepDESC");
                                                    }}
                                                    error={errors?.find((err: error) => err.fieldId === "stepDESC")?.message}
                                                    autoComplete="off"
                                                />
                                            </BlockStack>
                                        </Card>
                                    </BlockStack>
                                </Layout.Section>
                            </Layout>

                            {/* Save action */}
                            <Box width="full">
                                <BlockStack inlineAlign="end">
                                    <ButtonGroup>
                                        <Button
                                            variant="primary"
                                            tone="critical"
                                            onClick={async (): Promise<void> => {
                                                await shopify.saveBar.leaveConfirmation();
                                                navigateSubmit("deleteStep", `${params.stepnum}?redirect=true`);
                                            }}>
                                            Delete
                                        </Button>
                                        <Button variant="primary" submit>
                                            Save step
                                        </Button>
                                    </ButtonGroup>
                                </BlockStack>
                            </Box>
                        </BlockStack>
                    </Form>
                </BlockStack>
            )}
        </>
    );
}
