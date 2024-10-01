import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, useNavigation, useLoaderData, useParams, useActionData } from '@remix-run/react';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import {
    Card,
    Button,
    BlockStack,
    TextField,
    Text,
    Box,
    SkeletonPage,
    SkeletonBodyText,
    SkeletonDisplayText,
    InlineGrid,
    ButtonGroup,
    ChoiceList,
    Divider,
    InlineError,
} from '@shopify/polaris';

import { authenticate } from '../../shopify.server';
import { useEffect, useState } from 'react';
import { GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection, HorizontalGap } from '../../constants';
import db from '../../db.server';
import { StepType, ContentInput, Product } from '@prisma/client';
import { BundleStepAllResources, bundleStepFull } from '~/types/BundleStep';
import { error, JsonData } from '../../types/jsonData';
import ContentStepInputs from './content-step-inputs';
import ResourcePicker from './resource-picker';
import { ApiCacheService } from '~/service/impl/ApiCacheService';
import { ApiCacheKeyService } from '~/service/impl/ApiCacheKeyService';
import { s } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await authenticate.admin(request);

    const stepData: BundleStepAllResources | null = await db.bundleStep.findFirst({
        where: {
            bundleBuilderId: Number(params.bundleid),
            stepNumber: Number(params.stepnum),
        },
        include: bundleStepFull,
    });

    if (!stepData) {
        throw new Response(null, {
            status: 404,
            statusText: 'Not Found',
        });
    }

    return json({
        ...new JsonData(true, 'success', 'Step data was loaded', [], stepData),
    });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action') as string;

    const bundleId = params.bundleid;
    const stepNum = params.stepnum;
    const shop = session.shop;

    if (!bundleId || !stepNum) {
        return json(
            {
                ...new JsonData(false, 'error', 'There was an error with your request', [
                    {
                        fieldId: 'bundleId',
                        field: 'Bundle Id',
                        message: 'Bundle Id is missing.',
                    },
                    {
                        fieldId: 'stepNum',
                        field: 'Step Number',
                        message: 'Step Number is missing.',
                    },
                ]),
            },
            { status: 400 },
        );
    }

    switch (action) {
        //Deleting the step from the bundle
        case 'deleteStep': {
            try {
                await db.$transaction([
                    db.bundleStep.deleteMany({
                        where: {
                            bundleBuilderId: Number(params.bundleid),
                            stepNumber: Number(params.stepnum),
                        },
                    }),
                    db.bundleStep.updateMany({
                        where: {
                            bundleBuilderId: Number(params.bundleid),
                            stepNumber: {
                                gt: Number(params.stepnum),
                            },
                        },
                        data: {
                            stepNumber: {
                                decrement: 1,
                            },
                        },
                    }),
                ]);
            } catch (error) {
                return json(
                    {
                        ...new JsonData(false, 'error', 'There was an error with trying to delete the step'),
                    },
                    { status: 400 },
                );
            }

            const url = new URL(request.url);

            if (url.searchParams.has('redirect') && url.searchParams.get('redirect') === 'true') {
                return redirect(`/app/bundles/${params.bundleid}`);
            }

            // Clear the cache for the bundle
            const cacheKeyService = new ApiCacheKeyService(session.shop);

            await Promise.all([
                ApiCacheService.multiKeyDelete(await cacheKeyService.getAllStepsKeys(params.bundleid as string)),
                ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string)),
            ]);

            return json({
                ...new JsonData(true, 'success', 'Step was deleted'),
            });
        }

        //Duplicating the step
        case 'duplicateStep': {
            const numOfSteps = await db.bundleStep.aggregate({
                _max: {
                    stepNumber: true,
                },
                where: {
                    bundleBuilderId: Number(params.bundleid),
                },
            });

            if (numOfSteps._max.stepNumber === 5)
                return json(
                    {
                        ...new JsonData(false, 'error', 'There was an error with your request', [
                            {
                                fieldId: 'stepsLength',
                                field: 'Steps Length',
                                message: "You can't have more than 5 steps in a bundle.",
                            },
                        ]),
                    },
                    { status: 400 },
                );

            try {
                let stepToDuplicate: BundleStepAllResources | null = await db.bundleStep.findFirst({
                    where: {
                        bundleBuilderId: Number(params.bundleid),
                        stepNumber: Number(params.stepnum),
                    },
                    include: bundleStepFull,
                });

                if (!stepToDuplicate) {
                    return json(
                        {
                            ...new JsonData(false, 'error', 'Thre was an error with your request', [
                                {
                                    fieldId: 'stepId',
                                    field: 'Step Id',
                                    message: "Bundle step with the entered 'stepId' doesn't exist.",
                                },
                            ]),
                        },
                        { status: 400 },
                    );
                }

                //Creating a new step with the same data as the duplicated step
                if (stepToDuplicate.stepType === StepType.PRODUCT) {
                    //Incrementing the step number for all steps with stepNumber greater than the duplicated step and then creating a new step with the same data as the duplicated step
                    await db.$transaction([
                        //Incrementing the step number for all steps with stepNumber greater than the duplicated step
                        db.bundleStep.updateMany({
                            where: {
                                bundleBuilderId: Number(params.bundleid),
                                stepNumber: {
                                    gt: Number(params.stepnum),
                                },
                            },
                            data: {
                                stepNumber: {
                                    increment: 1,
                                },
                            },
                        }),
                        db.bundleStep.create({
                            data: {
                                bundleBuilderId: Number(params.bundleid),
                                stepNumber: stepToDuplicate.stepNumber + 1,
                                title: `${stepToDuplicate.title} - Copy`,
                                description: stepToDuplicate.description,
                                stepType: stepToDuplicate.stepType,
                                contentInputs: {
                                    createMany: {
                                        data: [
                                            {
                                                inputType: 'TEXT',
                                                inputLabel: 'Enter text',
                                                maxChars: 50,
                                                required: true,
                                            },
                                            {
                                                inputLabel: '',
                                                maxChars: 0,
                                                required: false,
                                                inputType: 'NONE',
                                            },
                                        ],
                                    },
                                },
                                productInput: {
                                    create: {
                                        minProductsOnStep: stepToDuplicate.productInput?.minProductsOnStep as number,
                                        maxProductsOnStep: stepToDuplicate.productInput?.maxProductsOnStep as number,
                                        allowProductDuplicates: stepToDuplicate.productInput?.allowProductDuplicates as boolean,
                                        showProductPrice: stepToDuplicate.productInput?.showProductPrice as boolean,
                                        products: {
                                            connect: stepToDuplicate.productInput?.products.map((product: Product) => {
                                                return { shopifyProductId: product.shopifyProductId };
                                            }),
                                        },
                                    },
                                },
                            },
                        }),
                    ]);
                } else if (stepToDuplicate.stepType === StepType.CONTENT) {
                    //Incrementing the step number for all steps with stepNumber greater than the duplicated step and then creating a new step with the same data as the duplicated step
                    await db.$transaction([
                        db.bundleStep.updateMany({
                            where: {
                                bundleBuilderId: Number(params.bundleid),
                                stepNumber: {
                                    gt: Number(params.stepnum),
                                },
                            },
                            data: {
                                stepNumber: {
                                    increment: 1,
                                },
                            },
                        }),
                        db.bundleStep.create({
                            data: {
                                bundleBuilderId: Number(params.bundleid),
                                stepNumber: stepToDuplicate.stepNumber + 1,
                                title: `${stepToDuplicate.title} - Copy`,
                                description: stepToDuplicate.description,
                                stepType: stepToDuplicate.stepType,
                                productInput: {
                                    create: {
                                        minProductsOnStep: 1,
                                        maxProductsOnStep: 3,
                                        allowProductDuplicates: false,
                                        showProductPrice: true,
                                    },
                                },
                                contentInputs: {
                                    createMany: {
                                        data: stepToDuplicate.contentInputs.map((contentStep: ContentInput) => {
                                            return {
                                                inputType: contentStep.inputType,
                                                inputLabel: contentStep.inputLabel,
                                                maxChars: contentStep.maxChars,
                                                required: contentStep.required,
                                            };
                                        }),
                                    },
                                },
                            },
                        }),
                    ]);
                }

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await Promise.all([
                    ApiCacheService.multiKeyDelete(await cacheKeyService.getAllStepsKeys(params.bundleid as string)),
                    ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string)),
                ]);

                return json({
                    ...new JsonData(true, 'success', 'Step was duplicated'),
                });
                // return redirect(`/app/bundles/${params.bundleid}/`);
            } catch (error) {
                console.log(error);
                return json(
                    {
                        ...new JsonData(false, 'error', 'Error while duplicating a step'),
                    },
                    { status: 400 },
                );
            }
        }

        //Updating the step
        case 'updateStep': {
            const stepData: BundleStepAllResources = JSON.parse(formData.get('stepData') as string);

            const errors: error[] = [];

            if (!stepData.title) {
                errors.push({
                    fieldId: 'stepTitle',
                    field: 'Step title',
                    message: 'Step title needs to be entered.',
                });
            } else if (!stepData.description) {
                errors.push({
                    fieldId: 'stepDESC',
                    field: 'Step description',
                    message: 'Step description needs to be entered.',
                });
            } else if (!stepData.productInput?.minProductsOnStep) {
                errors.push({
                    fieldId: 'minProducts',
                    field: 'Minimum products on step',
                    message: 'Please enter the minimum number of products (1 or more) that the customer can select on this step.',
                });
            } else if (!stepData.productInput?.maxProductsOnStep) {
                errors.push({
                    fieldId: 'maxProducts',
                    field: 'Maximum products on step',
                    message: 'Please enter the maximum number of products (1 or more) that the customer can select on this step.',
                });
            } else if (stepData.productInput?.minProductsOnStep > stepData.productInput?.maxProductsOnStep) {
                errors.push({
                    fieldId: 'minProducts',
                    field: 'Minimum products on step',
                    message: 'Minimum number of products can not be greater than the maximum number of products.',
                });
            } else if (stepData.productInput?.products.length < stepData.productInput.minProductsOnStep) {
                errors.push({
                    fieldId: 'products',
                    field: 'Minimum products on step',
                    message: 'The amount of products you selected is under the minimum amount of products defined.',
                });
            } else if (stepData.productInput?.products.length > stepData.productInput.maxProductsOnStep) {
                errors.push({
                    fieldId: 'products',
                    field: 'Maximum products on step',
                    message: 'The amount of products you selected is over the maximum amount of products defined.',
                });
            }

            if (errors.length > 0)
                return json({
                    ...new JsonData<BundleStepAllResources>(false, 'error', 'There was an error while trying to update the bundle.', errors, stepData),
                });

            try {
                //Adding the products data to the step
                if (stepData.stepType === StepType.PRODUCT) {
                    const res = await db.bundleStep.update({
                        where: {
                            id: stepData.id,
                        },
                        data: {
                            title: stepData.title,
                            description: stepData.description,
                            stepType: stepData.stepType,
                            productInput: {
                                update: {
                                    minProductsOnStep: stepData.productInput?.minProductsOnStep,
                                    maxProductsOnStep: stepData.productInput?.maxProductsOnStep,
                                    allowProductDuplicates: stepData.productInput?.allowProductDuplicates,
                                    showProductPrice: stepData.productInput?.showProductPrice,
                                    products: {
                                        set: [],
                                        connectOrCreate: stepData.productInput?.products.map((product: Product) => {
                                            return {
                                                where: {
                                                    shopifyProductId: product.shopifyProductId,
                                                },
                                                create: {
                                                    shopifyProductId: product.shopifyProductId,
                                                    shopifyProductHandle: product.shopifyProductHandle,
                                                },
                                            };
                                        }),
                                    },
                                },
                            },
                        },
                    });

                    //Adding the content inputs to the step
                } else if (stepData.stepType === StepType.CONTENT) {
                    await db.bundleStep.update({
                        where: {
                            id: stepData.id,
                        },
                        data: {
                            title: stepData.title,
                            description: stepData.description,
                            stepType: stepData.stepType,
                            contentInputs: {
                                updateMany: stepData.contentInputs.map((input: ContentInput) => {
                                    return {
                                        where: {
                                            id: input.id,
                                        },
                                        data: {
                                            inputType: input.inputType,
                                            inputLabel: input.inputLabel,
                                            maxChars: input.maxChars,
                                            required: input.required,
                                        },
                                    };
                                }),
                            },
                        },
                    });
                }

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await Promise.all([
                    ApiCacheService.singleKeyDelete(cacheKeyService.getStepKey(stepData.stepNumber.toString(), params.bundleid as string)),
                    ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string)),
                ]);

                return redirect(`/app/bundles/${params.bundleid}`);
            } catch (error) {
                console.log(error);
                return json(
                    {
                        ...new JsonData(false, 'error', 'There was an error with your request'),
                    },
                    { status: 400 },
                );
            }
        }

        default:
            return json(
                {
                    ...new JsonData(true, 'success', "This is the default action that doesn't do anything"),
                },
                { status: 200 },
            );
    }
};

