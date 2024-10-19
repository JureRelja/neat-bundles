import { json, redirect } from '@remix-run/node';
import { useActionData, useNavigate, Form, useNavigation, useLoaderData, useParams, Link, useSubmit } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
    Page,
    Card,
    Button,
    BlockStack,
    Text,
    Box,
    SkeletonPage,
    SkeletonBodyText,
    InlineGrid,
    Divider,
    FooterHelp,
    Banner,
    Tooltip,
    ChoiceList,
    Icon,
    InlineStack,
} from '@shopify/polaris';
import { SaveBar, useAppBridge } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import { BigGapBetweenSections, GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection, LargeGapBetweenSections } from '../../constants';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useNavigateSubmit } from '../../hooks/useNavigateSubmit';
import globalSettingsRepository from '~/adminBackend/repository/impl/GlobalSettingsRepository';
import userRepository from '~/adminBackend/repository/impl/UserRepository';
import bundleBuilderRepository from '~/adminBackend/repository/impl/BundleBuilderRepository';
import { GlobalSettings, StepNavigationType } from '@prisma/client';
import { useEffect, useState } from 'react';
import { QuestionCircleIcon } from '@shopify/polaris-icons';
import { ApiCacheKeyService } from '~/adminBackend/service/utils/ApiCacheKeyService';
import { ApiCacheService } from '~/adminBackend/service/utils/ApiCacheService';
import stickyNav from '../../assets/nav-sticky.png';
import normalNav from '../../assets/nav-normal.png';
import RadioInput from './radioInput';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const [globalSettings, user] = await Promise.all([globalSettingsRepository.getSettingsByStoreUrl(session.shop), userRepository.getUserByStoreUrl(session.shop)]);

    if (!globalSettings || !user) return redirect('/app');

    const bundleBuilder = await bundleBuilderRepository.getFirstActiveBundleBuilder(session.shop);

    return json(
        new JsonData(true, 'success', 'Global settings retrieved', [], {
            user,
            appId: process.env.SHOPIFY_BUNDLE_UI_ID,
            bundleBuilderHandle: bundleBuilder?.bundleBuilderPageHandle,
            globalSettings: globalSettings,
        }),
    );
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case 'updateSettings': {
            try {
                const newGlobalSettings = JSON.parse(formData.get('globalSettings') as string) as GlobalSettings;

                await globalSettingsRepository.updateGlobalSettings(newGlobalSettings);

                //Cache aside delete
                const cacheKey = new ApiCacheKeyService(session.shop);

                await ApiCacheService.singleKeyDelete(cacheKey.getGlobalSettingsKey());
            } catch (error) {
                console.error(error);
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
    const navigate = useNavigate();
    const shopify = useAppBridge();
    const isLoading: boolean = nav.state === 'loading';
    const isSubmitting: boolean = nav.state === 'submitting';
    const params = useParams();
    const submit = useSubmit();
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit with a navigation (the same if you were to use a From with a submit button)
    const actionData = useActionData<typeof action>();

    const loaderData = useLoaderData<typeof loader>();

    const data = loaderData.data;

    const serverGlobalSettings = data.globalSettings;

    //Using 'old' bundle data if there were errors when submitting the form. Otherwise, use the data from the loader.
    const [globalSettingsState, setGlobalSettingsState] = useState<GlobalSettings>(serverGlobalSettings);

    const saveGlobalSettingsHandler = async () => {
        const form = new FormData();
        form.append('action', 'updateSettings');
        form.append('globalSettings', JSON.stringify(globalSettingsState));

        //Submit the form
        submit(form, { method: 'POST', navigate: true });
    };

    const updateHandler = (attributeKey: string, value: string) => {
        console.log(attributeKey, value);
        setGlobalSettingsState((prev) => ({
            ...prev,
            [attributeKey]: value,
        }));
    };

    useEffect(() => {
        JSON.stringify(globalSettingsState) !== JSON.stringify(serverGlobalSettings) && shopify.saveBar.show('my-save-bar');

        return () => {
            //Cleanup
        };
    }, [globalSettingsState, serverGlobalSettings]);

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
                    <SaveBar id="my-save-bar">
                        <button variant="primary" onClick={saveGlobalSettingsHandler}></button>
                        <button onClick={() => shopify.saveBar.hide('my-save-bar')}></button>
                    </SaveBar>
                    {/* Edit global settings page */}
                    <Page
                        backAction={{
                            content: 'back',
                            onAction: async () => {
                                // Save or discard the changes before leaving the page
                                await shopify.saveBar.leaveConfirmation();
                                navigate(-1);
                            },
                        }}
                        title="Global settings"
                        subtitle="Edit the behaviour of all bundles">
                        <Form method="POST" data-discard-confirmation data-save-bar>
                            <input type="hidden" name="action" defaultValue="updateSettings" />
                            <input type="hidden" name="globalSettings" defaultValue={JSON.stringify(globalSettingsState)} />
                            <BlockStack gap={BigGapBetweenSections}>
                                {!data.bundleBuilderHandle ? (
                                    <Banner title="Uups, there are no bundles created." tone="warning" onDismiss={() => {}}>
                                        <BlockStack gap={GapInsideSection}>
                                            <Text as={'p'} variant="headingMd">
                                                Please create your first bundle, and then come back here to edit settings.
                                            </Text>
                                            <Box>
                                                <Button variant="primary" url="/app">
                                                    Create bundle
                                                </Button>
                                            </Box>
                                        </BlockStack>
                                    </Banner>
                                ) : (
                                    /* Edit settings, if there is at least one bundle created */

                                    // Edit styles
                                    <BlockStack gap={LargeGapBetweenSections}>
                                        <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                            <Box as="section">
                                                <BlockStack gap="400">
                                                    <Text as="h3" variant="headingLg">
                                                        Colors
                                                    </Text>
                                                    <Text as={'p'}>Edit colors to match your brand.</Text>
                                                </BlockStack>
                                            </Box>
                                            <Card>
                                                <BlockStack gap={GapInsideSection}>
                                                    <Text as="p">All styling changes are doing using the Shopify's native theme editor.</Text>
                                                    <Text as="p">Just click 'Edit styles'. The editing process is the same as if you were editing your theme.</Text>

                                                    <Button
                                                        variant="primary"
                                                        target="_blank"
                                                        url={`https://${data.user.storeUrl}/admin/themes/current/editor?context=apps&previewPath=/pages/${data.bundleBuilderHandle}?neatBundlePreview=true&appEmbed=${data.appId}/${'embed_block'}`}>
                                                        Edit styles
                                                    </Button>
                                                </BlockStack>
                                            </Card>
                                        </InlineGrid>

                                        <Divider />

                                        {/* Show/hide out of stock products  */}
                                        {/* <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                            <Box as="section">
                                                <BlockStack gap="400">
                                                    <Text as="h3" variant="headingMd">
                                                        Bundle builder
                                                    </Text>
                                                    <Text as="p" variant="bodyMd">
                                                        Edit the behaviour of the bundle builder. That's the part that your customers see when they are creating a bundle.
                                                    </Text>
                                                </BlockStack>
                                            </Box>
                                            <Card>
                                                <ChoiceList
                                                    title="Mobile step navigation"
                                                    allowMultiple
                                                    name={`displayMobileStepNavigation`}
                                                    choices={[
                                                        {
                                                            label: (
                                                                <InlineStack>
                                                                    <Text as={'p'}>Stick step navigation to the bottom on small screens</Text>
                                                                    <Tooltip
                                                                        width="wide"
                                                                        content="By default step navigation will be floating on the botom of the customer's screen on small devices. If you disable this, the navigation will look the same on big and small screens.">
                                                                        <Icon source={QuestionCircleIcon}></Icon>
                                                                    </Tooltip>
                                                                </InlineStack>
                                                            ),
                                                            value: 'displayMobileStepNavigation',
                                                        },
                                                    ]}
                                                    selected={[globalSettingsState.displayMobileStepNavigation ? 'displayMobileStepNavigation' : '']}
                                                    onChange={(selectedValue) => {
                                                        console.log(selectedValue);
                                                        setGlobalSettingsState((prev) => ({
                                                            ...prev,
                                                            displayMobileStepNavigation: selectedValue.includes('displayMobileStepNavigation'),
                                                        }));
                                                    }}
                                                />
                                            </Card>
                                        </InlineGrid> */}

                                        {/* Mobile settings  */}
                                        <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                            <Box as="section">
                                                <BlockStack gap="400">
                                                    <Text as="h3" variant="headingLg">
                                                        Mobile settings
                                                    </Text>
                                                    <Text as="p" variant="bodyMd">
                                                        Edit how your bundle builder looks on mobile and other small devices.{' '}
                                                    </Text>
                                                </BlockStack>
                                            </Box>
                                            <Card>
                                                <BlockStack gap={LargeGapBetweenSections}>
                                                    <BlockStack gap={GapBetweenSections}>
                                                        <BlockStack gap={GapBetweenTitleAndContent}>
                                                            <Text as="p" variant="headingLg">
                                                                Step navigation
                                                            </Text>
                                                            <Text as="p">
                                                                Navigation can be sticky or normal. Sticky navigation will be always visible on the screen, while normal navigation
                                                                is only visible when the user scrolls down.
                                                            </Text>
                                                        </BlockStack>

                                                        <InlineStack gap={GapInsideSection} align="space-between">
                                                            <RadioInput
                                                                imgSrc={normalNav}
                                                                label="Normal navigation"
                                                                attributeKey="stepNavigationTypeMobile"
                                                                selectedValue={globalSettingsState.stepNavigationTypeMobile}
                                                                value={'NORMAL'}
                                                                updateHandler={updateHandler}
                                                            />
                                                            <RadioInput
                                                                imgSrc={stickyNav}
                                                                label="Sticky navigation"
                                                                attributeKey="stepNavigationTypeMobile"
                                                                selectedValue={globalSettingsState.stepNavigationTypeMobile}
                                                                value={'STICKY'}
                                                                updateHandler={updateHandler}
                                                            />
                                                        </InlineStack>
                                                    </BlockStack>
                                                    {/* <Divider /> */}
                                                </BlockStack>
                                            </Card>
                                        </InlineGrid>

                                        <Divider />

                                        {/* Desktop settings  */}
                                        <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                            <Box as="section">
                                                <BlockStack gap="400">
                                                    <Text as="h3" variant="headingLg">
                                                        Desktop settings
                                                    </Text>
                                                    <Text as="p" variant="bodyMd">
                                                        Edit how your bundle builder looks on desktop and other large devices.
                                                    </Text>
                                                </BlockStack>
                                            </Box>
                                            <Card>
                                                <BlockStack gap={LargeGapBetweenSections}>
                                                    <BlockStack gap={GapBetweenSections}>
                                                        <BlockStack gap={GapBetweenTitleAndContent}>
                                                            <Text as="p" variant="headingLg">
                                                                Step navigation
                                                            </Text>
                                                            <Text as="p">
                                                                Navigation can be sticky or normal. Sticky navigation will be always visible on the screen, while normal navigation
                                                                is only visible when the user scrolls down.
                                                            </Text>
                                                        </BlockStack>
                                                        <InlineStack gap={GapInsideSection} align="space-between">
                                                            <RadioInput
                                                                label="Normal navigation"
                                                                imgSrc={normalNav}
                                                                attributeKey="stepNavigationTypeDesktop"
                                                                selectedValue={globalSettingsState.stepNavigationTypeDesktop}
                                                                value={'NORMAL'}
                                                                updateHandler={updateHandler}
                                                            />
                                                            <RadioInput
                                                                imgSrc={stickyNav}
                                                                label="Sticky navigation"
                                                                attributeKey="stepNavigationTypeDesktop"
                                                                selectedValue={globalSettingsState.stepNavigationTypeDesktop}
                                                                value={'STICKY'}
                                                                updateHandler={updateHandler}
                                                            />
                                                        </InlineStack>
                                                    </BlockStack>

                                                    {/* <Divider /> */}
                                                </BlockStack>
                                            </Card>
                                        </InlineGrid>
                                    </BlockStack>
                                )}

                                <Box width="full">
                                    {/* Save button */}
                                    <BlockStack inlineAlign="end">
                                        <Button variant="primary" submit>
                                            Save
                                        </Button>
                                    </BlockStack>

                                    {/* Footer help */}
                                    <FooterHelp>
                                        View the <Link to="/app/featureRequest">help docs</Link>, <Link to="/app/featureRequest">suggest new features</Link>, or{' '}
                                        <Link to="mailto:contact@neatmerchant.com" target="_blank">
                                            contact us
                                        </Link>{' '}
                                        for support.
                                    </FooterHelp>
                                </Box>
                            </BlockStack>
                        </Form>
                    </Page>
                </>
            )}
        </>
    );
}
