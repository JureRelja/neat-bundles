import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useNavigation, useLoaderData, useParams, useActionData, useFetcher } from "@remix-run/react";
import { useNavigateSubmit } from "~/hooks/useNavigateSubmit";
import { Card, Button, BlockStack, TextField, Text, Box, SkeletonPage, InlineGrid, ButtonGroup, ChoiceList, InlineError, Layout, Banner } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { useEffect, useState } from "react";
import { GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection, HorizontalGap, LargeGapBetweenSections } from "../../constants";
import { BundleStep, Product, StepType } from "@prisma/client";
import { BundleStepContent, BundleStepProduct } from "~/adminBackend/service/dto/BundleStep";
import { error, JsonData } from "../../adminBackend/service/dto/jsonData";
import ResourcePicker from "~/components/resourcePicer";
import { ApiCacheKeyService } from "~/adminBackend/service/utils/ApiCacheKeyService";
import { ApiCacheService } from "~/adminBackend/service/utils/ApiCacheService";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { bundleBuilderProductInputRepository } from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderProductInputRepository";
import { bundleBuilderProductStepRepository } from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderProductStepRepository";
import { bundleBuilderContentStepService } from "~/adminBackend/service/impl/bundleBuilder/step/BundleBuilderContentStepService";
import { bundleBuilderProductStepService } from "~/adminBackend/service/impl/bundleBuilder/step/BundleBuilderProductStepService";
import { bundleBuilderStepService } from "~/adminBackend/service/impl/bundleBuilder/step/BundleBuilderStepService";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await authenticate.admin(request);

    console.log("I'm on stepNum.product loader");

    const stepData: BundleStepProduct | null = await bundleBuilderProductStepRepository.getStepByBundleIdAndStepNumber(Number(params.bundleid), Number(params.stepnum));

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

    console.log("I'm on stepNum.product", action);

    const bundleId = params.bundleid;

    if (!bundleId) {
        throw new Response(null, {
            status: 404,
            statusText: "Bundle id and step number are required",
        });
    }

    switch (action) {
        case "updateSelectedProducts": {
            const selectedProducts: { stepId: number; selectedProducts: Product[] } = JSON.parse(formData.get("selectedProducts") as string);

            await bundleBuilderProductInputRepository.updateSelectedProducts(selectedProducts.stepId, selectedProducts.selectedProducts);

            // Clear the cache for the step
            const cacheKeyService = new ApiCacheKeyService(session.shop);

            ApiCacheService.singleKeyDelete(cacheKeyService.getStepKey(params.stepnum as string, params.bundleid as string));

            return json(new JsonData(true, "success", "Selected products were updated"));
        }

        //Updating the step
        case "updateStep": {
            const stepData: BundleStep | BundleStepProduct | BundleStepContent = JSON.parse(formData.get("stepData") as string);

            const errors: error[] = [];

            const basicErrors = bundleBuilderStepService.checkIfErrorsInStepData(stepData);
            errors.push(...basicErrors);

            const stepSpecificErrors = bundleBuilderProductStepService.checkIfErrorsInStepData(stepData as BundleStepProduct);
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
                await bundleBuilderProductStepService.updateStep(stepData as BundleStepProduct);

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

                // return redirect(`/app/edit-bundle-builder/${params.bundleid}/builder/steps/${params.stepnum}/${stepData.stepType === StepType.PRODUCT ? "product" : "content"}`);
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
    const isLoading = nav.state != "idle";
    const navigateSubmit = useNavigateSubmit();
    const fetcher = useFetcher();

    const params = useParams();
    const actionData = useActionData<typeof action>();

    //Data that was previously submitted in the from
    const submittedStepData: BundleStepProduct = actionData?.data as BundleStepProduct;

    const errors = actionData?.errors as error[]; //Errors from the form submission

    console.log(errors);

    const serverStepData: BundleStepProduct = useLoaderData<typeof loader>().data; //Data that was loaded from the server

    //Diplaying previously submitted data if there were errors, otherwise displaying the data that was loaded from the server.
    const [stepData, setStepData] = useState<BundleStepProduct>(errors?.length === 0 || !errors ? serverStepData : submittedStepData);

    //update selected products
    const updateSelectedProducts = (products: Product[]) => {
        setStepData((stepData: BundleStepProduct) => {
            if (!stepData.productInput) return stepData;

            return {
                ...stepData,
                productInput: {
                    ...stepData.productInput,
                    products: products,
                },
            };
        });

        updateFieldErrorHandler("products");
    };

    //Navigating to the first error
    useEffect(() => {
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
            {isLoading || fetcher.state !== "idle" ? (
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
                                        <BlockStack gap={LargeGapBetweenSections}>
                                            <BlockStack gap={GapBetweenSections}>
                                                <Text as="h2" variant="headingMd">
                                                    Available products for customers to select
                                                </Text>
                                                {/* Commented for now. Users will only be able to select individual products. */}
                                                {/* <ChoiceList
                                                    title="Display products:"
                                                    name={`productResourceType`}
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
                                                    selected={[
                                                        stepData.productInput?.resourceType as string,
                                                    ]}
                                                    onChange={(selected: string[]) => {
                                                        setStepData((stepData: BundleStepProduct) => {
                                                        if (!stepData.productInput) return stepData;

                                                        return {
                                                            ...stepData,
                                                            productInput: {
                                                            ...stepData.productInput,
                                                            resourceType:
                                                                selected[0] as ProductResourceType,
                                                            productResources: [],
                                                            },
                                                        };
                                                        });
                                                    }}
                                                    /> 

                                                    <ResourcePicker
                                                    resourceType={
                                                        stepData.productInput
                                                        ?.resourceType as ProductResourceType
                                                    }
                                                    selectedResources={
                                                        stepData.productInput?.productResources as string[]
                                                    }
                                                    updateSelectedResources={updateSelectedResources}
                                                    />*/}
                                                <input
                                                    name="products[]"
                                                    type="hidden"
                                                    value={stepData.productInput?.products.map((product: Product) => product.shopifyProductId).join(",")}
                                                />
                                                <ResourcePicker
                                                    stepId={stepData.id}
                                                    selectedProducts={(stepData.productInput?.products as Product[]) || []}
                                                    updateSelectedProducts={updateSelectedProducts}
                                                />
                                                <InlineError message={errors?.find((err: error) => err.fieldId === "products")?.message || ""} fieldID="products" />
                                            </BlockStack>

                                            <BlockStack gap={GapBetweenSections}>
                                                <Text as="h2" variant="headingSm">
                                                    Product rules
                                                </Text>

                                                <InlineGrid columns={2} gap={HorizontalGap}>
                                                    <Box id="minProducts">
                                                        <TextField
                                                            label="Minimum products to select"
                                                            type="number"
                                                            helpText="Customers must select at least this number of products on this step."
                                                            autoComplete="off"
                                                            inputMode="numeric"
                                                            name={`minProductsToSelect`}
                                                            min={1}
                                                            value={stepData.productInput?.minProductsOnStep.toString()}
                                                            onChange={(value) => {
                                                                setStepData((stepData: BundleStepProduct) => {
                                                                    if (!stepData.productInput)
                                                                        return {
                                                                            ...stepData,
                                                                        };
                                                                    return {
                                                                        ...stepData,
                                                                        productInput: {
                                                                            ...stepData.productInput,
                                                                            minProductsOnStep: Number(value),
                                                                        },
                                                                    };
                                                                });
                                                                updateFieldErrorHandler("minProducts");
                                                            }}
                                                            error={errors?.find((err: error) => err.fieldId === "minProducts")?.message}
                                                        />
                                                    </Box>

                                                    <Box id="maxProducts">
                                                        <TextField
                                                            label="Maximum products to select"
                                                            helpText="Customers can select up to this number of products on this step."
                                                            type="number"
                                                            autoComplete="off"
                                                            inputMode="numeric"
                                                            name={`maxProductsToSelect`}
                                                            min={stepData.productInput?.minProductsOnStep || 1} //Maximum number of products needs to be equal or greater than the minimum number of products
                                                            value={stepData.productInput?.maxProductsOnStep.toString()}
                                                            onChange={(value) => {
                                                                setStepData((stepData: BundleStepProduct) => {
                                                                    if (!stepData.productInput) return stepData;
                                                                    return {
                                                                        ...stepData,
                                                                        productInput: {
                                                                            ...stepData.productInput,
                                                                            maxProductsOnStep: Number(value),
                                                                        },
                                                                    };
                                                                });
                                                                updateFieldErrorHandler("maxProducts");
                                                            }}
                                                            error={errors?.find((err: error) => err.fieldId === "maxProducts")?.message}
                                                        />
                                                    </Box>
                                                </InlineGrid>
                                                <ChoiceList
                                                    title="Display products"
                                                    allowMultiple
                                                    name={`displayProducts`}
                                                    choices={[
                                                        {
                                                            label: "Allow customers to select one product more than once",
                                                            value: "allowProductDuplicates",
                                                        },
                                                        {
                                                            label: "Show price under each product",
                                                            value: "showProductPrice",
                                                        },
                                                    ]}
                                                    selected={[
                                                        stepData.productInput?.allowProductDuplicates ? "allowProductDuplicates" : "",
                                                        stepData.productInput?.showProductPrice ? "showProductPrice" : "",
                                                    ]}
                                                    onChange={(selectedValues: string[]) => {
                                                        setStepData((stepData: BundleStepProduct) => {
                                                            if (!stepData.productInput) return stepData;
                                                            return {
                                                                ...stepData,
                                                                productInput: {
                                                                    ...stepData.productInput,
                                                                    allowProductDuplicates: selectedValues.includes("allowProductDuplicates"),
                                                                    showProductPrice: selectedValues.includes("showProductPrice"),
                                                                },
                                                            };
                                                        });
                                                    }}
                                                />
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
                                                        setStepData((stepData: BundleStepProduct) => {
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
                                                    helpText="Customer will se this description on this step."
                                                    onChange={(newDesc: string) => {
                                                        setStepData((stepData: BundleStepProduct) => {
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
                                                navigateSubmit("deleteStep", `/app/edit-bundle-builder/${params.bundleid}/builder/steps/${params.stepnum}?redirect=true`);
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
