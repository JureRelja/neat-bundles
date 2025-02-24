import { json } from "@remix-run/node";
import { Link, useActionData, useNavigate, Form, useNavigation, useLoaderData, useParams, useRouteError, isRouteErrorResponse } from "@remix-run/react";
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
    Banner,
    InlineStack,
    InlineGrid,
} from "@shopify/polaris";
import { QuestionCircleIcon, ExternalIcon, SettingsIcon, RefreshIcon, ClipboardIcon } from "@shopify/polaris-icons";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { useEffect, useState } from "react";
import { GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection } from "../../constants";
import db, { BundlePricing } from "@db/server";
import { BundlePricingClient } from "~/types/BundlePricingClient";
import { BundleDiscountTypeClient } from "~/types/BundleDiscountTypeClient";
import type { BundleBuilder, BundleDiscountType } from "@db/server";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import type { error } from "../../adminBackend/service/dto/jsonData";
import { useNavigateSubmit } from "../../hooks/useNavigateSubmit";
import userRepository from "../../adminBackend/repository/impl/UserRepository";
import type { BundleBuilderClient } from "../../types/BundleBuilderClient";
import BundleBuilderSteps from "./bundleBuilderSteps";
import { bundleBuilderStepRepository } from "../../adminBackend//repository/impl/bundleBuilderStep/BundleBuilderStepRepository";
import bundleBuilderRepository, { BundleBuilderRepository } from "../../adminBackend//repository/impl/BundleBuilderRepository";
import { shopifyBundleBuilderProductRepository } from "../../adminBackend//repository/impl/ShopifyBundleBuilderProductRepository";
import { inclBundleFullStepsBasic } from "../../adminBackend//service/dto/Bundle";

