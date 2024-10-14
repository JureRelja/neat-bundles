import { useNavigation, json, useLoaderData, Link, Outlet, redirect } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
    Page,
    Card,
    Button,
    BlockStack,
    EmptyState,
    Banner,
    Text,
    Box,
    MediaCard,
    VideoThumbnail,
    SkeletonPage,
    SkeletonBodyText,
    DataTable,
    ButtonGroup,
    Badge,
    Spinner,
    Divider,
} from '@shopify/polaris';
import { PlusIcon, ExternalIcon, EditIcon, DeleteIcon, SettingsIcon } from '@shopify/polaris-icons';
import { authenticate } from '../../shopify.server';
import db from '../../db.server';
import { BundleAndStepsBasicClient, bundleAndSteps } from '../../adminBackend/service/dto/Bundle';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import styles from './route.module.css';
import { useState } from 'react';
import { Modal, TitleBar } from '@shopify/app-bridge-react';
import { bundlePagePreviewKey } from '~/constants';
import userRepository from '@adminBackend/repository/impl/UserRepository';

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
            ...new JsonData(true, 'success', 'Bundles were succesfully returned', [], bundleBuildersWithPageUrl),
        },
        { status: 200 },
    );
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case 'dismissHomePageBanner': {
            break;
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
    const asyncSubmit = useAsyncSubmit(); //Function for doing the submit action where the only data is action and url
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit action as if form was submitted
    const tableLoading: boolean = asyncSubmit.state !== 'idle'; //Table loading state

    const loaderResponse: JsonData<BundleAndStepsBasicClient[]> = useLoaderData<typeof loader>();

    const bundleBuilders: BundleAndStepsBasicClient[] = loaderResponse.data;

    const createBundle = () => {
        navigateSubmit('createBundle', '/app/edit-bundle-builder');
    };

    //Client state
    const [showBanner, setShowBanner] = useState(true);
    const [showTutorial, setShowTutorial] = useState(true);

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

                                    asyncSubmit.submit('deleteBundle', `/app/edit-bundle-builder/${bundleForDelete.id}`);
                                    setShowBundleDeleteConfirmModal(false);
                                }}>
                                Delete
                            </button>
                        </TitleBar>
                    </Modal>

                    <Page
                        title="Bundles"
                        primaryAction={
                            <Button icon={PlusIcon} variant="primary" onClick={createBundle}>
                                Create bundle
                            </Button>
                        }>
                        <BlockStack gap="500">
                            <div id={styles.tableWrapper}>
                                <div className={tableLoading ? styles.loadingTable : styles.hide}>
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
                                                    <Link to={`/app/bundleBuilder/${bundleBuilder.id}`}>
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

                            <Outlet />
                            {/* Video tutorial on how to use the app */}

                            {showTutorial && (
                                <MediaCard
                                    title="Watch a short tutorial to get quickly started"
                                    primaryAction={{
                                        content: 'Watch tutorial',
                                        onAction: () => {},
                                        icon: ExternalIcon,
                                        url: 'https://help.shopify.com',
                                        target: '_blank',
                                    }}
                                    size="small"
                                    description="We recommend watching this short tutorial to get started with creating Neat Bundle Builder"
                                    onDismiss={() => {
                                        setShowTutorial(false);
                                    }}
                                    popoverActions={[{ content: 'Dismiss', onAction: () => {} }]}>
                                    <VideoThumbnail
                                        videoLength={80}
                                        thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                                        onClick={() => console.log('clicked')}
                                    />
                                </MediaCard>
                            )}

                            {/* Banner for encuraging users to rate the app */}

                            {showBanner && (
                                <Banner
                                    title="Enjoying the app?"
                                    onDismiss={() => {
                                        setShowBanner(false);
                                    }}>
                                    <BlockStack gap="200">
                                        <Box>
                                            <p>We'd highly appreciate getting a review!</p>
                                        </Box>

                                        <Box>
                                            <Button>⭐ Leave a review</Button>
                                        </Box>
                                    </BlockStack>
                                </Banner>
                            )}
                            <Divider borderColor="transparent" />
                        </BlockStack>
                    </Page>
                </>
            )}
        </>
    );
}
