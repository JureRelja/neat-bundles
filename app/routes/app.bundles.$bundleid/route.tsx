import { json, redirect } from '@remix-run/node';
import { Link, useActionData, useNavigate, Form, useNavigation, useLoaderData, useParams } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
    Page,
    Card,
    Button,
    BlockStack,
    TextField,
    Text,
    Box,
    SkeletonPage,
    ChoiceList,
    SkeletonBodyText,
    SkeletonDisplayText,
    ButtonGroup,
    DataTable,
    EmptyState,
    InlineStack,
    Badge,
    Select,
    Tooltip,
    Icon,
    Spinner,
    Divider,
    Layout,
} from '@shopify/polaris';
import {
    DeleteIcon,
    PlusIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    PageAddIcon,
    EditIcon,
    QuestionCircleIcon,
    ExternalIcon,
    SettingsIcon,
    ClipboardIcon,
    RefreshIcon,
} from '@shopify/polaris-icons';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import { useEffect, useState } from 'react';
import { bundlePagePreviewKey, GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection } from '../../constants';
import db from '../../db.server';
import { StepType, BundlePricing, BundleDiscountType } from '@prisma/client';
import { BundleStepBasicResources } from '../../adminBackend/service/dto/BundleStep';
import { BundleFullStepBasicClient, BundleFullStepBasicServer, inclBundleFullStepsBasic } from '../../adminBackend/service/dto/Bundle';
import { JsonData, error } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '../../hooks/useNavigateSubmit';
import styles from './route.module.css';
import { ApiCacheService } from '~/adminBackend/service/utils/ApiCacheService';
import { ApiCacheKeyService } from '~/adminBackend/service/utils/ApiCacheKeyService';
import { shopifyBundleBuilderProductRepository } from '~/adminBackend/repository/impl/ShopifyBundleBuilderProductRepository';
import shopifyBundleBuilderPageRepositoryGraphql from '~/adminBackend/repository/impl/ShopifyBundleBuilderPageRepositoryGraphql';
import { ShopifyBundleBuilderPageRepository } from '~/adminBackend/repository/ShopifyBundleBuilderPageRepository';
import { BundleBuilderRepository } from '@adminBackend/repository/impl/BundleBuilderRepository';
import userRepository from '~/adminBackend/repository/impl/UserRepository';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const bundleBuilder = await db.bundleBuilder.findUnique({
        where: {
            id: Number(params.bundleid),
        },
        include: inclBundleFullStepsBasic,
    });

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: 'Not Found',
        });
    }

    const user = await userRepository.getUserByStoreUrl(admin, session.shop);

    //Url of the bundle page
    const bundleBuilderPageUrl = `${user.primaryDomain}/pages/${bundleBuilder.bundleBuilderPageHandle}`;

    const bundleBuilderWithPageUrl: BundleFullStepBasicServer = { ...bundleBuilder, bundleBuilderPageUrl };

    return json(new JsonData(true, 'success', 'Bundle succesfuly retrieved', [], bundleBuilderWithPageUrl), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case 'deleteBundle': {
            try {
                //Delete the bundle along with its steps, contentInputs, bundleSettings?, bundleColors, and bundleLabels
                const bundleBuilderToDelete = await db.bundleBuilder.update({
                    where: {
                        id: Number(params.bundleid),
                    },
                    data: {
                        deleted: true,
                    },
                    select: {
                        shopifyProductId: true,
                        shopifyPageId: true,
                    },
                });

                if (!bundleBuilderToDelete)
                    return json(
                        {
                            ...new JsonData(false, 'error', 'There was an error with your request', [
                                {
                                    fieldId: 'bundleId',
                                    field: 'Bundle ID',
                                    message: "Bundle with the provided id doesn't exist.",
                                },
                            ]),
                        },
                        { status: 400 },
                    );

                const shopifyBundleBuilderPage: ShopifyBundleBuilderPageRepository = shopifyBundleBuilderPageRepositoryGraphql;

                await Promise.all([
                    //Deleting a associated bundle page
                    shopifyBundleBuilderPage.deletePage(admin, session, bundleBuilderToDelete.shopifyPageId),

                    //Deleting a associated bundle product
                    shopifyBundleBuilderProductRepository.deleteBundleBuilderProduct(admin, bundleBuilderToDelete.shopifyProductId),
                ]);
            } catch (error) {
                console.log(error, 'Either the bundle product or the bundle page was already deleted.');
            } finally {
                const url: URL = new URL(request.url);

                if (url.searchParams.get('redirect') === 'true') {
                    return redirect('/app');
                }

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);
                ApiCacheKeyService;
                await ApiCacheService.multiKeyDelete(await cacheKeyService.getAllBundleKeys(params.bundleid as string));

                return json({ ...new JsonData(true, 'success', 'Bundle deleted') }, { status: 200 });
            }
        }

        //Update the bundle
        case 'updateBundle':
            const bundleData: BundleFullStepBasicClient = JSON.parse(formData.get('bundle') as string);

            const errors: error[] = [];

            if (!bundleData.title) {
                errors.push({
                    fieldId: 'bundleTitle',
                    field: 'Bundle title',
                    message: 'Please enter a bundle title.',
                });
            } else if (bundleData.pricing === BundlePricing.FIXED && (!bundleData.priceAmount || bundleData.priceAmount < 0)) {
                errors.push({
                    fieldId: 'priceAmount',
                    field: 'Price amount',
                    message: 'Please enter a valid price for Fixed bundle.',
                });
            } else if (bundleData.discountType != 'NO_DISCOUNT' && bundleData.discountValue <= 0) {
                errors.push({
                    fieldId: 'discountValue',
                    field: 'Discount value',
                    message: 'Please enter a desired discount.',
                });
            }

            if (errors.length > 0)
                return json({
                    ...new JsonData(false, 'error', 'There was an error while trying to update the bundle.', errors, bundleData),
                });

            //Repository for creating a new page
            const shopifyBundleBuilderPage: ShopifyBundleBuilderPageRepository = shopifyBundleBuilderPageRepositoryGraphql;

            try {
                await Promise.all([
                    db.bundleBuilder.update({
                        where: {
                            id: Number(bundleData.id),
                        },
                        data: {
                            title: bundleData.title,
                            published: bundleData.published,
                            priceAmount: bundleData.priceAmount,
                            pricing: bundleData.pricing,
                            discountType: bundleData.discountType,
                            discountValue: bundleData.discountValue,
                        },
                    }),
                    shopifyBundleBuilderProductRepository.updateBundleProductTitle(admin, bundleData.shopifyProductId, bundleData.title),
                    shopifyBundleBuilderPage.updateBundleBuilderPageTitle(admin, session, bundleData.shopifyPageId, bundleData.title),
                ]);

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string));

                return json({ ...new JsonData(true, 'success', 'Bundle updated') }, { status: 200 });
                //return redirect(`/app`);
            } catch (error) {
                console.log(error);

                return json({
                    ...new JsonData(false, 'error', 'There was an error while trying to update the bundle.', [
                        {
                            fieldId: 'Bundle',
                            field: 'Bundle',
                            message: 'Error updating the bundle',
                        },
                    ]),
                });
            }

        case 'recreateBundleBuilder': {
            //Repository for creating a new page
            const shopifyBundleBuilderPage: ShopifyBundleBuilderPageRepository = shopifyBundleBuilderPageRepositoryGraphql;

            const bundleBuilder = await db.bundleBuilder.findUnique({
                where: {
                    id: Number(params.bundleid),
                },
                include: inclBundleFullStepsBasic,
            });

            if (!bundleBuilder) {
                return json(
                    {
                        ...new JsonData(false, 'error', 'There was an error with your request', [
                            {
                                fieldId: 'bundleId',
                                field: 'Bundle ID',
                                message: "Bundle with the provided id doesn't exist.",
                            },
                        ]),
                    },
                    { status: 400 },
                );
            }

            await Promise.all([
                new Promise(async (res, rej) => {
                    //Check if the bundle builder product exists (it may have been deleted by the user on accident)
                    const doesBundleBuilderProductExist = await shopifyBundleBuilderProductRepository.checkIfProductExists(admin, bundleBuilder.shopifyProductId);

                    if (!doesBundleBuilderProductExist) {
                        //create new product
                        const newBundleBuilderProductId = await shopifyBundleBuilderProductRepository.createBundleProduct(admin, bundleBuilder.title, session.shop);

                        //set bundle product to new product
                        await BundleBuilderRepository.updateBundleBuilderProductId(Number(params.bundleid), newBundleBuilderProductId);
                    }
                    res(null);
                }),

                new Promise(async (res, rej) => {
                    //Check if the page exists
                    const doesBundleBuilderPageExist = await shopifyBundleBuilderPage.checkIfPageExists(admin, bundleBuilder.shopifyPageId);

                    if (!doesBundleBuilderPageExist) {
                        //create new page
                        const newBundleBuilderPage = await shopifyBundleBuilderPage.createPageWithMetafields(admin, session, bundleBuilder.title, Number(params.bundleid));

                        //set bundle page to new page
                        await BundleBuilderRepository.updateBundleBuilderPage(Number(params.bundleid), newBundleBuilderPage);
                    }
                    res(null);
                }),
            ]);

            return json({ ...new JsonData(true, 'success', 'Bundle builder refreshed') }, { status: 200 });
        }

        // case "duplicateBundle":
        //   const bundleToDuplicate: BundleAllResources | null =
        //     await db.bundle.findUnique({
        //       where: {
        //         id: Number(params.bundleid),
        //       },
        //       include: bundleAllResources,
        //     });

        //   if (!bundleToDuplicate) {
        //     return json(
        //       {
        //         ...new JsonData(
        //           false,
        //           "error",
        //           "There was an error with your request",
        //           "The bundle you are trying to duplicate does not exist",
        //         ),
        //       },
        //       { status: 400 },
        //     );
        //   }

        //   try {
        //     //Create a new product that will be used as a bundle wrapper
        //     const { _max }: { _max: { id: number | null } } =
        //       await db.bundle.aggregate({
        //         _max: {
        //           id: true,
        //         },
        //         where: {
        //           storeUrl: session.shop,
        //         },
        //       });

        //     //Create a new product that will be used as a bundle wrapper
        //     const response = await admin.graphql(
        //       `#graphql
        //     mutation productCreate($productInput: ProductInput!) {
        //       productCreate(input: $productInput) {
        //         product {
        //           id
        //         }
        //       }
        //     }`,
        //       {
        //         variables: {
        //           productInput: {
        //             title: `Neat Bundle ${_max.id ? _max.id : ""}`,
        //             productType: "Neat Bundle",
        //             vendor: "Neat Bundles",
        //             published: true,
        //             tags: [bundleTagIndentifier],
        //           },
        //         },
        //       },
        //     );

        //     const data = await response.json();

        //     await db.bundle.create({
        //       data: {
        //         storeUrl: bundleToDuplicate.storeUrl,
        //         title: `${bundleToDuplicate.title} - Copy`,
        //         shopifyProductId: data.data.productCreate.product.id,
        //         pricing: bundleToDuplicate.pricing,
        //         priceAmount: bundleToDuplicate.priceAmount,
        //         discountType: bundleToDuplicate.discountType,
        //         discountValue: bundleToDuplicate.discountValue,
        //         bundleSettings: {
        //           create: {
        //             displayDiscountBanner:
        //               bundleToDuplicate.bundleSettings?.displayDiscountBanner,
        //             skipTheCart: bundleToDuplicate.bundleSettings?.skipTheCart,
        //             showOutOfStockProducts:
        //               bundleToDuplicate.bundleSettings?.showOutOfStockProducts,
        //             numOfProductColumns:
        //               bundleToDuplicate.bundleSettings?.numOfProductColumns,

        //             bundleColors: {
        //               create: {
        //                 stepsIcon:
        //                   bundleToDuplicate.bundleSettings?.bundleColors.stepsIcon,
        //               },
        //             },
        //             bundleLabels: {
        //               create: {},
        //             },
        //           },
        //         },
        //         steps: {
        //           create: [
        //             {
        //               stepNumber: 1,
        //               title: "Step 1",
        //               stepType: "PRODUCT",
        //               productsData: {
        //                 create: {},
        //               },
        //               contentInputs: {
        //                 create: [{}, {}],
        //               },
        //             },
        //             {
        //               stepNumber: 2,
        //               title: "Step 2",
        //               stepType: "PRODUCT",
        //               productsData: {
        //                 create: {},
        //               },
        //               contentInputs: {
        //                 create: [{}, {}],
        //               },
        //             },
        //             {
        //               stepNumber: 3,
        //               title: "Step 3",
        //               stepType: "PRODUCT",
        //               productsData: {
        //                 create: {},
        //               },
        //               contentInputs: {
        //                 create: [{}, {}],
        //               },
        //             },
        //           ],
        //         },
        //       },
        //     });
        //   } catch (error) {
        //     console.log(error);
        //     return json(
        //       {
        //         ...new JsonData(
        //           false,
        //           "error",
        //           "There was an error with your request",
        //           "The bundle you are trying to duplicate does not exist",
        //         ),
        //       },
        //       { status: 400 },
        //     );
        //   }

        //   return json(
        //     { ...new JsonData(true, "success", "Bundle duplicated") },
        //     { status: 200 },
        //   );

        default: {
            return json(
                {
                    ...new JsonData(true, 'success', "This is the default action that doesn't do anything."),
                },
                { status: 200 },
            );
        }
    }
};