import styles from "./route.module.css";
import { AuthorizationCheck } from "../../adminBackend/service/utils/AuthorizationCheck";
import type { Shop } from "~/adminBackend/shopifyGraphql/graphql";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { session, admin, redirect } = await authenticate.admin(request);

    console.log("I'm on bundleId.builder, loader");

    const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));

    console.log("isAuthorized", isAuthorized);

    if (!isAuthorized) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect("/app");

    const bundleBuilder: BundleBuilder | null = await bundleBuilderRepository.get(Number(params.bundleid), session.shop);

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    //Url of the bundle page
    //Url of the bundle page
    const primaryDomainResponse = await admin.graphql(
        `#graphql
            query getStore {
                shop {
                    primaryDomain {
                        url
                    }
                    
                }
        }`,
    );
    const primaryDomain: Partial<Shop> = (await primaryDomainResponse.json()).data.shop;

    const userPrimaryDomain = primaryDomain?.primaryDomain?.url as string;

    let allBundleSteps = await bundleBuilderStepRepository.getAllStepsForBundleId(Number(params.bundleid));

    return json(new JsonData(true, "success", "Bundle succesfuly retrieved", [], { userPrimaryDomain, bundleBuilder, allBundleSteps, user }), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { admin, session, redirect } = await authenticate.admin(request);

    const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));

    if (!isAuthorized) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    const user = await userRepository.getUserByStoreUrl(session.shop);
    if (!user) return redirect("/app");

    const formData = await request.formData();
    const action = formData.get("action");

    switch (action) {
        case "deleteBundle": {
            try {
                //Delete the bundle along with its steps, contentInputs, bundleSettings?, bundleColors, and bundleLabels
                const bundleBuilderToDelete = await db.bundleBuilder.delete({
                    where: {
                        id: Number(params.bundleid),
                    },
                    select: {
                        shopifyProductId: true,
                    },
                });

                if (!bundleBuilderToDelete)
                    return json(
                        {
                            ...new JsonData(false, "error", "There was an error with your request", [
                                {
                                    fieldId: "bundleId",
                                    field: "Bundle ID",
                                    message: "Bundle with the provided id doesn't exist.",
                                },
                            ]),
                        },
                        { status: 400 },
                    );

                //Deleting a associated bundle product
                await shopifyBundleBuilderProductRepository.deleteBundleBuilderProduct(admin, bundleBuilderToDelete.shopifyProductId);
            } catch (error) {
                console.log(error, "Either the bundle product or the bundle page was already deleted.");
            } finally {
                const url: URL = new URL(request.url);

                // Clear the cache for the bundle

                if (url.searchParams.get("redirect") === "true") {
                    return redirect("/app");
                }

                return json({ ...new JsonData(true, "success", "Bundle deleted") }, { status: 200 });
            }
        }

        case "updateDiscount": {
            const url = new URL(request.url);

            const discountType = formData.get("discountType");
            const discountValue = formData.get("discountValue");

            if (!discountType || !discountValue) {
                throw Error("Discount type and value are required");
            }

            await db.bundleBuilder.update({
                where: {
                    id: Number(params.bundleid),
                    shop: session.shop,
                },
                data: {
                    discountValue: Number(discountValue),
                    discountType: discountType as BundleDiscountType,
                },
            });

            await userRepository.updateUser({ ...user, completedOnboarding: true });

            try {
                //redirect user to finish step if he is onboarding
                if (url.searchParams.get("onboarding") === "true" && url.searchParams.get("stepNumber") === "5") {
                    return redirect(`/app/create-bundle-builder/${params.bundleid}/step-6?stepIndex=6`);
                }
            } catch (error) {
                console.log(error);
            }
        }

        //Update the bundle
        case "updateBundle":
            const bundleData: BundleBuilder = JSON.parse(formData.get("bundle") as string);

            const errors: error[] = [];

            if (!bundleData.title) {
                errors.push({
                    fieldId: "bundleTitle",
                    field: "Bundle title",
                    message: "Please enter a bundle title.",
                });
            } else if (bundleData.pricing === BundlePricing.FIXED && (!bundleData.priceAmount || bundleData.priceAmount < 0)) {
                errors.push({
                    fieldId: "priceAmount",
                    field: "Price amount",
                    message: "Please enter a valid price for Fixed bundle.",
                });
            } else if (bundleData.discountType != "NO_DISCOUNT" && (!bundleData.discountValue || bundleData.discountValue <= 0)) {
                errors.push({
                    fieldId: "discountValue",
                    field: "Discount value",
                    message: "Please enter a desired discount.",
                });
            } else if (
                bundleData.discountType === "FIXED" &&
                bundleData.pricing === "FIXED" &&
                bundleData.discountValue &&
                bundleData.discountValue > (bundleData.priceAmount || 0)
            ) {
                errors.push({
                    fieldId: "discountValue",
                    field: "Discount value",
                    message: "Discount amount can't be heigher that the bundle price.",
                });
            }

            if (errors.length > 0)
                return json({
                    ...new JsonData(false, "error", "There was an error while trying to update the bundle.", errors, bundleData),
                });

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
                ]);

                // Clear the cache for the bundle

                const saveBtn = formData.get("submitBtn");

                if (saveBtn === "saveAndExitBtn") {
                    return redirect("/app");
                }

                return json({ ...new JsonData(true, "success", "Bundle updated", [], bundleData) }, { status: 200 });
            } catch (error) {
                console.log(error);

                return json({
                    ...new JsonData(false, "error", "There was an error while trying to update the bundle.", [
                        {
                            fieldId: "Bundle",
                            field: "Bundle",
                            message: "Error updating the bundle",
                        },
                    ]),
                });
            }

        case "recreateBundleBuilder": {
            const bundleBuilder = await db.bundleBuilder.findUnique({
                where: {
                    id: Number(params.bundleid),
                },
                include: inclBundleFullStepsBasic,
            });

            if (!bundleBuilder) {
                return json(
                    {
                        ...new JsonData(false, "error", "There was an error with your request", [
                            {
                                fieldId: "bundleId",
                                field: "Bundle ID",
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
            ]);

            return json({ ...new JsonData(true, "success", "Bundle builder refreshed") }, { status: 200 });
        }

        default: {
            return json(
                {
                    ...new JsonData(true, "success", "This is the default action that doesn't do anything."),
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
    const isLoading: boolean = nav.state === "loading";
    const isSubmitting: boolean = nav.state === "submitting";
    const params = useParams();
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit with a navigation (the same if you were to use a From with a submit button)
    const actionData = useActionData<typeof action>();
    const loaderData = useLoaderData<typeof loader>().data;

    //Errors from action
    const errors = actionData?.errors as error[]; //Errors from the form submission

    console.log(errors);

    //Data from the action if the form submission returned errors
    const submittedBundle: BundleBuilderClient = actionData?.data as BundleBuilderClient;

    //Data from the loader
    const serverBundle = loaderData.bundleBuilder;

    //Using 'old' bundle data if there were errors when submitting the form. Otherwise, use the data from the loader.
    const [bundleState, setBundleState] = useState<BundleBuilderClient>(errors?.length === 0 || !errors ? serverBundle : submittedBundle);

    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    //Deleting the bundle
    const deleteBundleHandler = async (): Promise<void> => {
        await shopify.saveBar.leaveConfirmation();

        setShowDeleteModal(true);
        navigateSubmit("deleteBundle", `/app/edit-bundle-builder/${params.bundleid}/builder?redirect=true`);
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
            }
        });
    }, [isLoading, errors]);

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

        navigateSubmit("recreateBundleBuilder", `/app/edit-bundle-builder/${params.bundleid}/builder`);
    };

    const bundleBuilderPageUrl = `${loaderData.userPrimaryDomain}/apps/nb/widgets/${serverBundle.id}`;

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
                                    navigateSubmit("deleteBundle", `/app/edit-bundle-builder/${params.bundleid}/builder?redirect=true`);
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
                                url: `${bundleBuilderPageUrl}`,
                                icon: SettingsIcon,
                            },
                            {
                                content: "See bundle page",
                                accessibilityLabel: "Preview action label",
                                icon: ExternalIcon,
                                url: `${bundleBuilderPageUrl}`,
                                target: "_blank",
                            },
                            {
                                icon: RefreshIcon,
                                onAction: refreshBundleBuilderHandler,
                                content: "Recreate bundle",
                                helpText: "If you accidentally deleted the dummy product associated with this bundle, click this button to recreate it.",
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
                        <BlockStack gap={GapBetweenTitleAndContent}>
                            {errors && errors.length === 0 ? (
                                <Banner title="Bundle updated!" tone="success" onDismiss={() => {}}>
                                    <BlockStack gap={GapInsideSection}>
                                        <Text as={"p"} variant="headingMd">
                                            You succesfuly updated this bundle.
                                        </Text>
                                    </BlockStack>
                                </Banner>
                            ) : null}

                            <Form method="POST" data-discard-confirmation data-save-bar>
                                <BlockStack gap={GapBetweenSections}>
                                    <Layout>
                                        <Layout.Section>
                                            <BlockStack gap={GapBetweenSections}>
                                                {/* Bundle builder steps */}
                                                <BundleBuilderSteps user={loaderData.user} bundleBuilderSteps={loaderData.allBundleSteps} />

                                                {/* Bundle builder page url */}
                                                <Card>
                                                    <BlockStack gap={GapBetweenTitleAndContent}>
                                                        <Text as="p" variant="headingMd">
                                                            Bundle page
                                                        </Text>

                                                        <InlineGrid columns={{ xs: "1fr", md: "88% 10%" }} gap="100">
                                                            <Box width="full">
                                                                <TextField
                                                                    label="Bundle page"
                                                                    labelHidden
                                                                    autoComplete="off"
                                                                    readOnly
                                                                    name="bundlePage"
                                                                    value={bundleBuilderPageUrl}
                                                                    type="url"
                                                                />
                                                            </Box>

                                                            <Tooltip
                                                                width="wide"
                                                                activatorWrapper="div"
                                                                content={`Share this link with your customers to let them access the bundle page.`}>
                                                                <Box width="full">
                                                                    <Button size="large" icon={ClipboardIcon} onClick={() => navigator.clipboard.writeText(bundleBuilderPageUrl)}>
                                                                        Copy
                                                                    </Button>
                                                                </Box>
                                                            </Tooltip>
                                                        </InlineGrid>
                                                    </BlockStack>
                                                </Card>

                                                <Card>
                                                    <BlockStack>
                                                        <Text as="p" variant="headingMd">
                                                            Bundle Pricing
                                                        </Text>
                                                        <ChoiceList
                                                            title="Bundle Pricing"
                                                            name="bundlePricing"
                                                            titleHidden
                                                            choices={[
                                                                {
                                                                    label: "Calculated price ",
                                                                    value: BundlePricingClient.CALCULATED,
                                                                    helpText: (
                                                                        <Tooltip
                                                                            width="wide"
                                                                            activatorWrapper="div"
                                                                            content={`e.g. use case: you want to sell a shirt,
                                      pants, and a hat in a bundle with a 10%
                                      discount on the whole order, and you want the
                                      total price before discount to be the sum of
                                      the prices of individual products that the customer has selected.`}>
                                                                            <div className={styles.tooltipContent}>
                                                                                <Box>
                                                                                    <p>
                                                                                        The final price will be the sum of the prices of all products that the customer has
                                                                                        selected.
                                                                                    </p>
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
                                                                    value: BundlePricingClient.FIXED,
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
                                                                        pricing: newPricing[0] as BundlePricingClient,
                                                                    };
                                                                });
                                                            }}
                                                        />
                                                    </BlockStack>
                                                </Card>

                                                {/* Bundle discount */}
                                                <Card>
                                                    <BlockStack gap={GapBetweenTitleAndContent}>
                                                        <Text as="p" variant="headingMd">
                                                            Bundle Discount
                                                        </Text>
                                                        <BlockStack gap={GapInsideSection}>
                                                            <Select
                                                                label="Discount Type"
                                                                name="bundleDiscountType"
                                                                options={[
                                                                    {
                                                                        label: "Percentage (e.g. 25% off)",
                                                                        value: BundleDiscountTypeClient.PERCENTAGE,
                                                                    },
                                                                    {
                                                                        label: "Fixed (e.g. 10$ off)",
                                                                        value: BundleDiscountTypeClient.FIXED,
                                                                    },

                                                                    {
                                                                        label: "No discount",
                                                                        value: BundleDiscountTypeClient.NO_DISCOUNT,
                                                                    },
                                                                ]}
                                                                value={bundleState.discountType}
                                                                onChange={(newDiscountType: string) => {
                                                                    setBundleState((prevBundle: BundleBuilderClient) => {
                                                                        return {
                                                                            ...prevBundle,
                                                                            discountType: newDiscountType as BundleDiscountTypeClient,
                                                                        };
                                                                    });
                                                                }}
                                                            />

                                                            <TextField
                                                                label="Discount amount"
                                                                type="number"
                                                                autoComplete="off"
                                                                inputMode="numeric"
                                                                disabled={bundleState.discountType === "NO_DISCOUNT"}
                                                                name={`discountValue`}
                                                                prefix={bundleState.discountType === BundleDiscountTypeClient.PERCENTAGE ? "%" : "$"}
                                                                min={0}
                                                                max={100}
                                                                value={bundleState.discountValue?.toString() ?? ""}
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
                                                                    helpText="This title will be displayed to your customers on the bundle page, in checkout, and in the cart."
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
                                                                helpText="Bundles set to 'ACTIVE' are visible to anyone browsing your store."
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
                                        Are you stuck? <Link to="/app/help">Get help</Link> from us, or <Link to="/app/feature-request">suggest new features</Link>.
                                    </FooterHelp>
                                </BlockStack>
                            </Form>
                        </BlockStack>
                    </Page>
                </div>
            )}
        </>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <div>
                <h1>
                    {error.status} {error.statusText}
                </h1>
                <p>{error.data}</p>
            </div>
        );
    } else if (error instanceof Error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error.message}</p>
                <p>The stack trace is:</p>
                <pre>{error.stack}</pre>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}
