import {
  redirect,
  useNavigation,
  useSubmit,
  json,
  useLoaderData,
  useActionData,
} from "@remix-run/react";
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
} from "@shopify/polaris";
import {
  PlusIcon,
  ExternalIcon,
  EditIcon,
  DeleteIcon,
  PageAddIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { Bundle } from "@prisma/client";
import {
  BundlePayload,
  bundleSelect,
  BundleWithStringDate,
} from "../types/Bundle";
import { JsonData } from "../types/jsonData";

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

  const bundles: Bundle[] = await prisma.bundle.findMany({
    where: {
      user: {
        storeUrl: session.shop,
      },
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

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "createBundle": {
      const allUserBundles = await prisma.bundle.findMany({
        where: {
          user: {
            storeUrl: session.shop,
          },
        },
      });

      const bundle = await prisma.bundle.create({
        data: {
          user: {
            connect: {
              storeUrl: session.shop,
            },
          },
          title: "New bundle " + (allUserBundles.length + 1),
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
      return redirect(`/app/edit-bundle/${bundle.id}`, { status: 200 });
    }
    case "deleteBundle":
      const bundleId = formData.get("bundleId");

      try {
        //Delete the bundle along with its steps, contentInputs, bundleSettings, bundleColors, and bundleLabels
        await prisma.bundle.delete({
          where: {
            id: Number(bundleId),
          },
          include: {
            steps: {
              include: {
                contentInputs: true,
              },
            },
            bundleSettings: {
              include: {
                bundleColors: true,
                bundleLabels: true,
              },
            },
          },
        });
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(
              false,
              "error",
              "There was an error with your request",
              "There was an error deleting the bundle",
              error,
            ),
          },
          { status: 400 },
        );
      }

      return redirect("/bundles", { status: 200 });
    case "duplicateBundle":
      const bundleToDuplicate: BundlePayload | null =
        await prisma.bundle.findUnique({
          where: {
            id: Number(formData.get("bundleId")),
          },
          select: bundleSelect,
        });

      if (!bundleToDuplicate) {
        return json(
          {
            ...new JsonData(
              false,
              "error",
              "There was an error with your request",
              "The bundle you are trying to duplicate does not exist",
            ),
          },
          { status: 400 },
        );
      }
    default: {
      return json(
        {
          ...new JsonData(
            true,
            "success",
            "This is the default action that doesn't do anything.",
          ),
        },
        { status: 400 },
      );
    }
  }
};

export default function Index() {
  const nav = useNavigation();
  const isLoading = nav.state === "loading" || nav.state !== "idle";
  const submit = useSubmit();

  const postReponse = useActionData<typeof loader>();
  console.log(postReponse);

  const getResponse: JsonData<BundleWithStringDate[]> = useLoaderData<
    typeof loader
  >() as JsonData<BundleWithStringDate[]>;

  const bundles: BundleWithStringDate[] =
    getResponse.data as BundleWithStringDate[];

  const sortedBundles: BundleWithStringDate[] = bundles.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
                  { action: "createBundle" },
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
                    {bundles.length > 0 ? (
                      <DataTable
                        columnContentTypes={[
                          "text",
                          "text",
                          "text",
                          "text",
                          "text",
                        ]}
                        headings={[
                          "Bundles",
                          "Created",
                          "Status",
                          "Actions",
                          "Preview",
                        ]}
                        rows={sortedBundles.map(
                          (bundle: BundleWithStringDate) => {
                            return [
                              bundle.title,
                              bundle.createdAt.split("T")[0],
                              bundle.published ? "Published" : "Draft",
                              <ButtonGroup>
                                <Button
                                  icon={DeleteIcon}
                                  variant="secondary"
                                  tone="critical"
                                  onClick={() =>
                                    submit(
                                      {
                                        action: "deleteBundle",
                                        bundleId: bundle.id,
                                      },
                                      {
                                        method: "post",
                                      },
                                    )
                                  }
                                >
                                  Delete
                                </Button>

                                <Button
                                  icon={PageAddIcon}
                                  variant="secondary"
                                  onClick={() =>
                                    submit(
                                      {
                                        action: "duplicateBundle",
                                        bundleId: bundle.id,
                                      },
                                      {
                                        method: "post",
                                      },
                                    )
                                  }
                                >
                                  Duplicate
                                </Button>

                                <Button
                                  icon={EditIcon}
                                  variant="primary"
                                  url={`/bundles/edit/${bundle.id}`}
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
                          },
                        )}
                      ></DataTable>
                    ) : (
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
                    )}
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
