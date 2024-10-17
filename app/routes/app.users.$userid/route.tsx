import { useNavigation, json, useLoaderData, Link, useNavigate, Outlet, useParams, redirect } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
    Page,
    Card,
    BlockStack,
    SkeletonPage,
    Text,
    SkeletonBodyText,
    Divider,
    FooterHelp,
    CalloutCard,
    Badge,
    Banner,
    Box,
    Button,
    ButtonGroup,
    DataTable,
    EmptyState,
    MediaCard,
    Spinner,
    VideoThumbnail,
} from '@shopify/polaris';
import { authenticate } from '~/shopify.server';
import { JsonData } from '@adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '~/hooks/useAsyncSubmit';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import { ExternalIcon, PlusIcon } from '@shopify/polaris-icons';
import { GapBetweenSections, GapInsideSection, bundlePagePreviewKey } from '~/constants';
import userRepository from '~/adminBackend/repository/impl/UserRepository';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    const url = new URL(request.url);
    const installSuccessBanner = url.searchParams.get('installSuccess');

    return json(new JsonData(true, 'success', 'User successfuly retrieved', [], { installSuccessBanner: installSuccessBanner === 'true', user: user }));
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case 'hideTutorial': {
            const user = await userRepository.getUserByStoreUrl(session.shop);

            if (!user) return redirect('/app');

            await userRepository.updateUser({ ...user, showTutorialBanner: false });

            return redirect('bundles');
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
    const params = useParams();

    const loaderResponse = useLoaderData<typeof loader>();
    const data = loaderResponse.data;

    const navigate = useNavigate();

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
                    <Page
                        title="Neat Bundles"
                        // backAction={{
                        //     content: 'Back',
                        //     onAction: async () => {
                        //         navigate(-1);
                        //     },
                        // }}
                    >
                        <BlockStack gap={'800'}>
                            <BlockStack gap={GapBetweenSections}>
                                {data.installSuccessBanner && (
                                    <>
                                        <Banner title="Installation successfull, congradulation!" tone="success" onDismiss={() => {}}>
                                            <BlockStack gap={GapInsideSection}>
                                                <Text as={'p'}>
                                                    Congradulation on succesfully installing our app. Let's now start creating the first bundle for your customers. The whole
                                                    process should take less than 5 minutes.
                                                </Text>
                                            </BlockStack>
                                        </Banner>
                                        <Divider />
                                    </>
                                )}

                                <Outlet />
                            </BlockStack>

                            <Divider />

                            <BlockStack gap={GapBetweenSections}>
                                {/* Video tutorial on how to use the app */}

                                {data.user.showTutorialBanner && (
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
                                        popoverActions={[
                                            {
                                                content: 'Dismiss',
                                                onAction: () => {
                                                    navigateSubmit('hideTutorial', `/app/users/${params.userid}`);
                                                },
                                            },
                                        ]}>
                                        <VideoThumbnail
                                            videoLength={80}
                                            thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                                            onClick={() => console.log('clicked')}
                                        />
                                    </MediaCard>
                                )}

                                {/* How it works */}
                                <CalloutCard
                                    title={
                                        <Text as="h3" variant="headingMd">
                                            How does Neat Bundles work?
                                        </Text>
                                    }
                                    illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
                                    primaryAction={{
                                        content: 'See how it works',
                                        url: '',
                                    }}>
                                    <Text as="p" variant="bodyMd">
                                        Check out how Neat Bundles works underneath the hood. Note: This is optional and is not necessary to use our app.
                                    </Text>
                                </CalloutCard>

                                <Divider />

                                {/* Banner for encuraging users to rate the app */}
                                <Banner title="Enjoying the app?" tone="success">
                                    <BlockStack gap="200">
                                        <Box>
                                            <p>We'd highly appreciate getting a review!</p>
                                        </Box>

                                        <Box>
                                            <Button>⭐ Leave a review</Button>
                                        </Box>
                                    </BlockStack>
                                </Banner>

                                <Divider borderColor="transparent" />

                                <FooterHelp>
                                    View the <Link to="https://help.shopify.com/manual/orders/fulfill-orders">help docs</Link>,
                                    <Link to="https://help.shopify.com/manual/orders/fulfill-orders">suggest new features</Link>, or
                                    <Link to="https://help.shopify.com/manual/orders/fulfill-orders">contact us</Link> for support.
                                </FooterHelp>
                            </BlockStack>
                        </BlockStack>
                    </Page>
                </>
            )}
        </>
    );
}
