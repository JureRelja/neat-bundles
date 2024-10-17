import { useNavigation, json, useLoaderData, Link, useNavigate, redirect, useActionData, useFetcher, Form } from '@remix-run/react';
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
    InlineGrid,
    InlineStack,
    MediaCard,
    VideoThumbnail,
    Button,
    Badge,
    Spinner,
} from '@shopify/polaris';
import { CheckIcon, ExternalIcon, XSmallIcon } from '@shopify/polaris-icons';
import { authenticate } from '../../shopify.server';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import { GapBetweenSections, GapInsideSection, LargeGapBetweenSections } from '~/constants';
import ActivateVideo from '../../assets/biscuits-bundles-add-an-app-block-53671127.mp4';
import userRepository from '~/adminBackend/repository/impl/UserRepository';
import shopifyThemesRepository from '~/adminBackend/repository/impl/ShopifyThemesRepository';
import { useEffect } from 'react';
import styles from './route.module.css';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request);

    const url = new URL(request.url);
    const thankYouBanner = url.searchParams.get('thankYou');

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    //Currently active theme
    const activeTheme = await shopifyThemesRepository.getMainThemeWithTandS(admin);

    let activeThemeCompatible = true;

    try {
        //Checking if theme has .json templates
        if (!activeTheme.files || activeTheme.files.nodes.length === 0) {
            activeThemeCompatible = false;
            throw Error('Theme not compatible, there are no .json templates in active theme.');
        }

        //Checking if page template has 'main' section
        const pageTemplate = activeTheme.files.nodes.filter((file) => file.filename === 'templates/page.json');

        if (!pageTemplate) throw Error('There is no template/page.json file in active theme.');

        const templateBody = pageTemplate[0].body;

        if (templateBody.__typename === 'OnlineStoreThemeFileBodyText') {
            const bodyContent = JSON.parse(templateBody.content);

            const mainSection = Object.entries(bodyContent.sections).find(([id, section]: [any, any]) => id === 'main' || section.type.startsWith('main-'));

            if (!mainSection) {
                activeThemeCompatible = false;
                throw Error("Theme not compatible, there is no 'main' section in the 'template/page.json'.");
            }
        }
    } catch (err) {
        console.log(err);
        //
    } finally {
        return json({
            ...new JsonData(
                true,
                'success',
                'Installation page',
                [],
                [
                    {
                        displayThankYouBaner: thankYouBanner === 'true',
                        storeUrl: user.storeUrl,
                        appId: process.env.SHOPIFY_BUNDLE_UI_ID,
                        activeTheme: { name: activeTheme.name, compatible: activeThemeCompatible },
                    },
                ],
            ),
        });
    }
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return '/app';

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case 'FINISH_INSTALL': {
            try {
                //Currently active theme
                const mainTheme = await shopifyThemesRepository.getMainThemeWithSettings(admin);

                //Checking if theme has .json templates
                if (!mainTheme.files || mainTheme.files.nodes.length === 0) {
                    throw Error('Theme not compatible, there are no .json templates in active theme.');
                }

                const themeSettings = mainTheme.files?.nodes[0];

                if (themeSettings.body.__typename === 'OnlineStoreThemeFileBodyText') {
                    const bodyContent = JSON.parse(themeSettings.body.content);

                    const neatBundlesEmbedBlock = Object.entries(bodyContent.current.blocks).filter(([blockId, block]: [string, any]) => {
                        if (block.type.includes(process.env.SHOPIFY_BUNDLE_UI_ID)) {
                            if (!block.disabled) {
                                return true;
                            }
                        }

                        return false;
                    })[0];

                    if (!neatBundlesEmbedBlock) {
                        user.completedInstallation = false;

                        await userRepository.updateUser(user);
                        throw Error('App not activated.');
                    }

                    user.completedInstallation = true;

                    await userRepository.updateUser(user);

                    return redirect('/app/bundles?installSuccess=true');
                }
            } catch (err) {
                console.log(err);

                return json(
                    {
                        ...new JsonData(
                            false,
                            'error',
                            "Neat Bundels hasn't been properly activated. If you've already activated it, please try deactivating it and activating it again. If the errror continues, feel free to reach us as support@neatmerchant.com.",
                        ),
                    },
                    { status: 200 },
                );
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
    const asyncSubmit = useAsyncSubmit(); //Function for doing the submit action where the only data is action and url
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit action as if form was submitted
    const fetcher = useFetcher();

    const loaderResponse = useLoaderData<typeof loader>();
    const actionResponse = useActionData<typeof action>();

    const data = loaderResponse.data[0];

    const navigate = useNavigate();

    //Navigating to the first error
    useEffect(() => {
        scrollTo(0, 0);
    }, [actionResponse]);

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
                        title="Installation"
                        backAction={{
                            content: 'Back',
                            onAction: async () => {
                                navigate(-1);
                            },
                        }}>
                        <BlockStack gap={LargeGapBetweenSections} id="top">
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

                            {actionResponse && actionResponse !== '/app' && !actionResponse.ok && actionResponse.message ? (
                                <>
                                    <Banner title="App wasn't detected in your theme." tone="critical" onDismiss={() => {}}>
                                        <BlockStack gap={GapInsideSection}>
                                            <Text as={'p'}>{actionResponse.message}</Text>
                                        </BlockStack>
                                    </Banner>
                                    <Divider />
                                </>
                            ) : (
                                <></>
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
                                                    <Button
                                                        variant="primary"
                                                        target="_blank"
                                                        url={`https://${data.storeUrl}/admin/themes/current/editor?context=apps&activateAppId=${data.appId}/${'embed_block'}`}>
                                                        Activate app
                                                    </Button>
                                                </InlineStack>
                                            </Box>
                                        </BlockStack>
                                        <video src={ActivateVideo} autoPlay width={370} loop></video>
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
                                                <InlineStack gap={GapInsideSection}>
                                                    <Text as="h3">
                                                        Your active theme <b>{data.activeTheme.name}</b> is compatible with Neat Bundles.
                                                    </Text>
                                                    <Badge tone="success" icon={CheckIcon}>
                                                        Theme compatible
                                                    </Badge>
                                                </InlineStack>

                                                <Text as="p" fontWeight="bold">
                                                    If you change your theme, make sure to come back here and check if Neat Bundles supports your new theme.
                                                </Text>
                                                <Text as="p">
                                                    If you have trouble activating the app, send us an email at{' '}
                                                    <Link to="mailto:support@neatmerchantcom">support@neatmerchant.com</Link> and we will help you with the activation.
                                                </Text>
                                            </InlineStack>
                                        ) : (
                                            <InlineStack gap={GapInsideSection}>
                                                <InlineStack gap={GapInsideSection}>
                                                    <Text as="h3">
                                                        Your theme <b>{data.activeTheme.name}</b> is unfortunately not compatible with Neat Bundles.
                                                    </Text>

                                                    <Badge tone="critical" icon={XSmallIcon}>
                                                        Theme not compatible
                                                    </Badge>
                                                </InlineStack>

                                                <Text as="p">You are either using a custom theme or Online store 1.0 theme. </Text>
                                                <Text as="p">
                                                    Send us an email at <Link to="mailto:support@neatmerchantcom">support@neatmerchant.com</Link> and we can help you integrate our
                                                    app with your theme. Exept in some extreme cases (very old or poorly designed theme) <b>integration will be free of charge.</b>
                                                </Text>
                                            </InlineStack>
                                        )}
                                    </BlockStack>
                                </Card>
                            </InlineGrid>

                            <Box width="full">
                                <BlockStack inlineAlign="end">
                                    <Form method="post">
                                        <input type="text" name="action" value="FINISH_INSTALL" hidden />
                                        <Button variant="primary" submit>
                                            Finish installation
                                        </Button>
                                    </Form>
                                </BlockStack>
                            </Box>
                            <Divider borderColor="transparent" />
                        </BlockStack>
                    </Page>
                </>
            )}
        </>
    );
}
