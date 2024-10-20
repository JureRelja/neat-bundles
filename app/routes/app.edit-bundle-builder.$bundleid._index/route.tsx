import { json, redirect } from '@remix-run/node';
import { Link, useActionData, useNavigate, Form, useNavigation, useLoaderData, useParams, Outlet, useSubmit } from '@remix-run/react';
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
    FooterHelp,
} from '@shopify/polaris';
import { DeleteIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon, PageAddIcon, EditIcon, QuestionCircleIcon, ExternalIcon, SettingsIcon, RefreshIcon } from '@shopify/polaris-icons';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import { useEffect, useRef, useState } from 'react';
import { bundlePagePreviewKey, GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection } from '../../constants';
import db from '../../db.server';
import { StepType, BundlePricing, BundleDiscountType } from '@prisma/client';
import { BundleStepBasicResources } from '../../adminBackend/service/dto/BundleStep';
import { BundleFullStepBasicClient, BundleFullStepBasicServer, inclBundleFullStepsBasic } from '../../adminBackend/service/dto/Bundle';
import { JsonData, error } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '../../hooks/useNavigateSubmit';
import styles from './route.module.css';
import userRepository from '~/adminBackend/repository/impl/UserRepository';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

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

    //Url of the bundle page
    const bundleBuilderPageUrl = `${user.primaryDomain}/pages/${bundleBuilder.bundleBuilderPageHandle}`;

    const bundleBuilderWithPageUrl: BundleFullStepBasicServer = { ...bundleBuilder, bundleBuilderPageUrl };

    return json(new JsonData(true, 'success', 'Bundle succesfuly retrieved', [], { bundleBuilderWithPageUrl, user }), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    return json(
        {
            ...new JsonData(true, 'success', "This is the default action that doesn't do anything."),
        },
        { status: 200 },
    );
};

