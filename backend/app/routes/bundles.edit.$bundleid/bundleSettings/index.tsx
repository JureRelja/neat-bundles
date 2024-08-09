import {
  Card,
  BlockStack,
  TextField,
  Text,
  Select,
  RangeSlider,
  Divider,
  InlineGrid,
  ChoiceList,
} from "@shopify/polaris";
import {
  GapBetweenSections,
  GapInsideSection,
  HorizontalGap,
} from "../../../constants";
import { BundleSettingsWithAllResources } from "../../../types/BundleSettings";
import ColorPicker from "./color-picker";
import { BundlePricing, BundleDiscountType } from "@prisma/client";
import { useMemo } from "react";

export default function Index({
  bundleSettings,
  updateSettings,
}: {
  bundleSettings: BundleSettingsWithAllResources;
  updateSettings: (newSettings: BundleSettingsWithAllResources) => void;
}) {
  //Left column colors
  const colorsLeft = useMemo(() => {
    return [
      {
        hex: bundleSettings.bundleColors.stepsIcon,
        label: "Steps icon color",
        id: "stepsIcon",
      },
      {
        hex: bundleSettings.bundleColors.addToBundleBtn,
        label: '"Add to bundle" btn',
        id: "addToBundleBtn",
      },
      {
        hex: bundleSettings.bundleColors.addToBundleText,
        label: '"Add to bundle" text',
        id: "addToBundleText",
      },
      {
        hex: bundleSettings.bundleColors.nextStepBtn,
        label: '"Next step" btn',
        id: "nextStepBtn",
      },
      {
        hex: bundleSettings.bundleColors.nextStepBtnText,
        label: '"Next step" btn text',
        id: "nextStepBtnText",
      },
      {
        hex: bundleSettings.bundleColors.titleAndDESC,
        label: '"Title & description"',
        id: "titleAndDESC",
      },
      {
        hex: bundleSettings.bundleColors.viewProductBtn,
        label: '"View products" btn',
        id: "viewProductsBtn",
      },
      {
        hex: bundleSettings.bundleColors.removeProductsBtn,
        label: '"Remove" btn',
        id: "removeProductBtn",
      },
      {
        hex: bundleSettings.bundleColors.prevStepBtn,
        label: '"Previous" btn',
        id: "prevStepBtn",
      },
      {
        hex: bundleSettings.bundleColors.prevStepBtnText,
        label: '"Previous" btn text',
        id: "prevStepBtnText",
      },
    ];
  }, [bundleSettings.bundleColors]);

  const updateColor = (newHexColor: string, colorId: string) => {
    updateSettings({
      ...bundleSettings,
      bundleColors: {
        ...bundleSettings.bundleColors,
        [colorId]: newHexColor,
      },
    });
  };

  return (
    <Card>
      <BlockStack gap={GapBetweenSections}>
        <Text as="h2" variant="headingMd">
          Bundle Settings
        </Text>
        <ChoiceList
          title="Bundle Pricing"
          name={`bundlePricing-${bundleSettings.id}`}
          choices={[
            {
              label: "Fixed price",
              value: BundlePricing.FIXED,
              helpText: `All bundles created will be priced the same. 
(e.g. use case: you want to sell 5 cookies in a bundle at a same discount, but want your customers to be able to select which cookies they want)`,
            },
            {
              label: "Calculated price ",
              value: BundlePricing.CALCULATED,
              helpText: `Final price is calculated based on the products that customers selects. 
(e.g. use case: you want to sell shirt, pants, and a hat in a bundle with a 10% discount on whole order and you want the total price before discount to be a sum of the prices of 
individual products.)`,
            },
          ]}
          selected={[bundleSettings.pricing]}
          onChange={(value) => {
            updateSettings({
              ...bundleSettings,
              pricing: value[0] as BundlePricing,
            });
          }}
        />
        <Divider />
        <BlockStack gap={GapInsideSection}>
          <InlineGrid columns={["twoThirds", "oneThird"]} gap={HorizontalGap}>
            <Select
              label="Discount type"
              name={`discountType-${bundleSettings.id}`}
              options={[
                {
                  label: "Percentage (e.g. 25% off)",
                  value: BundleDiscountType.PERCENTAGE,
                },
                {
                  label: "Fixed (e.g. 10$ off)",
                  value: BundleDiscountType.FIXED,
                },

                {
                  label: "No discount",
                  value: BundleDiscountType.NO_DISCOUNT,
                },
              ]}
              value={bundleSettings.discountType}
              onChange={(newValue) => {
                updateSettings({
                  ...bundleSettings,
                  discountType: newValue as BundleDiscountType,
                  discountValue: 0,
                });
              }}
            />

            <TextField
              label="Amount"
              type="number"
              autoComplete="off"
              inputMode="numeric"
              disabled={
                bundleSettings.discountType === BundleDiscountType.NO_DISCOUNT
              }
              name={`discountValue-${bundleSettings.id}`}
              suffix={
                bundleSettings.discountType === BundleDiscountType.PERCENTAGE
                  ? "%"
                  : "$"
              }
              min={0}
              max={"100"}
              value={bundleSettings.discountValue.toString()}
              onChange={(value) => {
                updateSettings({
                  ...bundleSettings,
                  discountValue: parseInt(value),
                });
              }}
            />
          </InlineGrid>
          <ChoiceList
            title="Discount banner"
            allowMultiple
            name={`displayDiscountBanner-${bundleSettings.id}`}
            choices={[
              {
                label: "Display a discount banner through the order",
                value: "true",
              },
            ]}
            disabled={
              bundleSettings.discountType === BundleDiscountType.NO_DISCOUNT
            }
            selected={bundleSettings.displayDiscountBanner ? ["true"] : []}
            onChange={(value) => {
              updateSettings({
                ...bundleSettings,
                displayDiscountBanner: value[0] === "true",
              });
            }}
          />
        </BlockStack>
        <Divider />
        <ChoiceList
          title="Cart"
          allowMultiple
          name={`skipTheCart-${bundleSettings.id}`}
          choices={[
            {
              label: "Skip the cart and go to checkout directly",
              value: "true",
            },
          ]}
          selected={bundleSettings.skipTheCart ? ["true"] : []}
          onChange={(value) => {
            updateSettings({
              ...bundleSettings,
              skipTheCart: value[0] === "true",
            });
          }}
        />
        <Divider />
        <ChoiceList
          title="Navigation"
          name={`allowBackNavigation-${bundleSettings.id}`}
          allowMultiple
          choices={[
            {
              label: "Allow customers to go back on steps",
              value: "true",
            },
          ]}
          selected={bundleSettings.allowBackNavigation ? ["true"] : []}
          onChange={(value) => {
            updateSettings({
              ...bundleSettings,
              allowBackNavigation: value[0] === "true",
            });
          }}
        />
        <Divider />
        <BlockStack gap={GapInsideSection}>
          <ChoiceList
            title="Navigation"
            allowMultiple
            name={`showOutOfStockProducts-${bundleSettings.id}`}
            choices={[
              {
                label: "Show “out of stock” and unavailable products",
                value: "true",
              },
            ]}
            selected={bundleSettings.showOutOfStockProducts ? ["true"] : []}
            onChange={(value) => {
              updateSettings({
                ...bundleSettings,
                showOutOfStockProducts: value[0] === "true",
              });
            }}
          />

          <RangeSlider
            label={`Number of product columns`}
            output
            value={bundleSettings.numOfProductColumns}
            onChange={(newValue) => {
              updateSettings({
                ...bundleSettings,
                numOfProductColumns: newValue as number,
              });
            }}
            min={1}
            max={5}
            step={1}
            helpText="On smaller screens products will be shown in fewer columns."
          />
        </BlockStack>
        <Divider />
        <BlockStack gap={GapInsideSection}>
          <Text as="p">Colors</Text>
          <InlineGrid columns={2} gap={HorizontalGap}>
            {colorsLeft.map(
              (color: { hex: string; label: string; id: string }) => (
                <ColorPicker
                  key={color.id}
                  label={color.label}
                  color={color.hex} //Hex color code
                  colorId={color.id}
                  updateColor={updateColor}
                />
              ),
            )}
          </InlineGrid>
        </BlockStack>
        <Divider />
        <BlockStack gap={GapInsideSection}>
          <Text as="p">Labels</Text>
          <InlineGrid columns={2} gap={HorizontalGap}>
            <BlockStack gap={GapInsideSection} inlineAlign="start">
              <TextField
                label='"Add to bundle" btn label'
                name={`addToBundleBtn-${bundleSettings.id}`}
                value={bundleSettings.bundleLabels.addToBundleBtn}
                autoComplete="off"
                onChange={(newValue: string) => {
                  updateSettings({
                    ...bundleSettings,
                    bundleLabels: {
                      ...bundleSettings.bundleLabels,
                      addToBundleBtn: newValue,
                    },
                  });
                }}
              />
              <TextField
                label='"Next" button label'
                name={`nextStepBtn-${bundleSettings.id}`}
                value={bundleSettings.bundleLabels.nextStepBtn}
                type="text"
                autoComplete="off"
                onChange={(newValue: string) => {
                  updateSettings({
                    ...bundleSettings,
                    bundleLabels: {
                      ...bundleSettings.bundleLabels,
                      nextStepBtn: newValue,
                    },
                  });
                }}
              />
            </BlockStack>
            <BlockStack gap={GapInsideSection}>
              <TextField
                label='"View product" btn label'
                name={`viewProductBtn-${bundleSettings.id}`}
                value={bundleSettings.bundleLabels.viewProductBtn}
                type="text"
                autoComplete="off"
                onChange={(newValue: string) => {
                  updateSettings({
                    ...bundleSettings,
                    bundleLabels: {
                      ...bundleSettings.bundleLabels,
                      viewProductBtn: newValue,
                    },
                  });
                }}
              />
              <TextField
                label='"Previous" button label'
                value={bundleSettings.bundleLabels.prevStepBtn}
                type="text"
                name={`prevStepBtn-${bundleSettings.id}`}
                autoComplete="off"
                onChange={(newValue: string) => {
                  updateSettings({
                    ...bundleSettings,
                    bundleLabels: {
                      ...bundleSettings.bundleLabels,
                      prevStepBtn: newValue,
                    },
                  });
                }}
              />
            </BlockStack>
          </InlineGrid>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