export default function Index() {
    const nav = useNavigation();
    const navigate = useNavigate();
    const shopify = useAppBridge();
    const isLoading: boolean = nav.state === 'loading';
    const isSubmitting: boolean = nav.state === 'submitting';
    const params = useParams();
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit with a navigation (the same if you were to use a From with a submit button)
    const actionData = useActionData<typeof action>();

    const asyncSubmit = useAsyncSubmit(); //Function for doing the submit action where the only data is action and url
    const tableLoading: boolean = asyncSubmit.state !== 'idle'; //Table loading state

    //Errors from action
    const errors = actionData?.errors;
    //Data from the action if the form submission returned errors
    const submittedBundle: BundleFullStepBasicClient = actionData?.data as BundleFullStepBasicClient;

    //Data from the loader
    const serverBundle = useLoaderData<typeof loader>().data;

    //Using 'old' bundle data if there were errors when submitting the form. Otherwise, use the data from the loader.
    const [bundleState, setBundleState] = useState<BundleFullStepBasicClient>(errors?.length === 0 || !errors ? serverBundle : submittedBundle);

    const bundleSteps: BundleStepBasicResources[] = serverBundle.steps.sort((a: BundleStepBasicResources, b: BundleStepBasicResources): number => a.stepNumber - b.stepNumber);

    //Function for adding the step if there are less than 5 steps total
    const addStep = async (): Promise<void> => {
        await shopify.saveBar.leaveConfirmation();

        if (serverBundle.steps.length >= 5) {
            shopify.modal.show('no-more-steps-modal');
            return;
        }

        navigateSubmit('addStep', `/app/bundles/${params.bundleid}/steps`);
    };

    //Duplicating the step
    const duplicateStep = async (stepNumber: number): Promise<void> => {
        if (serverBundle.steps.length >= 5) {
            shopify.modal.show('no-more-steps-modal');
            return;
        }
        asyncSubmit.submit('duplicateStep', `/app/bundles/${params.bundleid}/steps/${stepNumber}`);
    };

    //Deleting the bundle
    const deleteBundleHandler = async (): Promise<void> => {
        await shopify.saveBar.leaveConfirmation();
        navigateSubmit('deleteBundle', `/app/bundles/${params.bundleid}?redirect=true`);
    };

    const handleNavigationOnUnsavedChanges = async (navPath: string): Promise<void> => {
        await shopify.saveBar.leaveConfirmation();

        navigate(navPath);
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
                err.message = '';
            }
        });
    };

    const refreshBundleBuilderHandler = () => {
        navigateSubmit('recreateBundleBuilder', `/app/bundles/${params.bundleid}`);
    };

    return (
        <>
            {isLoading || isSubmitting ? (
                <SkeletonPage primaryAction>
                    <BlockStack gap="500">
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                    </BlockStack>
                </SkeletonPage>
            ) : (
                <>
                    {/* Modal to alert the user that he can't have more tha 5 steps in one bundle. */}
                    <Modal id="no-more-steps-modal">
                        <Box padding="300">
                            <Text as="p">You can't add more than 5 steps for one bundle.</Text>
                        </Box>
                        <TitleBar title="Maximum steps reached">
                            <button variant="primary" onClick={() => shopify.modal.hide('no-more-steps-modal')}>
                                Close
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Edit bundle page */}
                    <Page
                        secondaryActions={[
                            {
                                content: 'Settings',
                                url: `settings/?redirect=/app/bundles/${serverBundle.id}`,
                                icon: SettingsIcon,
                            },
                            {
                                content: 'Preview',
                                accessibilityLabel: 'Preview action label',
                                icon: ExternalIcon,
                                url: `${serverBundle.bundleBuilderPageUrl}?${bundlePagePreviewKey}=true`,
                                target: '_blank',
                            },
                            {
                                icon: RefreshIcon,
                                onAction: refreshBundleBuilderHandler,
                                content: 'Recreate bundle',
                                helpText:
                                    'If you accidentally deleted the page where this bundle is displayed or you deleted the dummy product associated with this bundle, click this button to recreate them.',
                            },
                        ]}
                        titleMetadata={serverBundle.published ? <Badge tone="success">Active</Badge> : <Badge tone="info">Draft</Badge>}
                        backAction={{
                            content: 'Products',
                            onAction: async () => {
                                // Save or discard the changes before leaving the page
                                await shopify.saveBar.leaveConfirmation();
                                navigate('/app');
                            },
                        }}
                        title={`${serverBundle.title} | Bundle ID: ${serverBundle.id}`}
                        subtitle="Edit bundle details and steps"
                        compactTitle>
                        <Form method="POST" data-discard-confirmation data-save-bar>
                            <BlockStack gap={GapBetweenSections}>
                                <Layout>
                                    <Layout.Section>
                                        <BlockStack gap={GapBetweenSections}>
                                            <div id={styles.tableWrapper}>
                                                <div className={tableLoading ? styles.loadingTable : styles.hide}>
                                                    <Spinner accessibilityLabel="Spinner example" size="large" />
                                                </div>
                                                <Card>
                                                    <BlockStack>
                                                        <InlineStack align="space-between">
                                                            <Text as="h2" variant="headingMd">
                                                                Bundle steps
                                                            </Text>

                                                            <Button icon={PlusIcon} size="slim" variant="primary" onClick={addStep}>
                                                                Add step
                                                            </Button>
                                                        </InlineStack>
                                                        {bundleSteps.length > 0 ? (
                                                            <DataTable
                                                                hoverable
                                                                columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                                                                headings={['Step', 'Title', 'Type', 'Rearange', 'Actions']}
                                                                rows={bundleSteps.map((step: BundleStepBasicResources) => {
                                                                    return [
                                                                        step.stepNumber,
                                                                        <Link
                                                                            onClick={handleNavigationOnUnsavedChanges.bind(
                                                                                null,
                                                                                `/app/bundles/${params.bundleid}/steps/${step.stepNumber}`,
                                                                            )}
                                                                            to={'#'}>
                                                                            <Text as="p" tone="base">
                                                                                {step.title}
                                                                            </Text>
                                                                        </Link>,
                                                                        step.stepType === StepType.PRODUCT ? (
                                                                            <Badge tone="warning">Product step</Badge>
                                                                        ) : (
                                                                            <Badge tone="magic">Content step</Badge>
                                                                        ),
                                                                        <ButtonGroup>
                                                                            <InlineStack align="space-between" blockAlign="stretch">
                                                                                {step.stepNumber !== bundleSteps.length ? (
                                                                                    <Button
                                                                                        icon={ArrowDownIcon}
                                                                                        size="slim"
                                                                                        variant="plain"
                                                                                        onClick={() => {
                                                                                            asyncSubmit.submit('moveStepDown', `steps`, Number(step.id));
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <div className={styles.dummyIconPlaceholder}> </div>
                                                                                )}
                                                                                {step.stepNumber !== 1 && (
                                                                                    <Button
                                                                                        icon={ArrowUpIcon}
                                                                                        size="slim"
                                                                                        variant="plain"
                                                                                        onClick={() => {
                                                                                            asyncSubmit.submit('moveStepUp', `steps/`, Number(step.id));
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </InlineStack>
                                                                        </ButtonGroup>,
                                                                        <ButtonGroup>
                                                                            <Button
                                                                                icon={DeleteIcon}
                                                                                variant="secondary"
                                                                                tone="critical"
                                                                                onClick={() => {
                                                                                    asyncSubmit.submit('deleteStep', `/app/bundles/${params.bundleid}/steps/${step.stepNumber}`);
                                                                                }}></Button>

                                                                            <Button
                                                                                icon={PageAddIcon}
                                                                                variant="secondary"
                                                                                onClick={() => {
                                                                                    duplicateStep(step.stepNumber);
                                                                                }}>
                                                                                Duplicate
                                                                            </Button>

                                                                            <Button
                                                                                icon={EditIcon}
                                                                                variant="primary"
                                                                                onClick={handleNavigationOnUnsavedChanges.bind(
                                                                                    null,
                                                                                    `/app/bundles/${params.bundleid}/steps/${step.stepNumber}`,
                                                                                )}>
                                                                                Edit
                                                                            </Button>
                                                                        </ButtonGroup>,
                                                                    ];
                                                                })}></DataTable>
                                                        ) : (
                                                            <EmptyState
                                                                heading="Let’s create the first step for your customers to take!"
                                                                action={{
                                                                    content: 'Create step',
                                                                    icon: PlusIcon,
                                                                    onAction: addStep,
                                                                }}
                                                                fullWidth
                                                                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
                                                                <p>
                                                                    Your customers will be able to select products or add content (like text or images) at each step to their
                                                                    bundle.
                                                                </p>
                                                            </EmptyState>
                                                        )}
                                                    </BlockStack>
                                                </Card>
                                            </div>

                                            {/* Bundle builder page url */}

                                            <Card>
                                                <BlockStack gap={GapBetweenTitleAndContent}>
                                                    <Text as="p" variant="headingMd">
                                                        Bundle page
                                                    </Text>

                                                    <BlockStack gap={GapInsideSection}>
                                                        <TextField
                                                            label="Bundle page"
                                                            labelHidden
                                                            autoComplete="off"
                                                            readOnly
                                                            name="bundlePage"
                                                            helpText="Send customers to this page to let them create their unique bundles."
                                                            value={serverBundle.bundleBuilderPageUrl}
                                                            type="url"
                                                        />
                                                    </BlockStack>
                                                </BlockStack>
                                            </Card>

                                            <Card>
                                                <ChoiceList
                                                    title="Bundle Pricing"
                                                    name="bundlePricing"
                                                    choices={[
                                                        {
                                                            label: 'Calculated price ',
                                                            value: BundlePricing.CALCULATED,
                                                            helpText: (
                                                                <Tooltip
                                                                    width="wide"
                                                                    activatorWrapper="div"
                                                                    content={`e.g. use case: you want to sell shirt,
                                      pants, and a hat in a bundle with a 10%
                                      discount on whole order, and you want the
                                      total price before discount to be the sum of
                                      the prices of individual products that customer has selected.`}>
                                                                    <div className={styles.tooltipContent}>
                                                                        <Box>
                                                                            <p>Final price is calculated based on the products that customers selects.</p>
                                                                        </Box>
                                                                        <Box>
                                                                            <Icon source={QuestionCircleIcon} />
                                                                        </Box>
                                                                    </div>
                                                                </Tooltip>
                                                            ),
                                                        },
                                                        {
                                                            label: 'Fixed price',
                                                            value: BundlePricing.FIXED,
                                                            helpText: (
                                                                <Tooltip
                                                                    width="wide"
                                                                    activatorWrapper="div"
                                                                    content={`e.g. use case: you want to sell 5 cookies
                                    in a bundle, always at the same price, but want
                                    your customers to be able to select which
                                    cookies they want.`}>
                                                                    <div className={styles.tooltipContent}>
                                                                        <Box>
                                                                            <Text as="p">All bundles created will be priced the same.</Text>
                                                                        </Box>
                                                                        <Box>
                                                                            <Icon source={QuestionCircleIcon} />
                                                                        </Box>
                                                                    </div>
                                                                </Tooltip>
                                                            ),
                                                            renderChildren: (isSelected: boolean) => {
                                                                return isSelected ? (
                                                                    <Box maxWidth="50" id="priceAmount">
                                                                        <TextField
                                                                            label="Price"
                                                                            type="number"
                                                                            name="priceAmount"
                                                                            inputMode="numeric"
                                                                            autoComplete="off"
                                                                            min={0}
                                                                            error={errors?.find((err: error) => err.fieldId === 'priceAmount')?.message}
                                                                            value={bundleState.priceAmount?.toString()}
                                                                            prefix="$"
                                                                            onChange={(newPrice: string) => {
                                                                                setBundleState((prevBundle: BundleFullStepBasicClient) => {
                                                                                    return {
                                                                                        ...prevBundle,
                                                                                        priceAmount: parseFloat(newPrice),
                                                                                    };
                                                                                });
                                                                                updateFieldErrorHandler('priceAmount');
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                ) : null;
                                                            },
                                                        },
                                                    ]}
                                                    selected={[bundleState.pricing]}
                                                    onChange={(newPricing) => {
                                                        setBundleState((prevBundle: BundleFullStepBasicClient) => {
                                                            return {
                                                                ...prevBundle,
                                                                pricing: newPricing[0] as BundlePricing,
                                                            };
                                                        });
                                                    }}
                                                />
                                            </Card>

                                            {/* Bundle discount */}
                                            <Card>
                                                <BlockStack gap={GapBetweenTitleAndContent}>
                                                    <Text as="p" variant="headingMd">
                                                        Discount
                                                    </Text>
                                                    <BlockStack gap={GapInsideSection}>
                                                        <Select
                                                            label="Type"
                                                            name="bundleDiscountType"
                                                            options={[
                                                                {
                                                                    label: 'Percentage (e.g. 25% off)',
                                                                    value: BundleDiscountType.PERCENTAGE,
                                                                },
                                                                {
                                                                    label: 'Fixed (e.g. 10$ off)',
                                                                    value: BundleDiscountType.FIXED,
                                                                },

                                                                {
                                                                    label: 'No discount',
                                                                    value: BundleDiscountType.NO_DISCOUNT,
                                                                },
                                                            ]}
                                                            value={bundleState.discountType}
                                                            onChange={(newDiscountType: string) => {
                                                                setBundleState((prevBundle: BundleFullStepBasicClient) => {
                                                                    return {
                                                                        ...prevBundle,
                                                                        discountType: newDiscountType as BundleDiscountType,
                                                                    };
                                                                });
                                                            }}
                                                        />

                                                        <TextField
                                                            label="Amount"
                                                            type="number"
                                                            autoComplete="off"
                                                            inputMode="numeric"
                                                            disabled={bundleState.discountType === BundleDiscountType.NO_DISCOUNT}
                                                            name={`discountValue`}
                                                            prefix={bundleState.discountType === BundleDiscountType.PERCENTAGE ? '%' : '$'}
                                                            min={0}
                                                            max={100}
                                                            value={bundleState.discountValue.toString()}
                                                            error={errors?.find((err: error) => err.fieldId === 'discountValue')?.message}
                                                            onChange={(newDiscountValue) => {
                                                                setBundleState((prevBundle: BundleFullStepBasicClient) => {
                                                                    return {
                                                                        ...prevBundle,
                                                                        discountValue: parseInt(newDiscountValue),
                                                                    };
                                                                });
                                                                updateFieldErrorHandler('discountValue');
                                                            }}
                                                        />
                                                    </BlockStack>
                                                </BlockStack>
                                            </Card>
                                        </BlockStack>
                                    </Layout.Section>
                                    <Layout.Section variant="oneThird">
                                        <BlockStack gap={GapBetweenSections}>
                                            <input type="hidden" name="action" value="updateBundle" />
                                            <input type="hidden" name="bundle" value={JSON.stringify(bundleState)} />
                                            <BlockStack gap={GapBetweenSections}>
                                                {/* Bundle title */}

                                                <Card>
                                                    <BlockStack gap={GapBetweenTitleAndContent}>
                                                        <Text as="p" variant="headingMd">
                                                            Bundle title
                                                        </Text>

                                                        <BlockStack gap={GapInsideSection}>
                                                            <TextField
                                                                label="Title"
                                                                labelHidden
                                                                autoComplete="off"
                                                                inputMode="text"
                                                                name="bundleTitle"
                                                                helpText="This title will be displayed to your customers on bundle page, in checkout and in cart."
                                                                error={errors?.find((err: error) => err.fieldId === 'bundleTitle')?.message}
                                                                value={bundleState.title}
                                                                onChange={(newTitile) => {
                                                                    setBundleState((prevBundle: BundleFullStepBasicClient) => {
                                                                        return { ...prevBundle, title: newTitile };
                                                                    });
                                                                    updateFieldErrorHandler('bundleTitle');
                                                                }}
                                                                type="text"
                                                            />
                                                        </BlockStack>
                                                    </BlockStack>
                                                </Card>

                                                {/* Bundle status */}
                                                <Card>
                                                    <BlockStack gap={GapBetweenTitleAndContent}>
                                                        <Text as="p" variant="headingMd">
                                                            Bundle status
                                                        </Text>

                                                        <Select
                                                            label="Visibility"
                                                            name="bundleVisibility"
                                                            labelHidden
                                                            options={[
                                                                { label: 'Active', value: 'true' },
                                                                { label: 'Draft', value: 'false' },
                                                            ]}
                                                            value={bundleState.published ? 'true' : 'false'}
                                                            onChange={(newSelection: string) => {
                                                                setBundleState((prevBundle: BundleFullStepBasicClient) => {
                                                                    return {
                                                                        ...prevBundle,
                                                                        published: newSelection === 'true',
                                                                    };
                                                                });
                                                            }}
                                                        />
                                                    </BlockStack>
                                                </Card>
                                            </BlockStack>
                                        </BlockStack>
                                    </Layout.Section>
                                </Layout>
                                <Divider borderColor="transparent" />

                                <Box width="full">
                                    <BlockStack inlineAlign="end">
                                        <ButtonGroup>
                                            <Button variant="primary" tone="critical" onClick={deleteBundleHandler}>
                                                Delete
                                            </Button>
                                            <Button variant="primary" submit>
                                                Save
                                            </Button>
                                        </ButtonGroup>
                                    </BlockStack>
                                </Box>
                                <Divider borderColor="transparent" />
                            </BlockStack>
                        </Form>
                    </Page>
                </>
            )}
        </>
    );
}
