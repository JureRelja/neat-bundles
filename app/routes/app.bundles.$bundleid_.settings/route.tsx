import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useNavigation, useNavigate, Form } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import db from '../../db.server';
import {
    Card,
    BlockStack,
    Text,
    RangeSlider,
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
} from '@shopify/polaris';
import { GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection } from '../../constants';
import { SettingsWithAllResources, settingsIncludeAll } from '../../adminBackend/service/dto/BundleSettings';
import { QuestionCircleIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { JsonData } from '~/adminBackend/service/dto/jsonData';
import { ApiCacheService } from '~/adminBackend/service/utils/ApiCacheService';
import { ApiCacheKeyService } from '~/adminBackend/service/utils/ApiCacheKeyService';
import { BundleSettings } from '@prisma/client';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await authenticate.admin(request);

    const bundleSettings: SettingsWithAllResources | null = await db.bundleSettings.findUnique({
        where: {
            bundleBuilderId: Number(params.bundleid),
        },
        include: settingsIncludeAll,
    });

    if (!bundleSettings) {
        throw new Response(null, {
            status: 404,
            statusText: 'Not Found',
        });
    }
    return json(
        new JsonData(true, 'success', 'Bundle settings succesfuly retrieved', [], bundleSettings),

        { status: 200 },
    );
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    const formData = await request.formData();

    const bundleSettings: SettingsWithAllResources = JSON.parse(formData.get('bundleSettings') as string);

    if (!bundleSettings || !bundleSettings.bundleColors || !bundleSettings.bundleLabels) {
        throw new Response(null, {
            status: 400,
            statusText: 'Bad Request',
        });
    }

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
                bundleColors: {
                    update: {
                        addToBundleBtn: bundleSettings.bundleColors.addToBundleBtn,
                        addToBundleText: bundleSettings.bundleColors.addToBundleText,
                        nextStepBtn: bundleSettings.bundleColors.nextStepBtn,
                        nextStepBtnText: bundleSettings.bundleColors.nextStepBtnText,
                        viewProductBtn: bundleSettings.bundleColors.viewProductBtn,
                        viewProductBtnText: bundleSettings.bundleColors.viewProductBtnText,
                        removeProductsBtn: bundleSettings.bundleColors.removeProductsBtn,
                        removeProductsBtnText: bundleSettings.bundleColors.removeProductsBtnText,
                        prevStepBtn: bundleSettings.bundleColors.prevStepBtn,
                        prevStepBtnText: bundleSettings.bundleColors.prevStepBtnText,
                        stepsIcon: bundleSettings.bundleColors.stepsIcon,
                        titleAndDESC: bundleSettings.bundleColors.titleAndDESC,
                    },
                },
                bundleLabels: {
                    update: {
                        addToBundleBtn: bundleSettings.bundleLabels.addToBundleBtn,
                        nextStepBtn: bundleSettings.bundleLabels.nextStepBtn,
                        viewProductBtn: bundleSettings.bundleLabels.viewProductBtn,
                        prevStepBtn: bundleSettings.bundleLabels.prevStepBtn,
                    },
                },
            },
        });

        if (!result) {
            throw new Error('Failed to update bundle settings');
        }

        // Clear the cache for the bundle
        const cacheKeyService = new ApiCacheKeyService(session.shop);

        await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string));

        const url: URL = new URL(request.url);

        // Redirect to a specific page if the query param is present
        if (url.searchParams.has('redirect')) {
            return redirect(url.searchParams.get('redirect') as string);
        }

        return redirect(`/app`);
    } catch (error) {
        console.error(error);
        throw new Response(null, {
            status: 404,
            statusText: 'Settings not found',
        });
    }
};

