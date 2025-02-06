/* eslint-disable react/jsx-key */
import { useNavigation, json, useLoaderData, useFetcher, useSubmit, Link, useNavigate, useParams } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Card, Button, BlockStack, EmptyState, Text, Box, SkeletonPage, SkeletonBodyText, DataTable, ButtonGroup, Badge, Spinner, InlineStack, TextField } from "@shopify/polaris";
import { PlusIcon, ExternalIcon, EditIcon, DeleteIcon, SettingsIcon } from "@shopify/polaris-icons";
import { authenticate } from "../../shopify.server";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import styles from "./route.module.css";
import { useEffect, useState } from "react";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { bundlePagePreviewKey, GapBetweenSections, GapInsideSection } from "~/constants";
import userRepository from "@adminBackend/repository/impl/UserRepository";
import bundleBuilderRepository from "~/adminBackend/repository/impl/BundleBuilderRepository";
import { shopifyBundleBuilderProductRepository } from "~/adminBackend/repository/impl/ShopifyBundleBuilderProductRepository";
import { ShopifyRedirectRepository } from "~/adminBackend/repository/impl/ShopifyRedirectRepository";

import { BundleBuilderClient } from "~/types/BundleBuilderClient";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, redirect } = await authenticate.admin(request);

    console.log("I'm on bundles loader");

    const [user, bundleBuilders] = await Promise.all([
        userRepository.getUserByStoreUrl(session.shop),

        bundleBuilderRepository.getAll(session.shop),
        // fetch(`${process.env.BACKEND_URL}/bundle-builders/${session.shop}/`, {
        //     headers: {
        //         "Content-Type": "application/json",
        //         Authorization: `Bearer ${session.accessToken}`,
        //     },
        // }).then((res) => res.json() as Promise<BundleBuilderEntity[]>),
    ]);

    console.log(bundleBuilders);

    if (!user) return redirect("/app");

    return json(
        {
            ...new JsonData(true, "success", "Bundles succesfuly retrieved.", [], { bundleBuilders, user }),
        },
        { status: 200 },
    );
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { admin, session, redirect } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get("action");

    console.log("I'm on bundles", action);

    switch (action) {
        case "createBundle": {
            try {
                const user = await userRepository.getUserByStoreUrl(session.shop);

                if (!user) return redirect("/app");

                // Check if the user is a development store
                if (user.isDevelopmentStore) {
                    // Do nothing
                }
                // Check if the user has reached the limit of bundles for the basic plan
                else if (user.activeBillingPlan === "BASIC") {
                    const bundleBuilderCount = await bundleBuilderRepository.getCount(session.shop);

                    if (bundleBuilderCount >= 2) {
                        return json(new JsonData(false, "error", "You have reached the limit of 2 bundles for the basic plan."), { status: 400 });
                    }
                }

                const url = new URL(request.url);
                const urlParams = url.searchParams;

                const isOnboarding = urlParams.get("onboarding") === "true";

                const bundleBuilderTitle = formData.get("bundleTitle") as string;

                //Create a new product that will be used as a bundle wrapper
                const bundleProductId = await shopifyBundleBuilderProductRepository.createBundleProduct(admin, bundleBuilderTitle, session.shop);

                if (!bundleProductId) {
                    return;
                }

                const [bundleBuilder] = await Promise.all([
                    //Create redirect
                    // ShopifyRedirectRepository.createProductToBundleRedirect(admin, bundlePage.handle, bundleProductId),

                    //Create new bundle
                    bundleBuilderRepository.create(session.shop, bundleBuilderTitle, bundleProductId),
                ]);

                //If the user is onboarding, redirect to onboarding flow
                if (isOnboarding) {
                    return redirect(`/app/create-bundle-builder/${bundleBuilder.id}/step-1?stepIndex=1`);
                }
                // if the user is not onboarding, redirect to edit bundle imidiately
                else {
                    return redirect(`/app/edit-bundle-builder/${bundleBuilder.id}/builder`);
                }
            } catch (error) {
                console.log(error);
            }
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
    const isLoading = nav.state === "loading";
    const isSubmitting = nav.state === "submitting";
    const fetcher = useFetcher();
    const submit = useSubmit();
    const navigate = useNavigate();

    const loaderResponse = useLoaderData<typeof loader>();

    const bundleBuilders: BundleBuilderClient[] = loaderResponse.data.bundleBuilders;

    const user = loaderResponse.data.user;

    const canCreateNewBundle = (): boolean => {
        // Check if the user is a development store
        if (user.isDevelopmentStore) {
            return true;
        }
        // Check if the user has reached the limit of bundles for the basic plan
        else if (user.activeBillingPlan === "BASIC" && bundleBuilders.length >= 2) {
            shopify.modal.show("bundle-limit-modal");
            return false;
        }

        return true;
    };

    const [newBundleTitle, setNewBundleTitle] = useState<string>();

    const createBundleBtnHandler = () => {
        shopify.modal.show("new-bundle-builder-modal");
    };

    const createBundle = () => {
        if (!canCreateNewBundle()) return;

        if (!newBundleTitle) {
            setNewBundleTitle("");
            return;
        }

        const form = new FormData();
        form.append("bundleTitle", newBundleTitle);
        form.append("action", "createBundle");

        submit(form, { method: "POST", action: `/app/users/${user.id}/bundles${!user.completedOnboarding ? "?onboarding=true" : ""}`, navigate: true });
    };

    const [bundleForDelete, setBundleForDelete] = useState<BundleBuilderClient | null>(null);
    const [showBundleDeleteConfirmModal, setShowBundleDeleteConfirmModal] = useState(false);

    useEffect(() => {
        if (bundleForDelete) setShowBundleDeleteConfirmModal(true);
    }, [bundleForDelete]);

    const handleEditBundleBuilder = (bundleBuilderId: number) => {
        navigate(`/app/edit-bundle-builder/${bundleBuilderId}/builder`);
    };

    return (
        <>
            {isLoading ? (
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
            ) : isSubmitting ? (
                <Card>
                    <InlineStack blockAlign="center" align="center" gap={GapInsideSection}>
                        <Text as="p" fontWeight="bold" variant="headingLg">
                            Your new bundle is being created...
                        </Text>

                        <Spinner accessibilityLabel="Spinner example" size="large" />
                    </InlineStack>
                </Card>
            ) : (
                <>
                    {/* Title modal */}
                    <Modal id="new-bundle-builder-modal">
                        <Box padding="300">
                            <BlockStack gap={GapBetweenSections}>
                                <Text as="p" variant="headingSm">
                                    Enter the title of your bundle
                                </Text>
                                <TextField
                                    label="Title"
                                    labelHidden
                                    autoComplete="off"
                                    inputMode="text"
                                    name="bundleTitle"
                                    helpText="This title will be displayed to your customers on the bundle page, in checkout, and in the cart."
                                    value={newBundleTitle}
                                    error={newBundleTitle === "" ? "Please enter a title" : undefined}
                                    onChange={(newTitile) => {
                                        setNewBundleTitle(newTitile);
                                    }}
                                    type="text"
                                />
                            </BlockStack>
                        </Box>
                        <TitleBar title="Bundle title">
                            <button variant="primary" onClick={createBundle} disabled={fetcher.state !== "idle"}>
                                Next
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Modal for users to confirm that they want to delete the bundle. */}
                    <Modal id="delete-confirm-modal" open={showBundleDeleteConfirmModal}>
                        <Box padding="300">
                            <Text as="p">If you delete this bundle, everything will be lost forever.</Text>
                        </Box>
                        <TitleBar title="Are you sure you want to delete this bundle?">
                            <button onClick={() => setShowBundleDeleteConfirmModal(false)}>Close</button>
                            <button
                                variant="primary"
                                tone="critical"
                                onClick={() => {
                                    if (!bundleForDelete) return;

                                    const form = new FormData();
                                    form.append("action", "deleteBundle");

                                    fetcher.submit(form, {
                                        method: "post",
                                        action: `/app/edit-bundle-builder/${bundleForDelete.id}/builder`,
                                    });

                                    setBundleForDelete(null);
                                    setShowBundleDeleteConfirmModal(false);
                                }}>
                                Delete
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Modal to show the customer that they've reacheda  limit and should upgrade */}
                    <Modal id="bundle-limit-modal">
                        <Box padding="300">
                            <BlockStack gap={GapBetweenSections}>
                                <Text as="p">You are on the 'Basic' plan which only allows you to have up to 2 bundles at one time.</Text>
                                <Text as="p" variant="headingSm">
                                    If you want to create more bundles, go to <Link to={"/app/billing"}>billing</Link> and upgrade to paid plan.
                                </Text>
                            </BlockStack>
                        </Box>
                        <TitleBar title="Maximum bundles reached">
                            <button variant="primary" onClick={() => shopify.modal.hide("bundle-limit-modal")}>
                                Close
                            </button>
                        </TitleBar>
                    </Modal>

                    <BlockStack gap={GapBetweenSections}>
                        <InlineStack align="space-between">
                            <Text as="h3" variant="headingLg">
                                My Bundles
                            </Text>
                            <Button icon={PlusIcon} variant="primary" onClick={createBundleBtnHandler}>
                                Create bundle
                            </Button>
                        </InlineStack>

                        <div id={styles.tableWrapper}>
                            <div className={fetcher.state !== "idle" ? styles.loadingTable : styles.hide}>
                                <Spinner accessibilityLabel="Spinner example" size="large" />
                            </div>
                            <Card>
                                {bundleBuilders.length > 0 ? (
                                    <DataTable
                                        columnContentTypes={["text", "text", "text", "text", "text"]}
                                        headings={["Bundle ID", "Name", "Status", "Actions", "Preview"]}
                                        rows={bundleBuilders.map((bundleBuilder: BundleBuilderClient) => {
                                            return [
                                                <Text as="p" tone="base">
                                                    {bundleBuilder.id}
                                                </Text>,

                                                //
                                                <Link
                                                    to="#"
                                                    onClick={() => {
                                                        handleEditBundleBuilder(bundleBuilder.id);
                                                    }}>
                                                    <Text as="p" tone="base">
                                                        {bundleBuilder.title}
                                                    </Text>
                                                </Link>,
                                                //
                                                <Link to={`/app/edit-bundle-builder/${bundleBuilder.id}/builder`}>
                                                    {bundleBuilder.published ? <Badge tone="success">Active</Badge> : <Badge tone="info">Draft</Badge>}
                                                </Link>,
                                                //
                                                <ButtonGroup>
                                                    <Button
                                                        icon={DeleteIcon}
                                                        variant="secondary"
                                                        tone="critical"
                                                        onClick={() => {
                                                            setBundleForDelete(bundleBuilder);
                                                        }}>
                                                        Delete
                                                    </Button>

                                                    {/* <Button
                                                        icon={PageAddIcon}
                                                        variant="secondary"
                                                        onClick={() => {
                                                            submitAction(
                                                            "duplicateBundle",
                                                            true,
                                                            `/app/edit-bundle-builder/${bundle.id}/builder`,
                                                            );
                                                        }}
                                                        >
                                                        Duplicate
                                                        </Button> */}

                                                    <Button icon={EditIcon} variant="primary" url={`/app/edit-bundle-builder/${bundleBuilder.id}/builder`}>
                                                        Edit
                                                    </Button>
                                                </ButtonGroup>,
                                                //
                                                <Button
                                                    icon={ExternalIcon}
                                                    variant="secondary"
                                                    tone="success"
                                                    url={`${bundleBuilder.bundleBuilderPageUrl}?${bundlePagePreviewKey}=true`}
                                                    target="_blank">
                                                    Preview
                                                </Button>,
                                            ];
                                        })}></DataTable>
                                ) : (
                                    <EmptyState
                                        heading="Let’s create the first custom bundle for your customers!"
                                        action={{
                                            content: "Create bundle",
                                            icon: PlusIcon,
                                            onAction: createBundleBtnHandler,
                                        }}
                                        fullWidth
                                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
                                        <p>Your customers will be able to use the custom bundles you create to create and buy their own custom bundles.</p>
                                    </EmptyState>
                                )}
                            </Card>
                        </div>
                    </BlockStack>
                </>
            )}
        </>
    );
}