export default function Index() {
    const nav = useNavigation();
    const isLoading = nav.state === 'loading';
    const isSubmitting = nav.state === 'submitting';
    const navigateSubmit = useNavigateSubmit();
    const params = useParams();
    const actionData = useActionData<typeof action>();

    //Data that was previously submitted in the from
    const submittedStepData: BundleStepAllResources = actionData?.data as BundleStepAllResources;

    const errors = actionData?.errors; //Errors from the form submission

    const serverStepData: BundleStepAllResources = useLoaderData<typeof loader>().data; //Data that was loaded from the server

    //Diplaying previously submitted data if there were errors, otherwise displaying the data that was loaded from the server.
    const [stepData, setStepData] = useState<BundleStepAllResources>(errors?.length === 0 || !errors ? serverStepData : submittedStepData);

    const updateSelectedProducts = (products: Product[]) => {
        setStepData((stepData: BundleStepAllResources) => {
            if (!stepData.productInput) return stepData;

            return {
                ...stepData,
                productInput: {
                    ...stepData.productInput,
                    products: products,
                },
            };
        });
    };

    const updateContentInput = (contentInput: ContentInput) => {
        setStepData((stepData: BundleStepAllResources) => {
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
        errors?.forEach((err: error) => {
            if (err.fieldId) {
                document.getElementById(err.fieldId)?.scrollIntoView();
                return;
            }
        });
    }, [isLoading]);

    return (
        <>
            {isLoading || isSubmitting ? (
                <SkeletonPage primaryAction fullWidth></SkeletonPage>
            ) : (
                <Form method="POST" data-discard-confirmation data-save-bar>
                    <input type="hidden" name="action" value="updateStep" />
                    <input type="hidden" name="stepData" value={JSON.stringify(stepData)} />
                    <BlockStack gap={GapBetweenSections}>
                        <Card>
                            <BlockStack gap={GapBetweenTitleAndContent}>
                                <Text as="h2" variant="headingMd">
                                    Step settings
                                </Text>
                                <BlockStack gap={GapBetweenSections}>
                                    <BlockStack gap={GapInsideSection}>
                                        <Box id="stepTitle">
                                            <TextField
                                                label="Step title"
                                                error={errors?.find((err: error) => err.fieldId === 'stepTitle')?.message}
                                                type="text"
                                                name={`stepTitle`}
                                                value={stepData.title}
                                                onChange={(newTitle: string) => {
                                                    setStepData((stepData: BundleStepAllResources) => {
                                                        return {
                                                            ...stepData,
                                                            title: newTitle,
                                                        };
                                                    });
                                                }}
                                                autoComplete="off"
                                            />
                                        </Box>
                                        <Box id="stepDESC">
                                            <TextField
                                                label="Step description"
                                                value={stepData.description}
                                                type="text"
                                                name={`stepDescription`}
                                                onChange={(newDesc: string) => {
                                                    setStepData((stepData: BundleStepAllResources) => {
                                                        return {
                                                            ...stepData,
                                                            description: newDesc,
                                                        };
                                                    });
                                                }}
                                                error={errors?.find((err: error) => err.fieldId === 'stepDESC')?.message}
                                                autoComplete="off"
                                            />
                                        </Box>
                                    </BlockStack>
                                    <ChoiceList
                                        title="Step type:"
                                        name={`stepType`}
                                        choices={[
                                            {
                                                label: 'Product step',
                                                value: StepType.PRODUCT,
                                                helpText: `Customers can choose products on this step`,
                                            },
                                            {
                                                label: 'Content step',
                                                value: StepType.CONTENT,
                                                helpText: `Customer can add text or images on this step`,
                                            },
                                        ]}
                                        selected={[stepData.stepType]}
                                        onChange={(selected: string[]) => {
                                            setStepData((stepData: BundleStepAllResources) => {
                                                return {
                                                    ...stepData,
                                                    stepType: selected[0] as StepType,
                                                };
                                            });
                                        }}
                                    />

                                    <Divider borderColor="border-inverse" />
                                    {stepData.stepType === StepType.PRODUCT ? (
                                        <>
                                            <BlockStack gap={GapInsideSection}>
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
                                                        setStepData((stepData: BundleStepAllResources) => {
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

                                                <ResourcePicker selectedProducts={stepData.productInput?.products as Product[]} updateSelectedProducts={updateSelectedProducts} />
                                                <InlineError message={errors?.find((err: error) => err.fieldId === 'products')?.message || ''} fieldID="products" />
                                            </BlockStack>

                                            <Divider />
                                            <BlockStack gap={GapInsideSection}>
                                                <Text as="p">Rules</Text>

                                                <InlineGrid columns={2} gap={HorizontalGap}>
                                                    <Box id="minProducts">
                                                        <TextField
                                                            label="Minimum products to select"
                                                            type="number"
                                                            autoComplete="off"
                                                            inputMode="numeric"
                                                            name={`minProductsToSelect`}
                                                            min={1}
                                                            value={stepData.productInput?.minProductsOnStep.toString()}
                                                            onChange={(value) => {
                                                                setStepData((stepData: BundleStepAllResources) => {
                                                                    if (!stepData.productInput) return stepData;
                                                                    return {
                                                                        ...stepData,
                                                                        productInput: {
                                                                            ...stepData.productInput,
                                                                            minProductsOnStep: Number(value),
                                                                        },
                                                                    };
                                                                });
                                                            }}
                                                            error={errors?.find((err: error) => err.fieldId === 'minProducts')?.message}
                                                        />
                                                    </Box>

                                                    <Box id="maxProducts">
                                                        <TextField
                                                            label="Maximum products to select"
                                                            type="number"
                                                            autoComplete="off"
                                                            inputMode="numeric"
                                                            name={`maxProductsToSelect`}
                                                            min={stepData.productInput?.minProductsOnStep || 1} //Maximum number of products needs to be equal or greater than the minimum number of products
                                                            value={stepData.productInput?.maxProductsOnStep.toString()}
                                                            onChange={(value) => {
                                                                setStepData((stepData: BundleStepAllResources) => {
                                                                    if (!stepData.productInput) return stepData;
                                                                    return {
                                                                        ...stepData,
                                                                        productInput: {
                                                                            ...stepData.productInput,
                                                                            maxProductsOnStep: Number(value),
                                                                        },
                                                                    };
                                                                });
                                                            }}
                                                            error={errors?.find((err: error) => err.fieldId === 'maxProducts')?.message}
                                                        />
                                                    </Box>
                                                </InlineGrid>
                                                <ChoiceList
                                                    title="Display products"
                                                    allowMultiple
                                                    name={`displayProducts`}
                                                    choices={[
                                                        {
                                                            label: 'Allow customers to select one product more than once',
                                                            value: 'allowProductDuplicates',
                                                        },
                                                        {
                                                            label: 'Show price under each product',
                                                            value: 'showProductPrice',
                                                        },
                                                    ]}
                                                    selected={[
                                                        stepData.productInput?.allowProductDuplicates ? 'allowProductDuplicates' : '',
                                                        stepData.productInput?.showProductPrice ? 'showProductPrice' : '',
                                                    ]}
                                                    onChange={(selectedValues: string[]) => {
                                                        setStepData((stepData: BundleStepAllResources) => {
                                                            if (!stepData.productInput) return stepData;
                                                            return {
                                                                ...stepData,
                                                                productInput: {
                                                                    ...stepData.productInput,
                                                                    allowProductDuplicates: selectedValues.includes('allowProductDuplicates'),
                                                                    showProductPrice: selectedValues.includes('showProductPrice'),
                                                                },
                                                            };
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
                            </BlockStack>
                        </Card>

                        {/* Save action */}
                        <Box width="full">
                            <BlockStack inlineAlign="end">
                                <ButtonGroup>
                                    <Button
                                        variant="primary"
                                        tone="critical"
                                        onClick={async (): Promise<void> => {
                                            await shopify.saveBar.leaveConfirmation();
                                            navigateSubmit('deleteStep', `/app/bundles/${params.bundleid}/steps/${params.stepnum}?redirect=true`);
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
            )}
        </>
    );
}
