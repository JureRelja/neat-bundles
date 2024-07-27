import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  TextField,
  Text,
  Box,
  Divider,
  SkeletonPage,
  ChoiceList,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { OrderDraftIcon, DeleteIcon } from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { useState } from "react";
import BundleStepComponent from "./routeComponents/bundleStep";
import { Bundle, defaultBundle, BundleType } from "./types/Bundle";
import { BundleStep, defaultBundleStep } from "./types/BundleStep";
import { GapBetweenSections, GapBetweenTitleAndContent } from "./constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const variantId =
    responseJson.data!.productCreate!.product!.variants.edges[0]!.node!.id!;
  const variantResponse = await admin.graphql(
    `#graphql
      mutation shopifyRemixTemplateUpdateVariant($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
          productVariant {
            id
            price
            barcode
            createdAt
          }
        }
      }`,
    {
      variables: {
        input: {
          id: variantId,
          price: Math.random() * 100,
        },
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return json({
    product: responseJson!.data!.productCreate!.product,
    variant: variantResponseJson!.data!.productVariantUpdate!.productVariant,
  });
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const shopify = useAppBridge();
  const isLoading = nav.state === "loading";

  //Bundle state
  const [bundle, setBundle] = useState<Bundle>(defaultBundle);

  //Function for adding the step if there are less than 5 steps total
  const addStep = (): void => {
    if (bundle.steps.length >= 5) {
      return;
    }
    setBundle((prevBundle: Bundle) => {
      const newStepId = bundle.steps.length + 1;
      const newStep: BundleStep = defaultBundleStep(newStepId);

      const updatedBundle: Bundle = {
        ...prevBundle,
        steps: [...prevBundle.steps, newStep],
      };
      return updatedBundle;
    });
  };

  //Function for updating the step with a new data from it's component
  const updateStepDate = (stepData: BundleStep) => {
    setBundle((prevBundle: Bundle) => {
      const index = prevBundle.steps.findIndex((step: BundleStep) => {
        return step.stepId === stepData.stepId;
      });
      prevBundle.steps[index] = stepData;

      return { ...prevBundle };
    });
  };

  return (
    <>
      {isLoading ? (
        <SkeletonPage primaryAction fullWidth></SkeletonPage>
      ) : (
        <Page
          fullWidth
          backAction={{ content: "Products", url: "/app" }}
          title="Create bundle"
          primaryAction={<Button variant="primary">Publish</Button>}
          secondaryActions={[
            {
              content: "Delete",
              destructive: true,
              icon: DeleteIcon,
              onAction: () => {},
            },
            {
              content: "Save as draft",
              destructive: false,
              icon: OrderDraftIcon,
              onAction: () => {},
            },
          ]}
        >
          <BlockStack gap={GapBetweenSections}>
            <Card>
              <BlockStack gap={GapBetweenTitleAndContent}>
                <Text as="h2" variant="headingSm">
                  Bundle title
                </Text>
                <TextField
                  label="Title"
                  autoComplete="off"
                  helpText="Only store staff can see this."
                  value={bundle.title}
                  onChange={(value) => {
                    setBundle((prevBundle: Bundle) => {
                      return { ...prevBundle, title: value };
                    });
                  }}
                  type="text"
                />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap={GapBetweenTitleAndContent}>
                <Text as="h2" variant="headingSm">
                  Bundle pricing
                </Text>
                <ChoiceList
                  title="Pricing"
                  choices={[
                    {
                      label: "Fixed price",
                      value: "fixed",
                      helpText: `All bundles created will be priced the same. 
(e.g. use case: you want to sell 5 cookies in a bundle at a same discount, but want your customers to be able to select which cookies they want)`,
                    },
                    {
                      label: "Calculated price ",
                      value: "calculated",
                      helpText: `Final price is calculated based on the products that customers selects. 
(e.g. use case: you want to sell shirt, pants, and a hat in a bundle with a 10% discount on whole order and you want the total price before discount to be a sum of the prices of 
individual products.)`,
                    },
                  ]}
                  selected={[bundle.type]}
                  onChange={(value) => {
                    setBundle((prevBundle: Bundle) => {
                      return {
                        ...prevBundle,
                        type: value[0] as BundleType,
                      };
                    });
                  }}
                />
              </BlockStack>
            </Card>

            <Layout>
              <Layout.Section variant="oneThird">
                <BlockStack gap={GapBetweenSections}>
                  {bundle.steps.map((step) => (
                    <BundleStepComponent
                      key={step.stepId}
                      stepData={step}
                      updateStepData={updateStepDate}
                    ></BundleStepComponent>
                  ))}
                </BlockStack>
              </Layout.Section>
              <Layout.Section>
                <Card>
                  <Text as="h2" variant="headingSm">
                    Add step
                  </Text>
                </Card>
              </Layout.Section>
            </Layout>
          </BlockStack>
        </Page>
      )}
    </>
  );
}
