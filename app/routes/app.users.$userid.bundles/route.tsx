import { useNavigation, json, useLoaderData, Link, redirect, useParams, useFetcher, useNavigate, useRevalidator } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Card, Button, BlockStack, EmptyState, Text, Box, SkeletonPage, SkeletonBodyText, DataTable, ButtonGroup, Badge, Spinner, InlineStack } from '@shopify/polaris';
import { PlusIcon, ExternalIcon, EditIcon, DeleteIcon, SettingsIcon } from '@shopify/polaris-icons';
import { authenticate } from '../../shopify.server';
import db from '../../db.server';
import { BundleAndStepsBasicClient, bundleAndSteps } from '../../adminBackend/service/dto/Bundle';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import styles from './route.module.css';
import { useState } from 'react';
import { Modal, TitleBar } from '@shopify/app-bridge-react';
import { bundlePagePreviewKey, GapBetweenSections } from '~/constants';
import userRepository from '@adminBackend/repository/impl/UserRepository';
import bundleBuilderRepository, { BundleBuilderRepository } from '~/adminBackend/repository/impl/BundleBuilderRepository';
import { shopifyBundleBuilderProductRepository } from '~/adminBackend/repository/impl/ShopifyBundleBuilderProductRepository';
import { ShopifyRedirectRepository } from '~/adminBackend/repository/impl/ShopifyRedirectRepository';
import { ShopifyBundleBuilderPageRepository } from '~/adminBackend/repository/ShopifyBundleBuilderPageRepository';
import shopifyBundleBuilderPageGraphql from '@adminBackend/repository/impl/ShopifyBundleBuilderPageRepositoryGraphql';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request);

    const [user, bundleBuildersWithoutPageUrl] = await Promise.all([
        userRepository.getUserByStoreUrl(session.shop),

        db.bundleBuilder.findMany({
            where: {
                user: {
                    storeUrl: session.shop,
                },
                deleted: false,
            },
            select: bundleAndSteps,
            orderBy: {
                createdAt: 'desc',
            },
        }),
    ]);

    if (!user) return redirect('/app');

    const bundleBuildersWithPageUrl = bundleBuildersWithoutPageUrl.map((bundleBuilder) => {
        return {
            ...bundleBuilder,
            bundleBuilderPageUrl: `${user.primaryDomain}/pages/${bundleBuilder.bundleBuilderPageHandle}`, //Url of the bundle page
        };
    });

    return json(
        {
            ...new JsonData(true, 'success', 'Bundles succesfuly retrieved.', [], { bundleBuildersWithPageUrl, user }),
        },
        { status: 200 },
    );
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case 'createBundle': {
            try {
                const user = await userRepository.getUserByStoreUrl(session.shop);

                if (!user) return redirect('/app');

                if (user.activeBillingPlan === 'BASIC') {
                    const bundleBuilderCount = await bundleBuilderRepository.getBundleBuilderCountByStoreUrl(session.shop);

                    if (bundleBuilderCount >= 2) {
                        return json(new JsonData(false, 'error', 'You have reached the limit of 2 bundles for the basic plan.'), { status: 400 });
                    }
                }

                const url = new URL(request.url);
                const urlParams = url.searchParams;

                const isOnboarding = urlParams.get('onboarding') === 'true';

                const shopifyBundleBuilderPageRepository: ShopifyBundleBuilderPageRepository = shopifyBundleBuilderPageGraphql;

                console.log('isOnboarding', isOnboarding);

                //If the user is onboarding, create a new bundle with no data and return the json
                if (isOnboarding) {
                    const bundleTitle = formData.get('bundleTitle') as string;

                    //Create a new product that will be used as a bundle wrapper
                    const [bundleProductId, bundlePage] = await Promise.all([
                        shopifyBundleBuilderProductRepository.createBundleProduct(admin, bundleTitle, session.shop),
                        shopifyBundleBuilderPageRepository.createPage(admin, session, bundleTitle),
                    ]);

                    if (!bundleProductId || !bundlePage) {
                        return;
                    }

                    const [urlRedirectRes, bundleBuilder] = await Promise.all([
                        //Create redirect
                        ShopifyRedirectRepository.createProductToBundleRedirect(admin, bundlePage.handle as string, bundleProductId),
                        //Create new bundle
                        BundleBuilderRepository.createNewEmptyBundleBuilder(session.shop, bundleTitle, bundleProductId, bundlePage.id, bundlePage.handle),
                    ]);

                    await shopifyBundleBuilderPageRepository.setPageMetafields(bundleBuilder.id, bundlePage.id, session, admin);

                    return redirect(`/app/create-bundle-builder/${bundleBuilder.id}`);

                    // if the user is not onboarding, create a new bundle with all the data and redirect to the edit bundle page
                } else {
                    //If the user is not onboarding, create a new bundle
                    const maxBundleId = await BundleBuilderRepository.getMaxBundleBuilderId(session.shop);

                    const defaultBundleTitle = `New bundle ${maxBundleId ? maxBundleId : ''}`;

                    //Create a new product that will be used as a bundle wrapper
                    const [bundleProductId, bundlePage] = await Promise.all([
                        shopifyBundleBuilderProductRepository.createBundleProduct(admin, defaultBundleTitle, session.shop),
                        shopifyBundleBuilderPageRepository.createPage(admin, session, defaultBundleTitle),
                    ]);

                    if (!bundleProductId || !bundlePage) {
                        return;
                    }

                    const [urlRedirectRes, bundleBuilder] = await Promise.all([
                        //Create redirect
                        ShopifyRedirectRepository.createProductToBundleRedirect(admin, bundlePage.handle as string, bundleProductId),
                        //Create new bundle
                        BundleBuilderRepository.createNewBundleBuilder(session.shop, defaultBundleTitle, bundleProductId, bundlePage.id, bundlePage.handle),
                    ]);

                    await shopifyBundleBuilderPageRepository.setPageMetafields(bundleBuilder.id, bundlePage.id, session, admin);

                    return redirect(`/app/edit-bundle-builder/${bundleBuilder.id}`);
                }
            } catch (error) {
                console.log(error);
            }
        }

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
    const isLoading = nav.state !== 'idle';
    const params = useParams();
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit action as if form was submitted
    const fetcher = useFetcher();
    const navigate = useNavigate();

    const loaderResponse = useLoaderData<typeof loader>();

    const bundleBuilders: BundleAndStepsBasicClient[] = loaderResponse.data.bundleBuildersWithPageUrl;

    const user = loaderResponse.data.user;

    const canCreateNewBundle = (): boolean => {
        if (user.activeBillingPlan === 'BASIC' && bundleBuilders.length >= 2) {
            shopify.modal.show('bundle-limit-modal');
            return false;
        }

        return true;
    };

    const createBundle = () => {
        if (!canCreateNewBundle()) return;

        if (bundleBuilders.length === 0) {
            navigate('/app/create-bundle-builder');
            return;
        }

        navigateSubmit('createBundle', `/app/users/${params.userid}/bundles`);
    };

    const [bundleForDelete, setBundleForDelete] = useState<BundleAndStepsBasicClient | null>(null);
    const [showBundleDeleteConfirmModal, setShowBundleDeleteConfirmModal] = useState(false);

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
            ) : (
                <>
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
                                    form.append('action', 'deleteBundle');

                                    fetcher.submit(form, {
                                        method: 'post',
                                        action: `/app/edit-bundle-builder/${bundleForDelete.id}`,
                                    });

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
                                    If you want to create more bundles, go to <Link to={'/app/billing'}>billing</Link> and upgrade to paid plan.
                                </Text>
                            </BlockStack>
                        </Box>
                        <TitleBar title="Maximum bundles reached">
                            <button variant="primary" onClick={() => shopify.modal.hide('bundle-limit-modal')}>
                                Close
                            </button>
                        </TitleBar>
                    </Modal>

                    <BlockStack gap={GapBetweenSections}>
                        <InlineStack align="space-between">
                            <Text as="h3" variant="headingLg">
                                My Bundles
                            </Text>
                            <Button icon={PlusIcon} variant="primary" onClick={createBundle}>
                                Create bundle
                            </Button>
                        </InlineStack>

                        <div id={styles.tableWrapper}>
                            <div className={fetcher.state !== 'idle' ? styles.loadingTable : styles.hide}>
                                <Spinner accessibilityLabel="Spinner example" size="large" />
                            </div>
                            <Card>
                                {bundleBuilders.length > 0 ? (
                                    <DataTable
                                        columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
                                        headings={['Bundle ID', 'Name', 'Steps', 'Status', 'Actions', 'Settings', 'Preview']}
                                        rows={bundleBuilders.map((bundleBuilder: BundleAndStepsBasicClient) => {
                                            return [
                                                <Text as="p" tone="base">
                                                    {bundleBuilder.id}
                                                </Text>,

                                                //
                                                <Link to={`/app/edit-bundle-builder/${bundleBuilder.id}`}>
                                                    <Text as="p" tone="base">
                                                        {bundleBuilder.title}
                                                    </Text>
                                                </Link>,
                                                //
                                                bundleBuilder.steps.length,
                                                //
                                                <Link to={`/app/edit-bundle-builder/${bundleBuilder.id}`}>
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
                                                            setShowBundleDeleteConfirmModal(true);
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
                                                            `/app/edit-bundle-builder/${bundle.id}`,
                                                            );
                                                        }}
                                                        >
                                                        Duplicate
                                                        </Button> */}

                                                    <Button icon={EditIcon} variant="primary" url={`/app/edit-bundle-builder/${bundleBuilder.id}`}>
                                                        Edit
                                                    </Button>
                                                </ButtonGroup>,
                                                //
                                                <Button
                                                    icon={SettingsIcon}
                                                    variant="secondary"
                                                    tone="success"
                                                    url={`/app/edit-bundle-builder/${bundleBuilder.id}/settings/?redirect=/app/edit-bundle-builder`}>
                                                    Settings
                                                </Button>,
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
                                            content: 'Create bundle',
                                            icon: PlusIcon,
                                            onAction: createBundle,
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
