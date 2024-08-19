import { json, redirect } from "@remix-run/node";
import {
  Link,
  useActionData,
  useFetcher,
  useNavigate,
  useRevalidator,
} from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useNavigation,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  TextField,
  Text,
  Box,
  SkeletonPage,
  ChoiceList,
  SkeletonBodyText,
  SkeletonDisplayText,
  ButtonGroup,
  DataTable,
  EmptyState,
  InlineStack,
  Badge,
  Select,
  Tooltip,
  Icon,
  Divider,
} from "@shopify/polaris";
import {
  DeleteIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PageAddIcon,
  EditIcon,
  QuestionCircleIcon,
  ExternalIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { useState } from "react";
import {
  bundleTagIndentifier,
  GapBetweenSections,
  GapBetweenTitleAndContent,
  GapInsideSection,
} from "../../constants";
import db from "../../db.server";
import {
  StepType,
  BundlePricing,
  BundleDiscountType,
  Bundle,
} from "@prisma/client";
import { BundleStepBasicResources } from "../../types/BundleStep";
import {
  bundleAllResources,
  BundleAllResources,
  BundleFullStepBasicClient,
  BundleFullStepBasicServer,
  inclBundleFullStepsBasic,
} from "../../types/Bundle";
import { JsonData } from "../../types/jsonData";
import { useSubmitAction } from "../../hooks/useSubmitAction";
import { Loading } from "@shopify/polaris/build/ts/src/components/Frame/components";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const bundle: BundleFullStepBasicServer | null = await db.bundle.findUnique({
    where: {
      id: Number(params.bundleid),
    },
    include: inclBundleFullStepsBasic,
  });

  if (!bundle) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return json(
    new JsonData(true, "success", "Bundle succesfuly retrieved", "", bundle),
    { status: 200 },
  );
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "deleteBundle": {
      try {
        //Delete the bundle along with its steps, contentInputs, bundleSettings?, bundleColors, and bundleLabels
        await db.bundle.delete({
          where: {
            id: Number(params.bundleid),
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

      return redirect("/app");
    }
    // case "duplicateBundle":
    //   const bundleToDuplicate: BundleAllResources | null =
    //     await db.bundle.findUnique({
    //       where: {
    //         id: Number(params.bundleid),
    //       },
    //       include: bundleAllResources,
    //     });

    //   if (!bundleToDuplicate) {
    //     return json(
    //       {
    //         ...new JsonData(
    //           false,
    //           "error",
    //           "There was an error with your request",
    //           "The bundle you are trying to duplicate does not exist",
    //         ),
    //       },
    //       { status: 400 },
    //     );
    //   }

    //   try {
    //     //Create a new product that will be used as a bundle wrapper
    //     const { _max }: { _max: { id: number | null } } =
    //       await db.bundle.aggregate({
    //         _max: {
    //           id: true,
    //         },
    //         where: {
    //           storeUrl: session.shop,
    //         },
    //       });

    //     //Create a new product that will be used as a bundle wrapper
    //     const response = await admin.graphql(
    //       `#graphql
    //     mutation productCreate($productInput: ProductInput!) {
    //       productCreate(input: $productInput) {
    //         product {
    //           id
    //         }
    //       }
    //     }`,
    //       {
    //         variables: {
    //           productInput: {
    //             title: `Neat Bundle ${_max.id ? _max.id : ""}`,
    //             productType: "Neat Bundle",
    //             vendor: "Neat Bundles",
    //             published: true,
    //             tags: [bundleTagIndentifier],
    //           },
    //         },
    //       },
    //     );

    //     const data = await response.json();

    //     await db.bundle.create({
    //       data: {
    //         storeUrl: bundleToDuplicate.storeUrl,
    //         title: `${bundleToDuplicate.title} - Copy`,
    //         shopifyId: data.data.productCreate.product.id,
    //         pricing: bundleToDuplicate.pricing,
    //         priceAmount: bundleToDuplicate.priceAmount,
    //         discountType: bundleToDuplicate.discountType,
    //         discountValue: bundleToDuplicate.discountValue,
    //         bundleSettings: {
    //           create: {
    //             displayDiscountBanner:
    //               bundleToDuplicate.bundleSettings?.displayDiscountBanner,
    //             skipTheCart: bundleToDuplicate.bundleSettings?.skipTheCart,
    //             showOutOfStockProducts:
    //               bundleToDuplicate.bundleSettings?.showOutOfStockProducts,
    //             numOfProductColumns:
    //               bundleToDuplicate.bundleSettings?.numOfProductColumns,

    //             bundleColors: {
    //               create: {
    //                 stepsIcon:
    //                   bundleToDuplicate.bundleSettings?.bundleColors.stepsIcon,
    //               },
    //             },
    //             bundleLabels: {
    //               create: {},
    //             },
    //           },
    //         },
    //         steps: {
    //           create: [
    //             {
    //               stepNumber: 1,
    //               title: "Step 1",
    //               stepType: "PRODUCT",
    //               productsData: {
    //                 create: {},
    //               },
    //               contentInputs: {
    //                 create: [{}, {}],
    //               },
    //             },
    //             {
    //               stepNumber: 2,
    //               title: "Step 2",
    //               stepType: "PRODUCT",
    //               productsData: {
    //                 create: {},
    //               },
    //               contentInputs: {
    //                 create: [{}, {}],
    //               },
    //             },
    //             {
    //               stepNumber: 3,
    //               title: "Step 3",
    //               stepType: "PRODUCT",
    //               productsData: {
    //                 create: {},
    //               },
    //               contentInputs: {
    //                 create: [{}, {}],
    //               },
    //             },
    //           ],
    //         },
    //       },
    //     });
    //   } catch (error) {
    //     console.log(error);
    //     return json(
    //       {
    //         ...new JsonData(
    //           false,
    //           "error",
    //           "There was an error with your request",
    //           "The bundle you are trying to duplicate does not exist",
    //         ),
    //       },
    //       { status: 400 },
    //     );
    //   }

    //   return json(
    //     { ...new JsonData(true, "success", "Bundle duplicated") },
    //     { status: 200 },
    //   );

    //Updating the bundle
    case "updateBundle":
      const bundleData: BundleFullStepBasicClient = JSON.parse(
        formData.get("bundle") as string,
      );

      try {
        await db.bundle.update({
          where: {
            id: Number(bundleData.id),
          },
          data: {
            title: bundleData.title,
            published: bundleData.published,
            priceAmount: bundleData.priceAmount,
            pricing: bundleData.pricing,
            discountType: bundleData.discountType,
            discountValue: bundleData.discountValue,
          },
        });
      } catch (error) {
        console.log(error);
        return json(
          { error: "Error while updating a bundle" },
          { status: 400 },
        );
      }

      return redirect(`/app`);

    default: {
      return json(
        {
          ...new JsonData(
            true,
            "success",
            "This is the default action that doesn't do anything.",
          ),
        },
        { status: 200 },
      );
    }
  }
};

export default function Index() {
  const nav = useNavigation();
  const navigate = useNavigate();
  const shopify = useAppBridge();
  const isLoading: boolean = nav.state !== "idle";
  const params = useParams();
  const submitAction = useSubmitAction(); //Function for doing the submit action where the only data is action and url
  const fetcher = useFetcher();
  const rearanging: boolean = fetcher.state !== "idle";

  const serverBundle: BundleFullStepBasicClient =
    useLoaderData<typeof loader>().data;

  const [bundleState, setBundleState] =
    useState<BundleFullStepBasicClient>(serverBundle);
  const bundleSteps: BundleStepBasicResources[] = serverBundle.steps.sort(
    (a: BundleStepBasicResources, b: BundleStepBasicResources): number =>
      a.stepNumber - b.stepNumber,
  );

  //Function for adding the step if there are less than 5 steps total
  const addStep = async (): Promise<void> => {
    await shopify.saveBar.leaveConfirmation();

    if (serverBundle.steps.length >= 5) {
      shopify.modal.show("no-more-steps-modal");
      return;
    }

    submitAction("addStep", true, `/app/bundles/${params.bundleid}/steps`);
  };

  //Deleting the bundle
  const deleteBundleHandler = async (): Promise<void> => {
    await shopify.saveBar.leaveConfirmation();
    submitAction("deleteBundle", true, `/app/bundles/${params.bundleid}`);
  };

  return (
    <>
      {isLoading || rearanging ? (
        <SkeletonPage primaryAction fullWidth></SkeletonPage>
      ) : (
        <>
          {/* Modal to alert the user that he can't have more tha 5 steps in one bundle. */}
          <Modal id="no-more-steps-modal">
            <Box padding="300">
              <Text as="p">
                You can't add more than 5 steps for one bundle.
              </Text>
            </Box>
            <TitleBar title="Maximum steps reached">
              <button
                variant="primary"
                onClick={() => shopify.modal.hide("no-more-steps-modal")}
              >
                Close
              </button>
            </TitleBar>
          </Modal>

          {/* Edit bundle page */}
          <Page
            secondaryActions={[
              {
                content: "Settings",
                url: `settings/?redirect=/app/bundles/${serverBundle.id}`,
                icon: SettingsIcon,
              },
              {
                content: "Preview",
                accessibilityLabel: "Preview action label",
                icon: ExternalIcon,
              },
            ]}
            titleMetadata={
              serverBundle.published ? (
                <Badge tone="success">Active</Badge>
              ) : (
                <Badge tone="info">Draft</Badge>
              )
            }
            backAction={{
              content: "Products",
              onAction: async () => {
                // Save or discard the changes before leaving the page
                await shopify.saveBar.leaveConfirmation();
                navigate("/app");
              },
            }}
            title={`Edit bundle - ` + serverBundle.title}
          >
            <Form method="POST" data-discard-confirmation data-save-bar>
              <input type="hidden" name="action" value="updateBundle" />
              <input
                type="hidden"
                name="bundle"
                value={JSON.stringify(bundleState)}
              />
              <BlockStack gap={GapBetweenSections}>
                <Layout>
                  <Layout.Section>
                    <BlockStack gap={GapBetweenSections}>
                      <Card>
                        <ChoiceList
                          title="Bundle Pricing"
                          name="bundlePricing"
                          choices={[
                            {
                              label: "Calculated price ",
                              value: BundlePricing.CALCULATED,
                              helpText: (
                                <Tooltip
                                  content={`e.g. use case: you want to sell shirt,
                                      pants, and a hat in a bundle with a 10%
                                      discount on whole order and you want the
                                      total price before discount to be a sum of
                                      the prices of individual products.`}
                                >
                                  <InlineStack align="start">
                                    <Box>
                                      <Text as="p">
                                        Final price is calculated based on the
                                        products that customers selects.
                                      </Text>
                                    </Box>
                                    <Box>
                                      <Icon source={QuestionCircleIcon} />
                                    </Box>
                                  </InlineStack>
                                </Tooltip>
                              ),
                            },
                            {
                              label: "Fixed price",
                              value: BundlePricing.FIXED,
                              helpText: (
                                <Tooltip
                                  content={`e.g. use case: you want to sell 5 cookies
                                    in a bundle at a same discount, but want
                                    your customers to be able to select which
                                    cookies they want`}
                                >
                                  <InlineStack align="start">
                                    <Box>
                                      <Text as="p">
                                        All bundles created will be priced the
                                        same.
                                      </Text>
                                    </Box>
                                    <Box>
                                      <Icon source={QuestionCircleIcon} />
                                    </Box>
                                  </InlineStack>
                                </Tooltip>
                              ),
                              renderChildren: (isSelected: boolean) => {
                                return isSelected ? (
                                  <Box maxWidth="50">
                                    <TextField
                                      label="Price"
                                      type="number"
                                      name="price"
                                      autoComplete="off"
                                      value={bundleState.priceAmount?.toString()}
                                      prefix="$"
                                      onChange={(newPrice: string) => {
                                        setBundleState(
                                          (
                                            prevBundle: BundleFullStepBasicClient,
                                          ) => {
                                            return {
                                              ...prevBundle,
                                              priceAmount: parseFloat(newPrice),
                                            };
                                          },
                                        );
                                      }}
                                    />
                                  </Box>
                                ) : null;
                              },
                            },
                          ]}
                          selected={[bundleState.pricing]}
                          onChange={(newPricing) => {
                            setBundleState(
                              (prevBundle: BundleFullStepBasicClient) => {
                                return {
                                  ...prevBundle,
                                  pricing: newPricing[0] as BundlePricing,
                                };
                              },
                            );
                          }}
                        />
                      </Card>
                      <Card>
                        <BlockStack>
                          <InlineStack align="space-between">
                            <Text as="h2" variant="headingMd">
                              Bundle steps
                            </Text>

                            <Button
                              icon={PlusIcon}
                              size="slim"
                              variant="primary"
                              onClick={addStep}
                            >
                              Add step
                            </Button>
                          </InlineStack>
                          {bundleSteps.length > 0 ? (
                            <DataTable
                              columnContentTypes={[
                                "text",
                                "text",
                                "text",
                                "text",
                                "text",
                              ]}
                              headings={[
                                "Step",
                                "Title",
                                "Type",
                                "Rearange",
                                "Actions",
                              ]}
                              rows={bundleSteps.map(
                                (step: BundleStepBasicResources) => {
                                  return [
                                    step.stepNumber,
                                    <Link
                                      to={`/app/bundles/${params.bundleid}/steps/${step.stepNumber}`}
                                    >
                                      <Text as="p" tone="base">
                                        {step.title}
                                      </Text>
                                    </Link>,
                                    step.stepType === StepType.PRODUCT ? (
                                      <Badge tone="warning">Product step</Badge>
                                    ) : (
                                      <Badge>Content step</Badge>
                                    ),
                                    <ButtonGroup>
                                      {step.stepNumber !==
                                        bundleSteps.length && (
                                        <Button
                                          icon={ArrowDownIcon}
                                          size="slim"
                                          variant="plain"
                                          disabled={isLoading}
                                          onClick={() => {
                                            submitAction(
                                              "moveStepDown",
                                              true,
                                              `/app/bundles/${params.bundleid}/steps/`,
                                              Number(step.id),
                                            );
                                          }}
                                        />
                                      )}
                                      {step.stepNumber !== 1 && (
                                        <Button
                                          icon={ArrowUpIcon}
                                          size="slim"
                                          variant="plain"
                                          disabled={isLoading}
                                          onClick={() => {
                                            submitAction(
                                              "moveStepUp",
                                              true,
                                              `/app/bundles/${params.bundleid}/steps/`,
                                              Number(step.id),
                                            );
                                          }}
                                        />
                                      )}
                                    </ButtonGroup>,
                                    <ButtonGroup>
                                      <Button
                                        icon={DeleteIcon}
                                        variant="secondary"
                                        tone="critical"
                                        onClick={() => {
                                          submitAction(
                                            "deleteStep",
                                            true,
                                            `/app/bundles/${params.bundleid}/steps/${step.stepNumber}`,
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
                                            "duplicateStep",
                                            true,
                                            `/app/bundles/${params.bundleid}/steps/${step.stepNumber}`,
                                          );
                                        }}
                                      >
                                        Duplicate
                                      </Button>

                                      <Button
                                        icon={EditIcon}
                                        variant="primary"
                                        url={`/app/bundles/${params.bundleid}/steps/${step.stepNumber}`}
                                      >
                                        Edit
                                      </Button>
                                    </ButtonGroup>,
                                  ];
                                },
                              )}
                            ></DataTable>
                          ) : (
                            <EmptyState
                              heading="Let’s create the first step for your customers to take!"
                              action={{
                                content: "Create step",
                                icon: PlusIcon,
                                onAction: () => {
                                  submitAction(
                                    "createStep",
                                    true,
                                    `/app/bundles/${params.bundleid}/steps`,
                                  );
                                },
                              }}
                              fullWidth
                              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                            >
                              <p>
                                Your customers will be able to select products
                                or add content (like text or images) at each
                                step to their bundle.
                              </p>
                            </EmptyState>
                          )}
                        </BlockStack>
                      </Card>
                    </BlockStack>
                  </Layout.Section>
                  <Layout.Section variant="oneThird">
                    <BlockStack gap={GapBetweenSections}>
                      {/* Bundle status */}
                      <Card>
                        <BlockStack gap={GapBetweenTitleAndContent}>
                          <Text as="p" variant="headingMd">
                            Bundle status
                          </Text>

                          <Select
                            label="Visibility"
                            name="bundleVisibility"
                            labelHidden
                            options={[
                              { label: "Active", value: "true" },
                              { label: "Draft", value: "false" },
                            ]}
                            value={bundleState.published ? "true" : "false"}
                            onChange={(newSelection: string) => {
                              setBundleState(
                                (prevBundle: BundleFullStepBasicClient) => {
                                  return {
                                    ...prevBundle,
                                    published: newSelection === "true",
                                  };
                                },
                              );
                            }}
                          />
                        </BlockStack>
                      </Card>

                      {/* Bundle title */}
                      <Card>
                        <BlockStack gap={GapBetweenTitleAndContent}>
                          <Text as="p" variant="headingMd">
                            Bundle title
                          </Text>
                          <BlockStack gap={GapInsideSection}>
                            <TextField
                              label="Title"
                              labelHidden
                              autoComplete="off"
                              name="bundleTitle"
                              helpText="Only store staff can see this."
                              value={bundleState.title}
                              onChange={(newTitile) => {
                                setBundleState(
                                  (prevBundle: BundleFullStepBasicClient) => {
                                    return { ...prevBundle, title: newTitile };
                                  },
                                );
                              }}
                              type="text"
                            />
                          </BlockStack>
                        </BlockStack>
                      </Card>

                      {/* Bundle discount */}
                      <Card>
                        <BlockStack gap={GapBetweenTitleAndContent}>
                          <Text as="p" variant="headingMd">
                            Discount
                          </Text>
                          <BlockStack gap={GapInsideSection}>
                            <Select
                              label="Type"
                              name="bundleDiscountType"
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
                              value={bundleState.discountType}
                              onChange={(newDiscountType: string) => {
                                setBundleState(
                                  (prevBundle: BundleFullStepBasicClient) => {
                                    return {
                                      ...prevBundle,
                                      discountType:
                                        newDiscountType as BundleDiscountType,
                                    };
                                  },
                                );
                              }}
                            />

                            <TextField
                              label="Amount"
                              type="number"
                              autoComplete="off"
                              inputMode="numeric"
                              disabled={
                                bundleState.discountType ===
                                BundleDiscountType.NO_DISCOUNT
                              }
                              name={`discountValue`}
                              prefix={
                                bundleState.discountType ===
                                BundleDiscountType.PERCENTAGE
                                  ? "%"
                                  : "$"
                              }
                              min={0}
                              max={"100"}
                              value={bundleState.discountValue.toString()}
                              onChange={(newDiscountValue) => {
                                setBundleState(
                                  (prevBundle: BundleFullStepBasicClient) => {
                                    return {
                                      ...prevBundle,
                                      discountValue: parseInt(newDiscountValue),
                                    };
                                  },
                                );
                              }}
                            />
                          </BlockStack>
                        </BlockStack>
                      </Card>
                    </BlockStack>
                  </Layout.Section>
                </Layout>

                <Box width="full">
                  <BlockStack inlineAlign="end">
                    <ButtonGroup>
                      <Button
                        variant="primary"
                        tone="critical"
                        onClick={deleteBundleHandler}
                      >
                        Delete
                      </Button>
                      <Button variant="primary" submit>
                        Save
                      </Button>
                    </ButtonGroup>
                  </BlockStack>
                </Box>
                <Divider borderColor="transparent" />
              </BlockStack>
            </Form>
          </Page>
        </>
      )}
    </>
  );
}
