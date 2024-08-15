import { useNavigation, json, useLoaderData, Link } from "@remix-run/react";
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
  DataTable,
  Text,
  ButtonGroup,
  Badge,
} from "@shopify/polaris";
import {
  PlusIcon,
  ExternalIcon,
  EditIcon,
  DeleteIcon,
  PageAddIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../../shopify.server";
import db from "../../db.server";
import { Bundle, User } from "@prisma/client";
import {
  BundleBasic,
  BundleAndStepsBasicServer,
  BundleAndStepsBasicClient,
  bundleAndSteps,
} from "../../types/Bundle";
import { JsonData } from "../../types/jsonData";
import { useSubmitAction } from "../../hooks/useSubmitAction";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  const user: User | null = await db.user.findUnique({
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

  const bundles: BundleAndStepsBasicServer[] = await prisma.bundle.findMany({
    where: {
      user: {
        storeUrl: session.shop,
      },
    },
    select: bundleAndSteps,
    orderBy: {
      createdAt: "desc",
    },
  });

  return json(
    {
      ...new JsonData(
        true,
        "success",
        "Bundles were succesfully returned",
        "",
        bundles,
      ),
    },
    { status: 200 },
  );
};

export default function Index() {
  const nav = useNavigation();
  const isLoading = nav.state !== "idle";
  const submitAction = useSubmitAction(); //Function for doing the submit action where the only data is action and url

  const loaderResponse: JsonData<BundleAndStepsBasicClient[]> =
    useLoaderData<typeof loader>();

  const bundles: BundleAndStepsBasicClient[] = loaderResponse.data;

  return (
    <>
      {isLoading ? (
        <SkeletonPage primaryAction fullWidth>
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
          </BlockStack>
        </SkeletonPage>
      ) : (
        <Page
          title="Bundles"
          primaryAction={
            <Button
              icon={PlusIcon}
              variant="primary"
              onClick={() => {
                submitAction("createBundle", true, "/app/bundles");
              }}
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
            <Card>
              {bundles.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text"]}
                  headings={[
                    "Name",
                    "Created",
                    "Steps",
                    "Status",
                    "Actions",
                    "Preview",
                  ]}
                  rows={bundles.map((bundle: BundleAndStepsBasicClient) => {
                    return [
                      <Link to={`/app/bundles/${bundle.id}`}>
                        {bundle.title}
                      </Link>,
                      bundle.createdAt.split("T")[0],
                      bundle.steps.length,
                      bundle.published ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="info">Draft</Badge>
                      ),

                      <ButtonGroup>
                        <Button
                          icon={DeleteIcon}
                          variant="secondary"
                          tone="critical"
                          onClick={() => {
                            submitAction(
                              "deleteBundle",
                              true,
                              `/app/bundles/${bundle.id}`,
                            );
                          }}
                        >
                          Delete
                        </Button>

                        <Button
                          icon={PageAddIcon}
                          variant="secondary"
                          onClick={() => {
                            submitAction(
                              "duplicateBundle",
                              true,
                              `/app/bundles/${bundle.id}`,
                            );
                          }}
                        >
                          Duplicate
                        </Button>

                        <Button
                          icon={EditIcon}
                          variant="primary"
                          url={`/app/bundles/${bundle.id}`}
                        >
                          Edit
                        </Button>
                      </ButtonGroup>,
                      <Button
                        icon={ExternalIcon}
                        variant="secondary"
                        tone="success"
                        onClick={() => {}}
                      >
                        Preview
                      </Button>,
                    ];
                  })}
                ></DataTable>
              ) : (
                <EmptyState
                  heading="Let’s create the first custom bundle for your customers!"
                  action={{
                    content: "Create bundle",
                    icon: PlusIcon,
                    onAction: () =>
                      submitAction("createBundle", true, "/app/bundles"),
                  }}
                  fullWidth
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>
                    Your customers will be able to use the custom bundles you
                    create to create and buy their own custom bundles.
                  </p>
                </EmptyState>
              )}
            </Card>

            {/* Video tutorial on how to use the app */}
            <MediaCard
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

            {/* Banner for encuraging users to rate the app */}
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
          </BlockStack>
        </Page>
      )}
    </>
  );
}
