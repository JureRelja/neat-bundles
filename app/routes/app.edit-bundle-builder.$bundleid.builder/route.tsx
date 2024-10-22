import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useNavigate, Form, useNavigation, useLoaderData, useParams, Outlet } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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
    ButtonGroup,
    Badge,
    Select,
    Tooltip,
    Icon,
    Divider,
    Layout,
    FooterHelp,
} from "@shopify/polaris";
import { QuestionCircleIcon, ExternalIcon, SettingsIcon, RefreshIcon } from "@shopify/polaris-icons";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { useEffect, useState } from "react";
import { bundlePagePreviewKey, GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection } from "../../constants";
import db from "../../db.server";
import { BundlePricing, BundleDiscountType, BundleBuilder } from "@prisma/client";
import { JsonData, error } from "../../adminBackend/service/dto/jsonData";
import { useNavigateSubmit } from "../../hooks/useNavigateSubmit";
import styles from "./route.module.css";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { BundleBuilderClient } from "~/frontend/types/BundleBuilderClient";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect("/app");

    const bundleBuilder: BundleBuilder | null = await db.bundleBuilder.findUnique({
        where: {
            id: Number(params.bundleid),
        },
    });

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    //Url of the bundle page
    const bundleBuilderPageUrl = `${user.primaryDomain}/pages/${bundleBuilder.bundleBuilderPageHandle}`;

    return json(new JsonData(true, "success", "Bundle succesfuly retrieved", [], { bundleBuilderPageUrl, bundleBuilder }), { status: 200 });
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
    const nav = useNavigation();
    const navigate = useNavigate();
    const shopify = useAppBridge();
    const isLoading: boolean = nav.state === "loading";
    const isSubmitting: boolean = nav.state === "submitting";
    const params = useParams();
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit with a navigation (the same if you were to use a From with a submit button)
    const actionData = useActionData<typeof action>();
    const loaderData = useLoaderData<typeof loader>().data;

    //Errors from action
    const errors = actionData?.errors;
    //Data from the action if the form submission returned errors
    const submittedBundle: BundleBuilderClient = actionData?.data as BundleBuilderClient;

    //Data from the loader
    const serverBundle = loaderData.bundleBuilder;
    const bundleBuilderPageUrl = loaderData.bundleBuilderPageUrl;

    //Using 'old' bundle data if there were errors when submitting the form. Otherwise, use the data from the loader.
    const [bundleState, setBundleState] = useState<BundleBuilderClient>(errors?.length === 0 || !errors ? serverBundle : submittedBundle);

    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    //Deleting the bundle
    const deleteBundleHandler = async (): Promise<void> => {
        await shopify.saveBar.leaveConfirmation();

        setShowDeleteModal(true);
        // navigateSubmit('deleteBundle', `/app/edit-bundle-builder/${params.bundleid}?redirect=true`);
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

    const refreshBundleBuilderHandler = async () => {
        await shopify.saveBar.leaveConfirmation();

        navigateSubmit("recreateBundleBuilder", `/app/edit-bundle-builder/${params.bundleid}`);
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
                <div>
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
                                    navigateSubmit("deleteBundle", `/app/edit-bundle-builder/${params.bundleid}?redirect=true`);
                                    setShowDeleteModal(false);
                                }}>
                                Delete
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Edit bundle page */}
                    <Page
                        secondaryActions={[
                            {
                                content: "Settings",
                                url: `settings/?redirect=/app/edit-bundle-builder/${serverBundle.id}`,
                                icon: SettingsIcon,
                            },
                            {
                                content: "Preview",
                                accessibilityLabel: "Preview action label",
                                icon: ExternalIcon,
                                url: `${bundleBuilderPageUrl}?${bundlePagePreviewKey}=true`,
                                target: "_blank",
                            },
                            {
                                icon: RefreshIcon,
                                onAction: refreshBundleBuilderHandler,
                                content: "Recreate bundle",
                                helpText:
                                    "If you accidentally deleted the page where this bundle is displayed or you deleted the dummy product associated with this bundle, click this button to recreate them.",
                            },
                        ]}
                        titleMetadata={serverBundle.published ? <Badge tone="success">Active</Badge> : <Badge tone="info">Draft</Badge>}
                        backAction={{
                            content: "Products",
                            onAction: async () => {
                                // Save or discard the changes before leaving the page
                                await shopify.saveBar.leaveConfirmation();
                                navigate("/app");
                            },
                        }}
                        title={`${serverBundle.title}`}
                        subtitle="Edit bundle details and steps"
                        compactTitle>
                        <Form method="POST" data-discard-confirmation data-save-bar action={`/app/edit-bundle-builder/2`}>
                            <BlockStack gap={GapBetweenSections}>
                                <Layout>
                                    <Layout.Section>
                                        <BlockStack gap={GapBetweenSections}>
                                            {/* Bundle builder steps */}
                                            <Outlet />

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
                                                            value={bundleBuilderPageUrl}
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
                                                            label: "Calculated price ",
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
                                                            label: "Fixed price",
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
                                                                            error={errors?.find((err: error) => err.fieldId === "priceAmount")?.message}
                                                                            value={bundleState.priceAmount?.toString()}
                                                                            prefix="$"
                                                                            onChange={(newPrice: string) => {
                                                                                setBundleState((prevBundle: BundleBuilderClient) => {
                                                                                    return {
                                                                                        ...prevBundle,
                                                                                        priceAmount: parseFloat(newPrice),
                                                                                    };
                                                                                });
                                                                                updateFieldErrorHandler("priceAmount");
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                ) : null;
                                                            },
                                                        },
                                                    ]}
                                                    selected={[bundleState.pricing]}
                                                    onChange={(newPricing) => {
                                                        setBundleState((prevBundle: BundleBuilderClient) => {
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
                                                                    label: "Percentage (e.g. 25% off)",
                                                                    value: BundleDiscountType.PERCENTAGE,
                                                                },
                                                                {
                                                                    label: "Fixed (e.g. 10$ off)",
                                                                    value: BundleDiscountType.FIXED,
                                                                },

                                                                {
                                                                    label: "No discount",
                                                                    value: BundleDiscountType.NO_DISCOUNT,
                                                                },
                                                            ]}
                                                            value={bundleState.discountType}
                                                            onChange={(newDiscountType: string) => {
                                                                setBundleState((prevBundle: BundleBuilderClient) => {
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
                                                            disabled={bundleState.discountType === "NO_DISCOUNT"}
                                                            name={`discountValue`}
                                                            prefix={bundleState.discountType === BundleDiscountType.PERCENTAGE ? "%" : "$"}
                                                            min={0}
                                                            max={100}
                                                            value={bundleState.discountValue.toString()}
                                                            error={errors?.find((err: error) => err.fieldId === "discountValue")?.message}
                                                            onChange={(newDiscountValue) => {
                                                                setBundleState((prevBundle: BundleBuilderClient) => {
                                                                    return {
                                                                        ...prevBundle,
                                                                        discountValue: parseInt(newDiscountValue),
                                                                    };
                                                                });
                                                                updateFieldErrorHandler("discountValue");
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
                                                                error={errors?.find((err: error) => err.fieldId === "bundleTitle")?.message}
                                                                value={bundleState.title}
                                                                onChange={(newTitile) => {
                                                                    setBundleState((prevBundle: BundleBuilderClient) => {
                                                                        return { ...prevBundle, title: newTitile };
                                                                    });
                                                                    updateFieldErrorHandler("bundleTitle");
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
                                                                { label: "Active", value: "true" },
                                                                { label: "Draft", value: "false" },
                                                            ]}
                                                            helpText="Bundles set to 'ACTIVE' are visible to anyone browsing your store"
                                                            value={bundleState.published ? "true" : "false"}
                                                            onChange={(newSelection: string) => {
                                                                setBundleState((prevBundle: BundleBuilderClient) => {
                                                                    return {
                                                                        ...prevBundle,
                                                                        published: newSelection === "true",
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

                                <FooterHelp>
                                    You stuck? <Link to="/app/help">Get help</Link> from us, or <Link to="/app/feature-request">suggest new features</Link>.
                                </FooterHelp>
                            </BlockStack>
                        </Form>
                    </Page>
                </div>
            )}
        </>
    );
}
