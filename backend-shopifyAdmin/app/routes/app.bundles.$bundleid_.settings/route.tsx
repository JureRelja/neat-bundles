import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useNavigate,
  Form,
} from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import db from "../../db.server";
import {
  Card,
  BlockStack,
  Text,
  RangeSlider,
  Divider,
  InlineGrid,
  ChoiceList,
  Page,
  ButtonGroup,
  Button,
  Box,
  SkeletonPage,
} from "@shopify/polaris";
import {
  GapBetweenSections,
  GapBetweenTitleAndContent,
  GapInsideSection,
  HorizontalGap,
} from "../../constants";
import {
  SettingsWithAllResources,
  settingsIncludeAll,
} from "../../types/BundleSettings";
import ColorPicker from "./color-picker";
import { useMemo, useState } from "react";
import { JsonData } from "~/types/jsonData";
import { RangeSliderValue } from "@shopify/polaris/build/ts/src/components/RangeSlider/types";
import { ApiCacheService } from "~/utils/ApiCacheService";
import { ApiCacheKeyService } from "~/utils/ApiCacheKeyService";
import { BundleSettings } from "@prisma/client";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const bundleSettings: SettingsWithAllResources | null =
    await db.bundleSettings.findUnique({
      where: {
        bundleId: Number(params.bundleid),
      },
      include: settingsIncludeAll,
    });

  if (!bundleSettings) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return json(
    new JsonData(
      true,
      "success",
      "Bundle settings succesfuly retrieved",
      [],
      bundleSettings,
    ),

    { status: 200 },
  );
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();

  const bundleSettings: SettingsWithAllResources = JSON.parse(
    formData.get("bundleSettings") as string,
  );

  if (
    !bundleSettings ||
    !bundleSettings.bundleColors ||
    !bundleSettings.bundleLabels
  ) {
    throw new Response(null, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  try {
    const result: BundleSettings | null = await db.bundleSettings.update({
      where: {
        bundleId: Number(params.bundleid),
      },
      data: {
        displayDiscountBanner: bundleSettings.displayDiscountBanner,
        skipTheCart: bundleSettings.skipTheCart,
        allowBackNavigation: bundleSettings.allowBackNavigation,
        showOutOfStockProducts: bundleSettings.showOutOfStockProducts,
        numOfProductColumns: bundleSettings.numOfProductColumns,
        bundleColors: {
          update: {
            addToBundleBtn: bundleSettings.bundleColors.addToBundleBtn,
            addToBundleText: bundleSettings.bundleColors.addToBundleText,
            nextStepBtn: bundleSettings.bundleColors.nextStepBtn,
            nextStepBtnText: bundleSettings.bundleColors.nextStepBtnText,
            viewProductBtn: bundleSettings.bundleColors.viewProductBtn,
            viewProductBtnText: bundleSettings.bundleColors.viewProductBtnText,
            removeProductsBtn: bundleSettings.bundleColors.removeProductsBtn,
            removeProductsBtnText:
              bundleSettings.bundleColors.removeProductsBtnText,
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
      throw new Error("Failed to update bundle settings");
    }

    // Clear the cache for the bundle
    const cacheKeyService = new ApiCacheKeyService(session.shop);

    await ApiCacheService.singleKeyDelete(
      cacheKeyService.getBundleSettingsKey(params.bundleid as string),
    );

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

  const serverSettings: SettingsWithAllResources =
    useLoaderData<typeof loader>().data;

  const [settingsState, setSetttingsState] =
    useState<SettingsWithAllResources>(serverSettings);

  const updateColor = (newHexColor: string, colorId: string) => {
    setSetttingsState((prevSettings: SettingsWithAllResources) => {
      if (!prevSettings.bundleColors) return prevSettings;
      return {
        ...prevSettings,
        bundleColors: {
          ...prevSettings.bundleColors,
          [colorId]: newHexColor,
        },
      };
    });
  };

  // Button collors
  const buttonColors = useMemo(() => {
    return [
      {
        hex: settingsState.bundleColors?.addToBundleBtn,
        label: '"Add to bundle" button background',
        id: "addToBundleBtn",
      },
      {
        hex: settingsState.bundleColors?.addToBundleText,
        label: '"Add to bundle" button text',
        id: "addToBundleText",
      },
      {
        hex: settingsState.bundleColors?.viewProductBtn,
        label: '"View products" button background',
        id: "viewProductsBtn",
      },
      {
        hex: settingsState.bundleColors?.viewProductBtnText,
        label: '"View products" button text',
        id: "viewProductsBtnText",
      },
      {
        hex: settingsState.bundleColors?.removeProductsBtn,
        label: '"Remove" button background',
        id: "removeProductBtn",
      },
      {
        hex: settingsState.bundleColors?.removeProductsBtnText,
        label: '"Remove" button text',
        id: "removeProductBtn",
      },
      {
        hex: settingsState.bundleColors?.prevStepBtn,
        label: '"Previous step" button background',
        id: "prevStepBtn",
      },
      {
        hex: settingsState.bundleColors?.prevStepBtnText,
        label: '"Previous step" button text',
        id: "prevStepBtnText",
      },
      {
        hex: settingsState.bundleColors?.nextStepBtn,
        label: '"Next step" button background',
        id: "nextStepBtn",
      },
      {
        hex: settingsState.bundleColors?.nextStepBtnText,
        label: '"Next step" button text',
        id: "nextStepBtnText",
      },
    ];
  }, [settingsState.bundleColors]);

  // Button collors
  const bundleColos = useMemo(() => {
    return [
      {
        hex: settingsState.bundleColors?.stepsIcon,
        label: "Steps icon color",
        id: "stepsIcon",
      },
      {
        hex: settingsState.bundleColors?.titleAndDESC,
        label: '"Title & description"',
        id: "titleAndDESC",
      },
    ];
  }, [settingsState.bundleColors]);

  return (
    <>
      {isLoading ? (
        <SkeletonPage primaryAction fullWidth></SkeletonPage>
      ) : (
        // Bundle settings page
        <Page
          backAction={{
            content: "Products",
            onAction: async () => {
              // Save or discard the changes before leaving the page
              await shopify.saveBar.leaveConfirmation();
              navigate(-1);
            },
          }}
          title={`Bundle settings`}
        >
          <Form method="POST" data-discard-confirmation data-save-bar>
            <input
              type="hidden"
              name="bundleSettings"
              value={JSON.stringify(settingsState)}
            />

            <BlockStack gap={GapBetweenSections}>
              {/* Checkbox settings */}
              <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                <Box as="section">
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                      Bundle behavior
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Change the behavior of this bundle.
                    </Text>
                  </BlockStack>
                </Box>
                <Card>
                  <BlockStack gap={GapInsideSection}>
                    <ChoiceList
                      title="Discount banner"
                      allowMultiple
                      name={`displayDiscountBanner`}
                      choices={[
                        {
                          label: "Display a discount banner through the order",
                          value: "true",
                        },
                      ]}
                      selected={
                        settingsState.displayDiscountBanner ? ["true"] : []
                      }
                      onChange={(value) => {
                        setSetttingsState(
                          (prevSettings: SettingsWithAllResources) => {
                            return {
                              ...prevSettings,
                              displayDiscountBanner: value[0] === "true",
                            };
                          },
                        );
                      }}
                    />
                    <ChoiceList
                      title="Cart"
                      allowMultiple
                      name={`skipTheCart`}
                      choices={[
                        {
                          label: "Skip the cart and go to checkout directly",
                          value: "true",
                        },
                      ]}
                      selected={settingsState.skipTheCart ? ["true"] : []}
                      onChange={(value) => {
                        setSetttingsState(
                          (prevSettings: SettingsWithAllResources) => {
                            return {
                              ...prevSettings,
                              skipTheCart: value[0] === "true",
                            };
                          },
                        );
                      }}
                    />
                    <ChoiceList
                      title="Navigation"
                      name={`allowBackNavigation`}
                      allowMultiple
                      choices={[
                        {
                          label: "Allow customers to go back on steps",
                          value: "true",
                        },
                      ]}
                      selected={
                        settingsState.allowBackNavigation ? ["true"] : []
                      }
                      onChange={(value) => {
                        setSetttingsState(
                          (prevSettings: SettingsWithAllResources) => {
                            return {
                              ...prevSettings,
                              allowBackNavigation: value[0] === "true",
                            };
                          },
                        );
                      }}
                    />
                    <ChoiceList
                      title="Navigation"
                      allowMultiple
                      name={`showOutOfStockProducts`}
                      choices={[
                        {
                          label: "Show “out of stock” and unavailable products",
                          value: "true",
                        },
                      ]}
                      selected={
                        settingsState.showOutOfStockProducts ? ["true"] : []
                      }
                      onChange={(value) => {
                        setSetttingsState(
                          (prevSettings: SettingsWithAllResources) => {
                            return {
                              ...prevSettings,
                              showOutOfStockProducts: value[0] === "true",
                            };
                          },
                        );
                      }}
                    />
                    <RangeSlider
                      label={`Number of product columns`}
                      output
                      value={settingsState.numOfProductColumns}
                      onChange={(newValue: RangeSliderValue) => {
                        setSetttingsState(
                          (prevSettings: SettingsWithAllResources) => {
                            return {
                              ...prevSettings,
                              numOfProductColumns: newValue as number,
                            };
                          },
                        );
                      }}
                      min={1}
                      max={5}
                      step={1}
                      helpText="On smaller screens products will be shown in fewer columns."
                    />
                  </BlockStack>
                </Card>
              </InlineGrid>

              <Divider />

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

              <Divider />

              {/* Colors settings */}
              <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
                <Box as="section">
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                      Bundle colors
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Change the colors of all the elements that appear in the
                      bundle to match your store's theme.
                    </Text>
                  </BlockStack>
                </Box>
                <Card>
                  <BlockStack gap={GapInsideSection}>
                    <BlockStack gap={GapBetweenTitleAndContent}>
                      <Text as="p">Buttons</Text>
                      <InlineGrid columns={2} gap={HorizontalGap}>
                        {buttonColors.map(
                          (color: {
                            hex: string | undefined;
                            label: string;
                            id: string;
                          }) => (
                            <ColorPicker
                              key={color.id}
                              label={color.label}
                              color={color.hex as string} //Hex color code
                              colorId={color.id}
                              updateColor={updateColor}
                            />
                          ),
                        )}
                      </InlineGrid>
                    </BlockStack>
                    <BlockStack gap={GapBetweenTitleAndContent}>
                      <Text as="p">Bundle colors</Text>
                      <InlineGrid columns={2} gap={HorizontalGap}>
                        {bundleColos.map(
                          (color: {
                            hex: string | undefined;
                            label: string;
                            id: string;
                          }) => (
                            <ColorPicker
                              key={color.id}
                              label={color.label}
                              color={color.hex as string} //Hex color code
                              colorId={color.id}
                              updateColor={updateColor}
                            />
                          ),
                        )}
                      </InlineGrid>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </InlineGrid>

              <Divider borderColor="transparent" />

              {/* Save action */}
              <BlockStack inlineAlign="end">
                <Button variant="primary" submit>
                  Save settings
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
