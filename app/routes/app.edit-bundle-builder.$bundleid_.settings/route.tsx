import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation, useNavigate, Form, Link } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import db from "../../db.server";
import {
    Card,
    BlockStack,
    Text,
    Divider,
    InlineGrid,
    ChoiceList,
    Page,
    Button,
    Box,
    SkeletonPage,
    SkeletonBodyText,
    Tooltip,
    Icon,
    InlineStack,
    FooterHelp,
} from "@shopify/polaris";
import { BigGapBetweenSections, GapBetweenSections } from "../../constants";
import { QuestionCircleIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import { JsonData } from "~/adminBackend/service/dto/jsonData";
import { ApiCacheService } from "~/adminBackend/service/utils/ApiCacheService";
import { ApiCacheKeyService } from "~/adminBackend/service/utils/ApiCacheKeyService";
import type { BundleSettings } from "@prisma/client";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await authenticate.admin(request);

    const bundleSettings: BundleSettings | null = await db.bundleSettings.findUnique({
        where: {
            bundleBuilderId: Number(params.bundleid),
        },
    });

    if (!bundleSettings) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }
    return json(
        new JsonData(true, "success", "Bundle settings succesfuly retrieved", [], bundleSettings),

        { status: 200 },
    );
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { session, redirect } = await authenticate.admin(request);

    const formData = await request.formData();

    const bundleSettings: BundleSettings = JSON.parse(formData.get("bundleSettings") as string);

    try {
        const result: BundleSettings | null = await db.bundleSettings.update({
            where: {
                bundleBuilderId: Number(params.bundleid),
            },
            data: {
                hidePricingSummary: bundleSettings.hidePricingSummary,
                skipTheCart: bundleSettings.skipTheCart,
                allowBackNavigation: bundleSettings.allowBackNavigation,
                showOutOfStockProducts: bundleSettings.showOutOfStockProducts,
            },
        });

        if (!result) {
            throw new Error("Failed to update bundle settings");
        }

        // Clear the cache for the bundle
        const cacheKeyService = new ApiCacheKeyService(session.shop);

        await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string));

        const url: URL = new URL(request.url);

        // Redirect to a specific page if the query param is present
        if (url.searchParams.has("redirect")) {
            return redirect(url.searchParams.get("redirect") as string);
        }

        return redirect(`/app`);
    } catch (error) {
        console.error(error);
        throw new Response(null, {
            status: 404,
            statusText: "Settings not found",
        });
    }
};