export default function Index() {
    const nav = useNavigation();
    const navigate = useNavigate();
    const shopify = useAppBridge();
    const isLoading: boolean = nav.state === 'loading';
    const isSubmitting: boolean = nav.state === 'submitting';
    const params = useParams();
    const submit = useSubmit();
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit with a navigation (the same if you were to use a From with a submit button)
    const actionData = useActionData<typeof action>();

    const asyncSubmit = useAsyncSubmit(); //Function for doing the submit action where the only data is action and url
    const tableLoading: boolean = asyncSubmit.state !== 'idle'; //Table loading state
    const form = useRef<HTMLFormElement>(null);

    //Errors from action
    const errors = actionData?.errors;
    //Data from the action if the form submission returned errors
    const submittedBundle: BundleFullStepBasicClient = actionData?.data as BundleFullStepBasicClient;

    //Data from the loader
    const serverBundle = useLoaderData<typeof loader>().data.bundleBuilderWithPageUrl;

    //user data from the loader
    const user = useLoaderData<typeof loader>().data.user;

    //Using 'old' bundle data if there were errors when submitting the form. Otherwise, use the data from the loader.
    const [bundleState, setBundleState] = useState<BundleFullStepBasicClient>(errors?.length === 0 || !errors ? serverBundle : submittedBundle);

    const bundleSteps: BundleStepBasicResources[] = serverBundle.steps.sort((a: BundleStepBasicResources, b: BundleStepBasicResources): number => a.stepNumber - b.stepNumber);

    const checkStepCount = (): boolean => {
        if (serverBundle.steps.length >= 5) {
            shopify.modal.show('no-more-steps-modal');
            return false;
        }

        if (user.activeBillingPlan === 'BASIC' && serverBundle.steps.length >= 2) {
            shopify.modal.show('step-limit-modal');
            return false;
        }

        return true;
    };

    //Function for adding the step if there are less than 5 steps total
    const addStep = async (): Promise<void> => {
        if (!checkStepCount()) return;

        navigateSubmit('addStep', `/app/edit-bundle-builder/${params.bundleid}/steps`);
    };

    //Duplicating the step
    const duplicateStep = async (stepNumber: number): Promise<void> => {
        if (!checkStepCount()) return;

        asyncSubmit.submit('duplicateStep', `/app/edit-bundle-builder/${params.bundleid}/steps/${stepNumber}`);
    };

    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    //Deleting the bundle
    const deleteBundleHandler = async (): Promise<void> => {
        await shopify.saveBar.leaveConfirmation();

        setShowDeleteModal(true);
        // navigateSubmit('deleteBundle', `/app/edit-bundle-builder/${params.bundleid}?redirect=true`);
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

    const refreshBundleBuilderHandler = async () => {
        await shopify.saveBar.leaveConfirmation();

        navigateSubmit('recreateBundleBuilder', `/app/edit-bundle-builder/${params.bundleid}`);
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
                    {/* Modal for users to confirm that they want to delete the bundle. */}
                    <Modal id="delete-confirm-modal" open={showDeleteModal}>
                        <Box padding="300">
                            <Text as="p">If you delete this bundle, everything will be lost forever.</Text>
                        </Box>
                        <TitleBar title="Are you sure you want to delete this bundle?">
                            <button onClick={() => setShowDeleteModal(false)}>Close</button>
                            <button
                                variant="primary"
                                tone="critical"
                                onClick={() => {
                                    navigateSubmit('deleteBundle', `/app/edit-bundle-builder/${params.bundleid}?redirect=true`);
                                    setShowDeleteModal(false);
                                }}>
                                Delete
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Modal to show the customer that they've reacheda  limit and should upgrade */}
                    <Modal id="step-limit-modal">
                        <Box padding="300">
                            <BlockStack gap={GapBetweenSections}>
                                <Text as="p">You are on the 'Basic' plan which only allows you to create up to 2 steps for each bundle.</Text>
                                <Text as="p" variant="headingSm">
                                    If you want to create more steps, go to <Link to={'/app/billing'}>billing</Link> and upgrade to paid plan.
                                </Text>
                            </BlockStack>
                        </Box>
                        <TitleBar title="Maximum steps reached">
                            <button variant="primary" onClick={() => shopify.modal.hide('step-limit-modal')}>
                                Close
                            </button>
                        </TitleBar>
                    </Modal>

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
                                url: `settings/?redirect=/app/edit-bundle-builder/${serverBundle.id}`,
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
                        title={`${serverBundle.title}`}
                        subtitle="Edit bundle details and steps"
                        compactTitle>
                        <Outlet />
                        <Form method="POST" data-discard-confirmation data-save-bar action={`/app/edit-bundle-builder/2`} ref={form}>
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
                                                                                `/app/edit-bundle-builder/${params.bundleid}/steps/${step.stepNumber}`,
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
                                                                                    asyncSubmit.submit(
                                                                                        'deleteStep',
                                                                                        `/app/edit-bundle-builder/${params.bundleid}/steps/${step.stepNumber}`,
                                                                                    );
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
                                                                                    `/app/edit-bundle-builder/${params.bundleid}/steps/${step.stepNumber}`,
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
                                            <input type="hidden" name="action" defaultValue="updateBundle" />
                                            <input type="hidden" name="bundle" defaultValue={JSON.stringify(bundleState)} />
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
                                                            helpText="Bundles set to 'ACTIVE' are visible to anyone browsing your store"
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
                                            <button
                                                className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
                                                name="submitBtn"
                                                value="saveBtn"
                                                type="submit">
                                                <span className="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--medium">Save</span>
                                            </button>
                                            {/* <button variant="primary">Save</button> */}

                                            <button
                                                className="Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter"
                                                name="submitBtn"
                                                value="saveAndExitBtn"
                                                type="submit">
                                                <span className="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--medium">Save and return</span>
                                            </button>
                                        </ButtonGroup>
                                    </BlockStack>
                                </Box>
                                <Divider borderColor="transparent" />
                                <FooterHelp>
                                    View the <Link to="/app/featureRequest">help docs</Link>, <Link to="/app/featureRequest">suggest new features</Link>, or{' '}
                                    <Link to="mailto:contact@neatmerchant.com" target="_blank">
                                        contact us
                                    </Link>{' '}
                                    for support.
                                </FooterHelp>
                            </BlockStack>
                        </Form>
                    </Page>
                </>
            )}
        </>
    );
}
