import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useParams,
  useNavigation,
  useNavigate,
  Form,
} from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useSubmitAction } from "~/hooks/useSubmitAction";
import { authenticate } from "../../shopify.server";
import db from "../../db.server";
import {
  Card,
  BlockStack,
  TextField,
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

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const bundleSettings: SettingsWithAllResources | null =
    await db.bundleSettings.findUnique({
      where: {
        id: Number(params.bundleid),
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
      "",
      bundleSettings,
    ),

    { status: 200 },
  );
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const formData = await request.formData();

  return null;
};

export default function Index() {
  const navigate = useNavigate();
  const nav = useNavigation();
  const shopify = useAppBridge();
  const isLoading: boolean = nav.state != "idle";
  const params = useParams();
  const submitAction = useSubmitAction(); //Function for doing the submit action where the only data is action and url

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

  if (!serverSettings.bundleColors || !serverSettings.bundleLabels)
    return <p>Settings don't exist for this bundle.</p>;

  // colors
  const colors = useMemo(() => {
    return [
      {
        hex: settingsState.bundleColors?.stepsIcon,
        label: "Steps icon color",
        id: "stepsIcon",
      },
      {
        hex: settingsState.bundleColors?.addToBundleBtn,
        label: '"Add to bundle" btn',
        id: "addToBundleBtn",
      },
      {
        hex: settingsState.bundleColors?.addToBundleText,
        label: '"Add to bundle" text',
        id: "addToBundleText",
      },
      {
        hex: settingsState.bundleColors?.nextStepBtn,
        label: '"Next step" btn',
        id: "nextStepBtn",
      },
      {
        hex: settingsState.bundleColors?.nextStepBtnText,
        label: '"Next step" btn text',
        id: "nextStepBtnText",
      },
      {
        hex: settingsState.bundleColors?.titleAndDESC,
        label: '"Title & description"',
        id: "titleAndDESC",
      },
      {
        hex: settingsState.bundleColors?.viewProductBtn,
        label: '"View products" btn',
        id: "viewProductsBtn",
      },
      {
        hex: settingsState.bundleColors?.removeProductsBtn,
        label: '"Remove" btn',
        id: "removeProductBtn",
      },
      {
        hex: settingsState.bundleColors?.prevStepBtn,
        label: '"Previous" btn',
        id: "prevStepBtn",
      },
      {
        hex: settingsState.bundleColors?.prevStepBtnText,
        label: '"Previous" btn text',
        id: "prevStepBtnText",
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
          title={`Bundle settings - ${serverSettings.id}`}
        >
          <Form method="POST" data-discard-confirmation data-save-bar>
            <input
              type="hidden"
              name="bundleSettings"
              value={JSON.stringify(setSetttingsState)}
            />
            <BlockStack gap={GapBetweenSections}>
              <Card>
                <BlockStack gap={GapBetweenSections}>
                  <Divider />
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
                  </BlockStack>
                  <Divider />
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
                  <Divider />
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
                    selected={settingsState.allowBackNavigation ? ["true"] : []}
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
                  <Divider />
                  <BlockStack gap={GapInsideSection}>
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
                  <Divider />

                  <Divider />
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
                </BlockStack>
                <Card>
                  <BlockStack gap={GapInsideSection}>
                    <Text as="p">Colors</Text>
                    <InlineGrid columns={2} gap={HorizontalGap}>
                      {colors.map(
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
                </Card>
              </Card>

              <Box width="full">
                <BlockStack inlineAlign="end">
                  <ButtonGroup>
                    <Button variant="primary" tone="critical">
                      Delete
                    </Button>
                    <Button variant="primary" submit>
                      Save
                    </Button>
                  </ButtonGroup>
                </BlockStack>
              </Box>
            </BlockStack>
          </Form>
        </Page>
      )}
    </>
  );
}
