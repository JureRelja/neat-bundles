import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Link,
  InlineStack,
  EmptyState,
  Banner,
  Box,
  MediaCard,
  VideoThumbnail,
  Divider,
  SkeletonPage,
  SkeletonBodyText,
  SkeletonThumbnail,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { PlusIcon, ExternalIcon, StarFilledIcon } from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

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
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const initialLoad = nav.state === "loading";
  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);
  const generateProduct = () => submit({}, { replace: true, method: "POST" });

  return (
    <>
      {initialLoad ? (
        <SkeletonPage primaryAction fullWidth>
          <BlockStack gap="500">
            <Layout>
              <Layout.Section>
                <BlockStack gap="500">
                  <Card padding="500">
                    <BlockStack gap="300">
                      <Divider borderColor="transparent" />
                      <EmptyState fullWidth image=""></EmptyState>
                      <SkeletonBodyText lines={3} />
                    </BlockStack>
                  </Card>
                  <Card>
                    <BlockStack gap="500">
                      <SkeletonBodyText lines={4} />
                    </BlockStack>
                  </Card>
                </BlockStack>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <Card>
                  <BlockStack gap="500">
                    <SkeletonBodyText lines={14} />

                    <SkeletonDisplayText size="medium" />
                  </BlockStack>
                </Card>
              </Layout.Section>
            </Layout>
          </BlockStack>
        </SkeletonPage>
      ) : (
        <Page
          fullWidth
          title="Dashboard"
          primaryAction={
            <Button icon={PlusIcon} variant="primary">
              Create builder
            </Button>
          }
          secondaryActions={
            <Button icon={ExternalIcon} variant="secondary">
              Watch tutorial
            </Button>
          }
        >
          <BlockStack gap="500">
            <Layout>
              <Layout.Section>
                <BlockStack gap="500">
                  <Card>
                    <EmptyState
                      heading="Let’s create the first builder for your customers!"
                      action={{ content: "Create builder", icon: PlusIcon }}
                      fullWidth
                      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    >
                      <p>
                        Your customers will be able to use the builders you
                        create to build custom bundles with your products.
                      </p>
                    </EmptyState>
                  </Card>
                  <Banner title="Enjoying the app?" onDismiss={() => {}}>
                    <BlockStack gap="200">
                      <Box>
                        <p>We'd highly appreciate getting a review!</p>
                      </Box>

                      <Box>
                        <Button>⭐ Leave a review</Button>
                      </Box>
                    </BlockStack>
                  </Banner>
                  <Divider />
                </BlockStack>
              </Layout.Section>
              <Layout.Section variant="oneThird">
                <MediaCard
                  portrait
                  title="Watch a short tutorial to get quickly started"
                  primaryAction={{
                    content: "Watch tutorial",
                    onAction: () => {},
                    icon: ExternalIcon,
                  }}
                  size="small"
                  description="We recommend watching this short tutorial to get started with creating Neat Bundle Builder"
                  popoverActions={[{ content: "Dismiss", onAction: () => {} }]}
                >
                  <VideoThumbnail
                    videoLength={80}
                    thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                    onClick={() => console.log("clicked")}
                  />
                </MediaCard>
              </Layout.Section>
            </Layout>
          </BlockStack>
        </Page>
      )}
    </>
  );
}
