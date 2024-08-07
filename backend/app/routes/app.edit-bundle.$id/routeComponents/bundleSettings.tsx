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
} from "../constants";
import {
  BundleSettingsDiscountType,
  BundleSettings,
  BundlePricing,
} from "../types/BundleSettings";
import ColorPickerPopover from "./color-picker";
import db from "../../../db.server";
import { authenticate } from "../../../shopify.server";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
};

export default function Index({}: {}) {
  //Left column colors
  const colorsLeft = [
    {
      hex: bundleSettings.colors.stepsIcon,
      label: "Steps icon color",
      id: "stepsIcon",
    },
    {
      hex: bundleSettings.colors.addToBundleBtn,
      label: '"Add to bundle" btn',
      id: "addToBundleBtn",
    },
    {
      hex: bundleSettings.colors.addToBundleText,
      label: '"Add to bundle" text',
      id: "addToBundleText",
    },
    {
      hex: bundleSettings.colors.nextStepBtn,
      label: '"Next step" btn',
      id: "nextStepBtn",
    },
    {
      hex: bundleSettings.colors.nextStepBtnText,
      label: '"Next step" btn text',
      id: "nextStepBtnText",
    },
  ];
  //Right column colors
  const colorsRight = [
    {
      hex: bundleSettings.colors.titleAndDESC,
      label: '"Title & description"',
      id: "titleAndDESC",
    },
    {
      hex: bundleSettings.colors.viewProductsBtn,
      label: '"View products" btn',
      id: "viewProductsBtn",
    },
    {
      hex: bundleSettings.colors.removeProductBtn,
      label: '"Remove" btn',
      id: "removeProductBtn",
    },
    {
      hex: bundleSettings.colors.prevStepBtn,
      label: '"Previous" btn',
      id: "prevStepBtn",
    },
    {
      hex: bundleSettings.colors.prevStepBtnText,
      label: '"Previous" btn text',
      id: "prevStepBtnText",
    },
  ];

  const updateColor = (newHexColor: string, colorId: string) => {
    updateSettings({
      ...bundleSettings,
      colors: {
        ...bundleSettings.colors,
        [colorId]: newHexColor,
      },
    });
  };

  return (
    <Card>
      <BlockStack gap={GapBetweenSections}>
        <Text as="h2" variant="headingLg">
          Bundle Settings
        </Text>
        <ChoiceList
          title="Bundle Pricing"
          name="bundlePricing"
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
          selected={[bundleSettings.bundlePricing]}
          onChange={(value) => {
            updateSettings({
              ...bundleSettings,
              bundlePricing: value[0] as BundlePricing,
            });
          }}
        />
        <Divider />
        <BlockStack gap={GapInsideSection}>
          <InlineGrid columns={["twoThirds", "oneThird"]} gap={HorizontalGap}>
            <Select
              label="Discount type"
              name="discountType"
              options={[
                {
                  label: "Percentage (e.g. 25% off)",
                  value: BundleSettingsDiscountType.PERCENTAGE,
                },
                {
                  label: "Fixed (e.g. 10$ off)",
                  value: BundleSettingsDiscountType.FIXED,
                },

                {
                  label: "No discount",
                  value: BundleSettingsDiscountType.NO_DISCOUNT,
                },
              ]}
              value={bundleSettings.discountType}
              onChange={(newValue) => {
                updateSettings({
                  ...bundleSettings,
                  discountType: newValue as BundleSettingsDiscountType,
                });
              }}
            />

            <TextField
              label="Amount"
              type="number"
              autoComplete="off"
              inputMode="numeric"
              name="discountValue"
              suffix="%"
              min={0}
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
            name="displayDiscountBanner"
            choices={[
              {
                label: "Display a discount banner through the order",
                value: "true",
              },
            ]}
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
          name="skipTheCart"
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
          name="allowBackNavigation"
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
            name="showOutOfStockProducts"
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
            <BlockStack gap={GapInsideSection} inlineAlign="start">
              {colorsLeft.map((color) => (
                <ColorPickerPopover
                  key={color.label}
                  color={color.hex}
                  label={color.label}
                  updateColor={updateColor}
                  colorId={color.id}
                />
              ))}
            </BlockStack>
            <BlockStack gap={GapInsideSection}>
              {colorsRight.map((color) => (
                <ColorPickerPopover
                  key={color.label}
                  color={color.hex}
                  label={color.label}
                  updateColor={updateColor}
                  colorId={color.id}
                />
              ))}
            </BlockStack>
          </InlineGrid>
        </BlockStack>
        <Divider />
        <BlockStack gap={GapInsideSection}>
          <Text as="p">Labels</Text>
          <InlineGrid columns={2} gap={HorizontalGap}>
            <BlockStack gap={GapInsideSection} inlineAlign="start">
              <TextField
                label='"Add to bundle" btn label'
                name="addToBundleBtn"
                value={bundleSettings.labels.addToBundleBtn}
                autoComplete="off"
                onChange={(newValue) => {
                  updateSettings({
                    ...bundleSettings,
                    labels: {
                      ...bundleSettings.labels,
                      addToBundleBtn: newValue,
                    },
                  });
                }}
              />
              <TextField
                label='"Next" button label'
                name="nextStepBtn"
                value={bundleSettings.labels.nextStepBtn}
                type="text"
                autoComplete="off"
                onChange={(newValue) => {
                  updateSettings({
                    ...bundleSettings,
                    labels: {
                      ...bundleSettings.labels,
                      nextStepBtn: newValue,
                    },
                  });
                }}
              />
            </BlockStack>
            <BlockStack gap={GapInsideSection}>
              <TextField
                label='"View product" btn label'
                name="viewProductsBtn"
                value={bundleSettings.labels.viewProductsBtn}
                type="text"
                autoComplete="off"
                onChange={(newValue) => {
                  updateSettings({
                    ...bundleSettings,
                    labels: {
                      ...bundleSettings.labels,
                      viewProductsBtn: newValue,
                    },
                  });
                }}
              />
              <TextField
                label='"Previous" button label'
                value={bundleSettings.labels.prevBtn}
                type="text"
                name="prevBtn"
                autoComplete="off"
                onChange={(newValue) => {
                  updateSettings({
                    ...bundleSettings,
                    labels: {
                      ...bundleSettings.labels,
                      prevBtn: newValue,
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
