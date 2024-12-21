import { json } from "@remix-run/node";
import { useNavigate, Form, useNavigation, useLoaderData, Link, useSubmit } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page, Card, Button, BlockStack, Text, Box, SkeletonPage, SkeletonBodyText, InlineGrid, Divider, FooterHelp, Banner, Tooltip, InlineStack } from "@shopify/polaris";
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { BigGapBetweenSections, GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection, LargeGapBetweenSections } from "../../constants";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import globalSettingsRepository from "~/adminBackend/repository/impl/GlobalSettingsRepository";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import bundleBuilderRepository from "~/adminBackend/repository/impl/BundleBuilderRepository";
import type { GlobalSettings } from "@prisma/client";
import { useEffect, useState } from "react";
import { DesktopIcon, MobileIcon } from "@shopify/polaris-icons";
import { ApiCacheKeyService } from "~/adminBackend/service/utils/ApiCacheKeyService";
import { ApiCacheService } from "~/adminBackend/service/utils/ApiCacheService";
import stickyNavMobile from "../../assets/navStickyMobile.png";
import normalNavMobile from "../../assets/navNormalMobile.png";
import normalNavDesktop from "../../assets/navNormalDesktop.png";
import stickyNavDesktop from "../../assets/navStickyDesktop.png";
import RadioInput from "./imageRadioInput";
import styles from "./route.module.css";
import type { GlobalSettingsClient } from "~/types/GlobalSettingsClient";
import type { StepNavigationTypeClient } from "~/types/StepNavigationTypeClient";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { redirect, session } = await authenticate.admin(request);

    const [globalSettings, user] = await Promise.all([globalSettingsRepository.getSettingsByStoreUrl(session.shop), userRepository.getUserByStoreUrl(session.shop)]);

    if (!globalSettings || !user) return redirect("/app");

    const bundleBuilder = await bundleBuilderRepository.getFirstActiveBundleBuilder(session.shop);

    return json(
        new JsonData(true, "success", "Global settings retrieved", [], {
            user,
            appId: process.env.SHOPIFY_BUNDLE_UI_ID,
            bundleBuilderHandle: bundleBuilder?.bundleBuilderPageHandle,
            globalSettings: globalSettings,
        }),
    );
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get("action");

    switch (action) {
        case "updateSettings": {
            try {
                const newGlobalSettings = JSON.parse(formData.get("globalSettings") as string) as GlobalSettings;

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
    const submit = useSubmit();

    const loaderData = useLoaderData<typeof loader>();

    const data = loaderData.data;

    const serverGlobalSettings = data.globalSettings;

    const mappedGlobalSettings: GlobalSettingsClient = {
        ...serverGlobalSettings,
        stepNavigationTypeDesktop: serverGlobalSettings.stepNavigationTypeDesktop as StepNavigationTypeClient,
        stepNavigationTypeMobile: serverGlobalSettings.stepNavigationTypeMobile as StepNavigationTypeClient,
    };

    //Using 'old' bundle data if there were errors when submitting the form. Otherwise, use the data from the loader.
    const [globalSettingsState, setGlobalSettingsState] = useState<GlobalSettingsClient>(mappedGlobalSettings);
    const [activeMode, setActiveMode] = useState<"desktop" | "mobile">("desktop");

    const saveGlobalSettingsHandler = async () => {
        await shopify.saveBar.hide("my-save-bar");

        const form = new FormData();
        form.append("action", "updateSettings");
        form.append("globalSettings", JSON.stringify(globalSettingsState));

        //Submit the form
        submit(form, { method: "POST", navigate: true });
    };

    const updateHandler = (attributeKey: string, value: string) => {
        console.log(attributeKey, value);
        setGlobalSettingsState((prev) => ({
            ...prev,
            [attributeKey]: value,
        }));
    };

    useEffect(() => {
        JSON.stringify(globalSettingsState) !== JSON.stringify(serverGlobalSettings) && shopify.saveBar.show("my-save-bar");
    }, [globalSettingsState, serverGlobalSettings]);

    // const [activeEditorTab, setActiveEditorTab] = useState<'stepNavigation' | 'nav'>();

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
                        <button variant={"primary"} onClick={saveGlobalSettingsHandler}></button>
                        <button onClick={() => shopify.saveBar.hide("my-save-bar")}></button>
                    </SaveBar>
                    {/* Edit global settings page */}
                    <Page
                        fullWidth
                        backAction={{
                            content: "back",
                            onAction: async () => {
                                // Save or discard the changes before leaving the page
                                await shopify.saveBar.leaveConfirmation();
                                navigate(-1);
                            },
                        }}
                        title="Global settings"
                        subtitle="Edit the behavior of all bundles">
                        <Form method="POST" data-discard-confirmation data-save-bar>
                            <input type="hidden" name="action" defaultValue="updateSettings" />
                            <input type="hidden" name="globalSettings" defaultValue={JSON.stringify(globalSettingsState)} />

                            {!data.bundleBuilderHandle ? (
                                <Banner title="Uups, there are no bundles created." tone="warning" onDismiss={() => {}}>
                                    <BlockStack gap={GapInsideSection}>
                                        <Text as={"p"} variant="headingMd">
                                            Please create your first bundle, and then come back here to edit settings.
                                        </Text>
                                        <Box>
                                            <Button variant="secondary" url="/app">
                                                Create bundle
                                            </Button>
                                        </Box>
                                    </BlockStack>
                                </Banner>
                            ) : (
                                <BlockStack gap={BigGapBetweenSections}>
                                    {/* Edit colors */}
                                    <BlockStack gap={LargeGapBetweenSections}>
                                        <InlineGrid columns={{ xs: "1fr", md: "3fr 4fr" }} gap="400">
                                            <Box as="section">
                                                <BlockStack gap="400">
                                                    <Text as="h3" variant="headingLg">
                                                        Colors
                                                    </Text>
                                                    <Text as={"p"}>Edit colors to match your brand.</Text>
                                                </BlockStack>
                                            </Box>
                                            <Card>
                                                <BlockStack gap={GapInsideSection}>
                                                    <Text as="p">All styling changes are done using Shopify's native theme editor.</Text>
                                                    <Text as="p">Just click 'Edit styles'. The editing process is the same as if you were editing your theme.</Text>

                                                    <Button
                                                        variant="primary"
                                                        target="_blank"
                                                        url={`https://${data.user.storeUrl}/admin/themes/current/editor?context=apps&previewPath=/pages/${data.bundleBuilderHandle}?neatBundlePreview=true&appEmbed=${data.appId}/${"embed_block"}`}>
                                                        Edit colors
                                                    </Button>
                                                </BlockStack>
                                            </Card>
                                        </InlineGrid>

                                        <Divider />

                                        {/* Sticky header for separate mobile and desktop editing */}

                                        <InlineStack align="center">
                                            <Text as="h3" variant="headingLg">
                                                <InlineStack>
                                                    {/* <Icon source={ArrowDownIcon} /> */}
                                                    The settings below apply separately for desktop and mobile.
                                                    {/* <Icon source={ArrowDownIcon} /> */}
                                                </InlineStack>
                                            </Text>
                                        </InlineStack>
                                        <div className={styles.sticky}>
                                            <Card padding={"200"}>
                                                <InlineStack gap={GapBetweenTitleAndContent} align="space-between" blockAlign="center">
                                                    <Text as="h3" variant="headingMd">
                                                        You are currently editing settings for: <u>{activeMode === "desktop" ? "Desktop" : "Mobile"}</u>
                                                    </Text>

                                                    <InlineStack gap={GapInsideSection}>
                                                        <Tooltip content="Desktop">
                                                            <Button
                                                                variant="secondary"
                                                                icon={DesktopIcon}
                                                                disabled={activeMode === "desktop"}
                                                                onClick={() => {
                                                                    setActiveMode("desktop");
                                                                }}></Button>
                                                        </Tooltip>

                                                        <Tooltip content="Mobile">
                                                            <Button
                                                                variant="secondary"
                                                                icon={MobileIcon}
                                                                disabled={activeMode === "mobile"}
                                                                onClick={() => {
                                                                    setActiveMode("mobile");
                                                                }}></Button>
                                                        </Tooltip>
                                                    </InlineStack>
                                                </InlineStack>
                                            </Card>
                                        </div>

                                        <Divider />

                                        {/* Settings  */}

                                        {/* Editor beta */}
                                        {/* It's currently hidden, but will become active once there are a little more settings to customize */}
                                        {/* <InlineGrid columns={{ xs: '1fr', md: '1fr 6fr' }} gap="400">
                                            <Card>
                                                <Box as="section">
                                                    <BlockStack>
                                                        <p
                                                            className={`${styles.editorTab} ${activeEditorTab === 'stepNavigation' && styles.activeEditorTab}`}
                                                            onClick={() => setActiveEditorTab('stepNavigation')}>
                                                            Step navigation
                                                        </p>
                                                        <p
                                                            className={`${styles.editorTab} ${activeEditorTab === 'nav' && styles.activeEditorTab}`}
                                                            onClick={() => setActiveEditorTab('nav')}>
                                                            Step nav
                                                        </p>
                                                    </BlockStack>
                                                </Box>
                                            </Card>

                                            {activeEditorTab === 'stepNavigation' && (
                                                <Card>
                                                    <BlockStack gap={GapBetweenSections}>
                                                        <Text as="p" variant="bodyMd">
                                                            Navigation can be 'sticky' or 'normal'. 'Sticky' navigation will be always visible on the screen, while 'normal'
                                                            navigation is only visible when the user scrolls down.
                                                        </Text>
                                                        {activeMode === 'desktop' ? (
                                                            <InlineStack gap={GapInsideSection} align="center" blockAlign="center">
                                                                <RadioInput
                                                                    label="Normal navigation"
                                                                    imgSrc={normalNavDesktop}
                                                                    attributeKey="stepNavigationTypeDesktop"
                                                                    selectedValue={globalSettingsState.stepNavigationTypeDesktop}
                                                                    value={'NORMAL'}
                                                                    updateHandler={updateHandler}
                                                                    horizontal
                                                                />
                                                                <Text as="p" alignment="center">
                                                                    OR
                                                                </Text>
                                                                <RadioInput
                                                                    imgSrc={stickyNavDesktop}
                                                                    label="Sticky navigation"
                                                                    attributeKey="stepNavigationTypeDesktop"
                                                                    selectedValue={globalSettingsState.stepNavigationTypeDesktop}
                                                                    value={'STICKY'}
                                                                    updateHandler={updateHandler}
                                                                    horizontal
                                                                />
                                                            </InlineStack>
                                                        ) : (
                                                            <InlineStack gap={GapInsideSection} align="center" blockAlign="center">
                                                                <RadioInput
                                                                    label="Normal navigation"
                                                                    imgSrc={normalNavMobile}
                                                                    attributeKey="stepNavigationTypeMobile"
                                                                    selectedValue={globalSettingsState.stepNavigationTypeMobile}
                                                                    value={'NORMAL'}
                                                                    updateHandler={updateHandler}
                                                                />
                                                                <Text as="p" alignment="center">
                                                                    OR
                                                                </Text>
                                                                <RadioInput
                                                                    imgSrc={stickyNavMobile}
                                                                    label="Sticky navigation"
                                                                    attributeKey="stepNavigationTypeMobile"
                                                                    selectedValue={globalSettingsState.stepNavigationTypeMobile}
                                                                    value={'STICKY'}
                                                                    updateHandler={updateHandler}
                                                                />
                                                            </InlineStack>
                                                        )}
                                                    </BlockStack>
                                                </Card>
                                            )}

                                            {activeEditorTab === 'nav' && (
                                                <Card>
                                                    <BlockStack gap={GapBetweenSections}>
                                                        <Text as="p" variant="bodyMd">
                                                            Navigation can be 'sticky' or 'normal'. 'Sticky' navigation will be always visible on the screen, while 'normal'
                                                            navigation is only visible when the user scrolls down.
                                                        </Text>
                                                        {activeMode === 'desktop' ? (
                                                            <InlineStack gap={GapInsideSection} align="center" blockAlign="center">
                                                                <RadioInput
                                                                    label="Normal navigation"
                                                                    imgSrc={normalNavDesktop}
                                                                    attributeKey="stepNavigationTypeDesktop"
                                                                    selectedValue={globalSettingsState.stepNavigationTypeDesktop}
                                                                    value={'NORMAL'}
                                                                    updateHandler={updateHandler}
                                                                    horizontal
                                                                />
                                                                <Text as="p" alignment="center">
                                                                    OR
                                                                </Text>
                                                                <RadioInput
                                                                    imgSrc={stickyNavDesktop}
                                                                    label="Sticky navigation"
                                                                    attributeKey="stepNavigationTypeDesktop"
                                                                    selectedValue={globalSettingsState.stepNavigationTypeDesktop}
                                                                    value={'STICKY'}
                                                                    updateHandler={updateHandler}
                                                                    horizontal
                                                                />
                                                            </InlineStack>
                                                        ) : (
                                                            <InlineStack gap={GapInsideSection} align="center" blockAlign="center">
                                                                <RadioInput
                                                                    label="Normal navigation"
                                                                    imgSrc={normalNavMobile}
                                                                    attributeKey="stepNavigationTypeMobile"
                                                                    selectedValue={globalSettingsState.stepNavigationTypeMobile}
                                                                    value={'NORMAL'}
                                                                    updateHandler={updateHandler}
                                                                />
                                                                <Text as="p" alignment="center">
                                                                    OR
                                                                </Text>
                                                                <RadioInput
                                                                    imgSrc={stickyNavMobile}
                                                                    label="Sticky navigation"
                                                                    attributeKey="stepNavigationTypeMobile"
                                                                    selectedValue={globalSettingsState.stepNavigationTypeMobile}
                                                                    value={'STICKY'}
                                                                    updateHandler={updateHandler}
                                                                />
                                                            </InlineStack>
                                                        )}
                                                    </BlockStack>
                                                </Card>
                                            )}
                                        </InlineGrid> */}

                                        <InlineGrid columns={{ xs: "1fr", md: `${activeMode === "desktop" ? "2fr 5fr" : "3fr 4fr"}` }} gap="400">
                                            <Box as="section">
                                                <BlockStack gap="400">
                                                    <Text as="h3" variant="headingLg">
                                                        Step navigation
                                                    </Text>
                                                    <Text as="p" variant="bodyMd">
                                                        Navigation can be sticky or normal. Sticky navigation will be always visible on the screen, while normal navigation is only
                                                        visible when the user scrolls down.
                                                    </Text>
                                                </BlockStack>
                                            </Box>
                                            <Card>
                                                {activeMode === "desktop" ? (
                                                    <BlockStack gap={GapBetweenSections}>
                                                        <InlineStack gap={GapInsideSection} align="center" blockAlign="center">
                                                            <RadioInput
                                                                label="Normal navigation"
                                                                imgSrc={normalNavDesktop}
                                                                attributeKey="stepNavigationTypeDesktop"
                                                                selectedValue={globalSettingsState.stepNavigationTypeDesktop}
                                                                value={"NORMAL"}
                                                                updateHandler={updateHandler}
                                                                horizontal
                                                            />
                                                            <RadioInput
                                                                imgSrc={stickyNavDesktop}
                                                                label="Sticky navigation"
                                                                attributeKey="stepNavigationTypeDesktop"
                                                                selectedValue={globalSettingsState.stepNavigationTypeDesktop}
                                                                value={"STICKY"}
                                                                updateHandler={updateHandler}
                                                                horizontal
                                                            />
                                                        </InlineStack>
                                                    </BlockStack>
                                                ) : (
                                                    <BlockStack gap={GapBetweenSections}>
                                                        <InlineStack gap={GapInsideSection} align="center" blockAlign="center">
                                                            <RadioInput
                                                                label="Normal navigation"
                                                                imgSrc={normalNavMobile}
                                                                attributeKey="stepNavigationTypeMobile"
                                                                selectedValue={globalSettingsState.stepNavigationTypeMobile}
                                                                value={"NORMAL"}
                                                                updateHandler={updateHandler}
                                                            />
                                                            <RadioInput
                                                                imgSrc={stickyNavMobile}
                                                                label="Sticky navigation"
                                                                attributeKey="stepNavigationTypeMobile"
                                                                selectedValue={globalSettingsState.stepNavigationTypeMobile}
                                                                value={"STICKY"}
                                                                updateHandler={updateHandler}
                                                            />
                                                        </InlineStack>
                                                    </BlockStack>
                                                )}
                                            </Card>
                                        </InlineGrid>
                                    </BlockStack>

                                    <Box width="full">
                                        {/* Save button */}
                                        <BlockStack inlineAlign="end">
                                            <Button variant="primary" submit>
                                                Save
                                            </Button>
                                        </BlockStack>

                                        {/* Footer help */}
                                        <FooterHelp>
                                            Are you stuck? <Link to="/app/help">Get help</Link> from us, or <Link to="/app/feature-request">suggest new features</Link>.
                                        </FooterHelp>
                                    </Box>
                                </BlockStack>
                            )}
                        </Form>
                    </Page>
                </>
            )}
        </>
    );
}