export default function Index() {
    const navigate = useNavigate();
    const nav = useNavigation();
    const shopify = useAppBridge();
    const isLoading: boolean = nav.state != "idle";

    const serverSettings: BundleSettings = useLoaderData<typeof loader>().data;

    const [settingsState, setSetttingsState] = useState<BundleSettings>(serverSettings);

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
                // Bundle settings page
                <Page
                    title={`Bundle settings`}
                    subtitle="Edit settings only for this bundle."
                    backAction={{
                        content: "Products",
                        onAction: async () => {
                            // Save or discard the changes before leaving the page
                            await shopify.saveBar.leaveConfirmation();
                            navigate(-1);
                        },
                    }}>
                    <Form method="POST" data-discard-confirmation data-save-bar>
                        <input type="hidden" name="bundleSettings" value={JSON.stringify(settingsState)} />

                        <BlockStack gap={BigGapBetweenSections}>
                            {/* Checkbox settings */}
                            <InlineGrid columns={{ xs: "1fr", md: "3fr 4fr" }} gap="400">
                                <Box as="section">
                                    <BlockStack gap="400">
                                        <Text as="h3" variant="headingMd">
                                            Pricing summary
                                        </Text>
                                        <Text as="p" variant="bodyMd">
                                            Thep pricing summary shows customers the pricing and discount of the bundle that they are creating.
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
                                                        <Text as={"p"}>Hide pricing summary on steps</Text>
                                                        <Tooltip
                                                            width="wide"
                                                            content="By hiding the pricing summary, customers won't be able to see their bundle price until they add a bundle to the cart or reach checkout.">
                                                            <Icon source={QuestionCircleIcon}></Icon>
                                                        </Tooltip>
                                                    </InlineStack>
                                                ),
                                                value: "true",
                                            },
                                        ]}
                                        selected={settingsState.hidePricingSummary ? ["true"] : []}
                                        onChange={(value) => {
                                            setSetttingsState((prevSettings: BundleSettings) => {
                                                return {
                                                    ...prevSettings,
                                                    hidePricingSummary: value[0] === "true",
                                                };
                                            });
                                        }}
                                    />
                                </Card>
                            </InlineGrid>
                            <Divider />
                            <InlineGrid columns={{ xs: "1fr", md: "3fr 4fr" }} gap="400">
                                <Box as="section">
                                    <BlockStack gap="400">
                                        <Text as="h3" variant="headingMd">
                                            Navigation
                                        </Text>
                                        <Text as="p" variant="bodyMd">
                                            Navigation consists of navigating between individual bundle steps, and navigating after the customer finishes building their bundle.
                                        </Text>
                                    </BlockStack>
                                </Box>
                                <Card>
                                    <ChoiceList
                                        title="Navigation"
                                        name={`allowBackNavigation`}
                                        allowMultiple
                                        choices={[
                                            {
                                                label: (
                                                    <InlineStack>
                                                        <Text as={"p"}>Allow customers to go back on steps</Text>
                                                        <Tooltip
                                                            width="wide"
                                                            content="If this is not selected, customers won't be able to use the 'back' button to go back on steps.">
                                                            <Icon source={QuestionCircleIcon}></Icon>
                                                        </Tooltip>
                                                    </InlineStack>
                                                ),
                                                value: "true",
                                            },
                                        ]}
                                        selected={settingsState.allowBackNavigation ? ["true"] : []}
                                        onChange={(value) => {
                                            setSetttingsState((prevSettings: BundleSettings) => {
                                                return {
                                                    ...prevSettings,
                                                    allowBackNavigation: value[0] === "true",
                                                };
                                            });
                                        }}
                                    />
                                    <ChoiceList
                                        title="Cart"
                                        allowMultiple
                                        name={`skipTheCart`}
                                        choices={[
                                            {
                                                label: (
                                                    <InlineStack>
                                                        <Text as={"p"}>Skip the cart and go to checkout directly</Text>
                                                        <Tooltip
                                                            width="wide"
                                                            content="Without this option selected, all the customer will be redirected to the cart page after they finish building their bundle.">
                                                            <Icon source={QuestionCircleIcon}></Icon>
                                                        </Tooltip>
                                                    </InlineStack>
                                                ),
                                                value: "true",
                                            },
                                        ]}
                                        selected={settingsState.skipTheCart ? ["true"] : []}
                                        onChange={(value) => {
                                            setSetttingsState((prevSettings: BundleSettings) => {
                                                return {
                                                    ...prevSettings,
                                                    skipTheCart: value[0] === "true",
                                                };
                                            });
                                        }}
                                    />
                                </Card>
                            </InlineGrid>
                            <Divider />
                            <InlineGrid columns={{ xs: "1fr", md: "3fr 4fr" }} gap="400">
                                <Box as="section">
                                    <BlockStack gap="400">
                                        <Text as="h3" variant="headingMd">
                                            Products
                                        </Text>
                                        <Text as="p" variant="bodyMd">
                                            Change settings on how products are displayed and used.
                                        </Text>
                                    </BlockStack>
                                </Box>
                                <Card>
                                    <ChoiceList
                                        title="Products"
                                        allowMultiple
                                        name={`showOutOfStockProducts`}
                                        choices={[
                                            {
                                                label: (
                                                    <InlineStack>
                                                        <Text as={"p"}>Show “out of stock” and unavailable products</Text>
                                                        <Tooltip
                                                            width="wide"
                                                            content="By default, only products that have at least one variant that's in stock at the time of purchase will be displayed. If this is selected, all 'out of stock' products will be visible, but customers won't be able to add them to their bundles.">
                                                            <Icon source={QuestionCircleIcon}></Icon>
                                                        </Tooltip>
                                                    </InlineStack>
                                                ),
                                                value: "true",
                                            },
                                        ]}
                                        selected={settingsState.showOutOfStockProducts ? ["true"] : []}
                                        onChange={(value) => {
                                            setSetttingsState((prevSettings: BundleSettings) => {
                                                return {
                                                    ...prevSettings,
                                                    showOutOfStockProducts: value[0] === "true",
                                                };
                                            });
                                        }}
                                    />
                                </Card>
                            </InlineGrid>
                            <BlockStack gap={GapBetweenSections}>
                                {/* Save action */}
                                <BlockStack inlineAlign="end">
                                    <Button variant="primary" submit>
                                        Save
                                    </Button>
                                </BlockStack>

                                <FooterHelp>
                                    This settings only apply to this bundle. Edit <Link to="/app/global-settings">global settings</Link> to apply changes to all bundles.
                                </FooterHelp>
                            </BlockStack>
                            {/*   <FooterHelp>
                                    You stuck? <Link to="/app/help">Get help</Link> from us, or <Link to="/app/feature-request">suggest new features</Link>.
                                </FooterHelp> */}
                        </BlockStack>
                    </Form>
                </Page>
            )}
        </>
    );
}