export default function Index() {
    const navigate = useNavigate();
    const nav = useNavigation();
    const shopify = useAppBridge();
    const isLoading: boolean = nav.state != 'idle';

    const serverSettings: SettingsWithAllResources = useLoaderData<typeof loader>().data;

    const [settingsState, setSetttingsState] = useState<SettingsWithAllResources>(serverSettings);

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
                    title={`Bundle settings | Bundle ID: ${serverSettings.bundleBuilderId}`}
                    subtitle="Edit settings only for this bundle."
                    backAction={{
                        content: 'Products',
                        onAction: async () => {
                            // Save or discard the changes before leaving the page
                            await shopify.saveBar.leaveConfirmation();
                            navigate(-1);
                        },
                    }}>
                    <Form method="POST" data-discard-confirmation data-save-bar>
                        <input type="hidden" name="bundleSettings" value={JSON.stringify(settingsState)} />

                        <BlockStack gap={'1200'}>
                            {/* Checkbox settings */}
                            <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
                                <Box as="section">
                                    <BlockStack gap="400">
                                        <Text as="h3" variant="headingMd">
                                            Pricing summary
                                        </Text>
                                        <Text as="p" variant="bodyMd">
                                            Pricing summary shows customers the pricing and discount of the bundle that they are creating.
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
                                        selected={settingsState.hidePricingSummary ? ['true'] : []}
                                        onChange={(value) => {
                                            setSetttingsState((prevSettings: SettingsWithAllResources) => {
                                                return {
                                                    ...prevSettings,
                                                    hidePricingSummary: value[0] === 'true',
                                                };
                                            });
                                        }}
                                    />
                                </Card>
                            </InlineGrid>

                            <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
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
                                                        <Text as={'p'}>Allow customers to go back on steps</Text>
                                                        <Tooltip
                                                            width="wide"
                                                            content="If this is not selected, customers won't be able to use the 'back' button to go back on steps.">
                                                            <Icon source={QuestionCircleIcon}></Icon>
                                                        </Tooltip>
                                                    </InlineStack>
                                                ),
                                                value: 'true',
                                            },
                                        ]}
                                        selected={settingsState.allowBackNavigation ? ['true'] : []}
                                        onChange={(value) => {
                                            setSetttingsState((prevSettings: SettingsWithAllResources) => {
                                                return {
                                                    ...prevSettings,
                                                    allowBackNavigation: value[0] === 'true',
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
                                                        <Text as={'p'}>Skip the cart and go to checkout directly</Text>
                                                        <Tooltip
                                                            width="wide"
                                                            content="Without this option selected, all the customer will be redirected to cart page after the finish building their bundle.">
                                                            <Icon source={QuestionCircleIcon}></Icon>
                                                        </Tooltip>
                                                    </InlineStack>
                                                ),
                                                value: 'true',
                                            },
                                        ]}
                                        selected={settingsState.skipTheCart ? ['true'] : []}
                                        onChange={(value) => {
                                            setSetttingsState((prevSettings: SettingsWithAllResources) => {
                                                return {
                                                    ...prevSettings,
                                                    skipTheCart: value[0] === 'true',
                                                };
                                            });
                                        }}
                                    />
                                </Card>
                            </InlineGrid>

                            <InlineGrid columns={{ xs: '1fr', md: '2fr 5fr' }} gap="400">
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
                                                        <Text as={'p'}>Show “out of stock” and unavailable products</Text>
                                                        <Tooltip
                                                            width="wide"
                                                            content="By default, only products that have at least one variant that's in stock at the time of purchase will be displayed. If this is selected, all 'out of stock' products will be visible, but customers won't be able to add the to their bundles.">
                                                            <Icon source={QuestionCircleIcon}></Icon>
                                                        </Tooltip>
                                                    </InlineStack>
                                                ),
                                                value: 'true',
                                            },
                                        ]}
                                        selected={settingsState.showOutOfStockProducts ? ['true'] : []}
                                        onChange={(value) => {
                                            setSetttingsState((prevSettings: SettingsWithAllResources) => {
                                                return {
                                                    ...prevSettings,
                                                    showOutOfStockProducts: value[0] === 'true',
                                                };
                                            });
                                        }}
                                    />
                                </Card>
                            </InlineGrid>

                            {/* <Divider borderColor="transparent" /> */}

                            {/* Labels settings, commented for now */}
                            {/* <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                <Box as="section">
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                      Dimensions
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Interjambs are the rounded protruding bits of your puzzlie
                      piece
                    </Text>
                  </BlockStack>
                </Box>
                <Card>
                  <BlockStack gap={GapInsideSection}>
                    <Text as="p">Labels</Text>
                    <InlineGrid columns={2} gap={HorizontalGap}>
                      <BlockStack gap={GapInsideSection} inlineAlign="start">
                        <TextField
                          label='"Add to bundle" btn label'
                          name={`addToBundleBtn`}
                          value={settingsState.bundleLabels?.addToBundleBtn}
                          autoComplete="off"
                          onChange={(newLabel: string) => {
                            setSetttingsState(
                              (prevSettings: SettingsWithAllResources) => {
                                if (!prevSettings.bundleLabels)
                                  return prevSettings;

                                return {
                                  ...prevSettings,
                                  bundleLabels: {
                                    ...prevSettings.bundleLabels,
                                    addToBundleBtn: newLabel,
                                  },
                                };
                              },
                            );
                          }}
                        />
                        <TextField
                          label='"Next" button label'
                          name={`nextStepBtn`}
                          value={settingsState.bundleLabels?.nextStepBtn}
                          type="text"
                          autoComplete="off"
                          onChange={(newLabel: string) => {
                            setSetttingsState(
                              (prevSettings: SettingsWithAllResources) => {
                                if (!prevSettings.bundleLabels)
                                  return prevSettings;

                                return {
                                  ...prevSettings,
                                  bundleLabels: {
                                    ...prevSettings.bundleLabels,
                                    addToBundleBtn: newLabel,
                                  },
                                };
                              },
                            );
                          }}
                        />
                      </BlockStack>
                      <BlockStack gap={GapInsideSection}>
                        <TextField
                          label='"View product" btn label'
                          name={`viewProductBtn`}
                          value={settingsState.bundleLabels?.viewProductBtn}
                          type="text"
                          autoComplete="off"
                          onChange={(newLabel: string) => {
                            setSetttingsState(
                              (prevSettings: SettingsWithAllResources) => {
                                if (!prevSettings.bundleLabels)
                                  return prevSettings;

                                return {
                                  ...prevSettings,
                                  bundleLabels: {
                                    ...prevSettings.bundleLabels,
                                    addToBundleBtn: newLabel,
                                  },
                                };
                              },
                            );
                          }}
                        />
                        <TextField
                          label='"Previous" button label'
                          value={settingsState.bundleLabels?.prevStepBtn}
                          type="text"
                          name={`prevStepBtn`}
                          autoComplete="off"
                          onChange={(newLabel: string) => {
                            setSetttingsState(
                              (prevSettings: SettingsWithAllResources) => {
                                if (!prevSettings.bundleLabels)
                                  return prevSettings;

                                return {
                                  ...prevSettings,
                                  bundleLabels: {
                                    ...prevSettings.bundleLabels,
                                    addToBundleBtn: newLabel,
                                  },
                                };
                              },
                            );
                          }}
                        />
                      </BlockStack>
                    </InlineGrid>
                  </BlockStack>
                </Card>
              </InlineGrid> */}

                            {/* Save action */}
                            <BlockStack inlineAlign="end">
                                <Button variant="primary" submit>
                                    Save
                                </Button>
                            </BlockStack>

                            <Divider borderColor="transparent" />
                        </BlockStack>
                    </Form>
                </Page>
            )}
        </>
    );
}
