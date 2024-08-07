import { redirect, useNavigation, useSubmit } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  Page,
  Card,
  Button,
  BlockStack,
  Layout,
  EmptyState,
  Banner,
  Box,
  MediaCard,
  VideoThumbnail,
  Divider,
  SkeletonPage,
  SkeletonBodyText,
  SkeletonDisplayText,
} from "@shopify/polaris";
import { PlusIcon, ExternalIcon } from "@shopify/polaris-icons";
import { authenticate, sessionStorage } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const user = await db.user.findFirst({
    where: {
      storeUrl: session.shop,
    },
  });

  if (!user) {
    const response = await admin.graphql(
      `#graphql
      query  {
        shop {
          name
          email
        }
      }`,
    );

    const data = await response.json();

    await prisma.user.create({
      data: {
        ownerName: "",
        storeUrl: session.shop,
        email: data.data.shop.email,
        storeName: data.data.shop.name,
      },
    });
  }

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const bundle = await prisma.bundle.create({
    data: {
      user: {
        connect: {
          storeUrl: session.shop,
        },
      },
      title: "New bundle",
      steps: {
        create: [
          {
            stepNumber: 1,
            title: `Title for step 1`,
            contentInputs: {
              create: [{}, {}],
            },
          },
          {
            stepNumber: 2,
            title: `Title for step 2`,
            contentInputs: {
              create: [{}, {}],
            },
          },
          {
            stepNumber: 3,
            title: `Title for step 3`,
            contentInputs: {
              create: [{}, {}],
            },
          },
        ],
      },
      bundleSettings: {
        create: {
          bundleColors: {
            create: {},
          },
          bundleLabels: {
            create: {},
          },
        },
      },
    },
  });

  return redirect(`/app/edit-bundle/${bundle.id}`);
};

export default function Index() {
  const nav = useNavigation();
  const isLoading = nav.state === "loading" || nav.state !== "idle";
  const submit = useSubmit();

  return (
    <>
      {isLoading ? (
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
            <Button
              icon={PlusIcon}
              variant="primary"
              onClick={() =>
                submit(
                  {},
                  {
                    method: "post",
                    navigate: false,
                  },
                )
              }
            >
              Create bundle
            </Button>
          }
          secondaryActions={
            <Button
              icon={ExternalIcon}
              variant="secondary"
              target="_blank"
              url="https://help.shopify.com"
            >
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
                      heading="Let’s create the first custom bundle for your customers!"
                      action={{
                        content: "Create bundle",
                        icon: PlusIcon,
                        onAction: () =>
                          submit(
                            {},
                            {
                              method: "post",
                              navigate: false,
                            },
                          ),
                      }}
                      fullWidth
                      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    >
                      <p>
                        Your customers will be able to use the custom bundles
                        you create to create and buy their own custom bundles.
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
                    url: "https://help.shopify.com",
                    target: "_blank",
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
