import { useNavigation, json, useLoaderData, Link } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
    Page,
    Card,
    BlockStack,
    SkeletonPage,
    Text,
    SkeletonBodyText,
    Divider,
    Banner,
    Box,
    ChoiceList,
    Icon,
    InlineGrid,
    InlineStack,
    Tooltip,
    MediaCard,
    VideoThumbnail,
    Button,
    Badge,
} from '@shopify/polaris';
import { CheckIcon, ExternalIcon, QuestionCircleIcon, XSmallIcon } from '@shopify/polaris-icons';
import { authenticate } from '../../shopify.server';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import { GapBetweenSections, GapInsideSection, LargeGapBetweenSections } from '~/constants';
import ActivateVideo from '../../assets/biscuits-bundles-add-an-app-block-53671127.mp4';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request);

    const url = new URL(request.url);
    const thankYouBanner = url.searchParams.get('thankYou');

    return json({
        ...new JsonData(true, 'success', 'Installation page', [], [{ displayThankYouBaner: thankYouBanner === 'true', activeTheme: { name: 'Sense', compatible: true } }]),
    });
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

    const loaderResponse = useLoaderData<typeof loader>();

    const data = loaderResponse.data[0];

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
                    <Page title="Installation">
                        <BlockStack gap={LargeGapBetweenSections}>
                            {data.displayThankYouBaner && (
                                <>
                                    <Banner title="Thank you for choosing a plan!" tone="success" onDismiss={() => {}}>
                                        <BlockStack gap={GapInsideSection}>
                                            <Text as={'p'} variant="headingMd">
                                                You will be using Neat bundles to let your customer create bundles they love in no time.
                                            </Text>

                                            <Text as={'p'}>
                                                Just before you get there, you just need to quickly go through instalation to get Neat bundles app properly connected to your store.
                                            </Text>
                                        </BlockStack>
                                    </Banner>
                                    <Divider />
                                </>
                            )}

                            {/* Video tutorial */}
                            <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                <Box as="section">
                                    <BlockStack gap="400">
                                        <Text as="h3" variant="headingMd">
                                            Video tutorial
                                        </Text>
                                    </BlockStack>
                                </Box>
                                <MediaCard
                                    title="Watch a short tutorial to get quickly started"
                                    primaryAction={{
                                        content: 'Watch tutorial',
                                        icon: ExternalIcon,
                                        url: 'https://help.shopify.com',
                                        target: '_blank',
                                    }}
                                    size="small"
                                    description="We recommend watching this short tutorial to get quickly started instalation and creating bundles."
                                    popoverActions={[{ content: 'Dismiss', onAction: () => {} }]}>
                                    <VideoThumbnail
                                        videoLength={80}
                                        thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                                        onClick={() => console.log('clicked')}
                                    />
                                </MediaCard>
                            </InlineGrid>

                            <Divider />

                            {/* Activating app embed */}
                            <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                <Box as="section">
                                    <BlockStack gap="400">
                                        <Text as="h3" variant="headingXl">
                                            App activation
                                        </Text>
                                        <Text as="p" variant="bodyMd">
                                            Follow these 3 steps to active the Neat bundles app.
                                        </Text>
                                    </BlockStack>
                                </Box>
                                <Card>
                                    <InlineStack gap={GapInsideSection} align="center" blockAlign="start">
                                        <BlockStack gap={GapBetweenSections} align="end">
                                            <BlockStack>
                                                <Text as="p">
                                                    1. Click the "<b>Activate app</b>" button
                                                </Text>
                                                <Text as="p">
                                                    2. Click "<b>Save</b>" in Shopify theme editor
                                                </Text>
                                                <Text as="p">3. You're all done</Text>
                                            </BlockStack>
                                            <Box>
                                                <InlineStack align="end">
                                                    <Button variant="primary">Activate app</Button>
                                                </InlineStack>
                                            </Box>
                                        </BlockStack>
                                        <video src={ActivateVideo} autoPlay width={370} style={{ backgroundColor: 'red' }} loop></video>
                                    </InlineStack>
                                </Card>
                            </InlineGrid>

                            <Divider />

                            {/* Theme compatibility */}
                            <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                <Box as="section">
                                    <BlockStack gap="400">
                                        <Text as="h3" variant="headingMd">
                                            Theme compatibility
                                        </Text>
                                        <Text as="p" variant="bodyMd">
                                            Neat bundles is compatible with all{' '}
                                            <Link to="https://www.shopify.com/partners/blog/shopify-online-store" target="_blank">
                                                Online store 2.0
                                            </Link>{' '}
                                            themes.
                                        </Text>
                                    </BlockStack>
                                </Box>
                                <Card>
                                    <BlockStack>
                                        {data.activeTheme.compatible ? (
                                            <InlineStack gap={GapBetweenSections}>
                                                <Text as="h3">
                                                    Your active theme <b>{data.activeTheme.name}</b> is compatible with Neat Bundles.
                                                </Text>
                                                <Badge tone="success" icon={CheckIcon}>
                                                    Theme compatible
                                                </Badge>
                                            </InlineStack>
                                        ) : (
                                            <InlineStack gap={GapInsideSection}>
                                                <Text as="h3">
                                                    Your theme {data.activeTheme.name} is unfortunately not compatible with Neat Bundles. Please switch to a 2.0 theme.
                                                </Text>

                                                <Badge tone="critical" icon={XSmallIcon}>
                                                    Theme not compatible
                                                </Badge>
                                            </InlineStack>
                                        )}
                                    </BlockStack>
                                </Card>
                            </InlineGrid>

                            <Divider />

                            {/* How it works */}
                            <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                <Box as="section">
                                    <BlockStack gap="400">
                                        <Text as="h3" variant="headingMd">
                                            How it works
                                        </Text>
                                        <Text as="p" variant="bodyMd">
                                            Feel free to skip this section if you're not interested to know how Neat bundles interacts with your store to let your customers create
                                            custome bundles.
                                        </Text>
                                    </BlockStack>
                                </Box>
                                <Card>
                                    <ChoiceList
                                        title="Pricing summary"
                                        allowMultiple
                                        name={`hidePricingSummary`}
                                        choices={[
                                            {
                                                label: (
                                                    <InlineStack>
                                                        <Text as={'p'}>Hide pricing summary on steps</Text>
                                                        <Tooltip
                                                            width="wide"
                                                            content="By hiding pricing summary, customers won't be able to see their bundle price until they add a bundle to cart or reach checkout.">
                                                            <Icon source={QuestionCircleIcon}></Icon>
                                                        </Tooltip>
                                                    </InlineStack>
                                                ),
                                                value: 'true',
                                            },
                                        ]}
                                        selected={[]}
                                    />
                                </Card>
                            </InlineGrid>
                        </BlockStack>
                    </Page>
                </>
            )}
        </>
    );
}
