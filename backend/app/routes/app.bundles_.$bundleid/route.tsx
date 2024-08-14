import { json, redirect } from "@remix-run/node";
import { Link, useNavigate } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useNavigation,
  useSubmit,
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
  PageActions,
  SkeletonBodyText,
  SkeletonDisplayText,
  ButtonGroup,
  DataTable,
  EmptyState,
  InlineStack,
  Badge,
} from "@shopify/polaris";
import {
  DeleteIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PageAddIcon,
  EditIcon,
} from "@shopify/polaris-icons";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { useEffect, useState } from "react";
import BundleSettingsComponent from "./bundleSettings";
import { GapBetweenSections, GapBetweenTitleAndContent } from "../../constants";
import db from "../../db.server";
import { StepType } from "@prisma/client";
import { BundleStepBasicResources } from "../../types/BundleStep";
import { BundleSettingsWithAllResources } from "../../types/BundleSettings";
import {
  BundlePayload,
  bundleSelect,
  BundlePayloadDataString,
} from "../../types/Bundle";
import { JsonData } from "../../types/jsonData";
import { useSubmitAction } from "~/hooks/useSubmitAction";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const bundle: BundlePayload | null = await db.bundle.findUnique({
    where: {
      id: Number(params.bundleid),
    },
    select: bundleSelect,
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
  await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "deleteBundle": {
      try {
        //Delete the bundle along with its steps, contentInputs, bundleSettings, bundleColors, and bundleLabels
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
    case "duplicateBundle":
      const bundleToDuplicate: BundlePayload | null =
        await db.bundle.findUnique({
          where: {
            id: Number(params.bundleid),
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

      return json(
        { ...new JsonData(true, "success", "Bundle duplicated") },
        { status: 200 },
      );

    //Updating the bundle
    case "updateBundle":
      const bundleData: BundlePayloadDataString = JSON.parse(
        formData.get("bundle") as string,
      );

      try {
        await db.bundle.update({
          where: {
            id: Number(bundleData.id),
          },
          data: {
            title: bundleData.title,
            published: formData.get("publish") === "true",
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

    //Moving the step up
    case "moveStepDown": {
    }
    //Moving the step down
    case "moveStepUp": {
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
        { status: 200 },
      );
    }
  }
};

export default function Index() {
  const nav = useNavigation();
  const navigate = useNavigate();
  const submit = useSubmit();
  const shopify = useAppBridge();
  const isLoading: boolean = nav.state != "idle";
  const params = useParams();
  const submitAction = useSubmitAction(); //Function for doing the submit action where the only data is action and url

  const loaderReponse: JsonData<BundlePayloadDataString> =
    useLoaderData<typeof loader>();

  const [bundleState, setBundleState] = useState<BundlePayloadDataString>(
    loaderReponse.data,
  );
  const bundleSteps: BundleStepBasicResources[] = bundleState.steps.sort(
    (a: BundleStepBasicResources, b: BundleStepBasicResources): number =>
      a.stepNumber - b.stepNumber,
  );

  //Function for checking if there are free steps and displaying a modal if there are not
  const thereAreFreeSteps = (bundle: BundlePayloadDataString): boolean => {
    if (bundle.steps.length >= 5) {
      shopify.modal.show("no-more-steps-modal");
      return false;
    }
    return true;
  };

  //Function for adding the step if there are less than 5 steps total
  const addStep = (): void => {
    if (!thereAreFreeSteps(bundleState)) {
      return;
    }

    submitAction("addStep", true, `/app/bundles/${params.bundleid}`);
  };

  //Function for updating the settings of the bundle
  const updateSettings = (
    newBundleSettings: BundleSettingsWithAllResources,
  ): void => {
    setBundleState(
      (prevBundle: BundlePayloadDataString): BundlePayloadDataString => {
        return { ...prevBundle, bundleSettings: newBundleSettings };
      },
    );
  };

  //Submiting the form
  const submitBundle = (publish: boolean): void => {
    const newData = new FormData();
    newData.append("bundle", JSON.stringify(bundleState));
    newData.append("action", "updateBundle");
    if (publish) {
      newData.append("publish", "true");
    }
    submit(newData, {
      method: "POST",
    });
  };

  //Showing the save bar
  useEffect(() => {
    return () => {
      //shopify.saveBar.hide("my-save-bar");
    };
  }, []);

  return (
    <>
      {isLoading ? (
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

          <Page
            fullWidth
            titleMetadata={
              bundleState.published ? (
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
            title={`Edit bundle - ` + loaderReponse.data.title}
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
                  <Layout.Section variant="oneThird">
                    <BlockStack gap={GapBetweenSections}>
                      <Card>
                        <BlockStack gap={GapBetweenTitleAndContent}>
                          <Text as="h2" variant="headingMd">
                            Bundle title
                          </Text>
                          <TextField
                            label="Title"
                            autoComplete="off"
                            name="bundleTitle"
                            helpText="Only store staff can see this."
                            value={bundleState.title}
                            onChange={(newTitile) => {
                              setBundleState(
                                (prevBundle: BundlePayloadDataString) => {
                                  return { ...prevBundle, title: newTitile };
                                },
                              );
                            }}
                            type="text"
                          />
                        </BlockStack>
                      </Card>
                      {/* Settings for this bundle */}
                      <BundleSettingsComponent
                        bundleSettings={bundleState.bundleSettings}
                        updateSettings={updateSettings}
                      />
                    </BlockStack>
                  </Layout.Section>
                  <Layout.Section>
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
                            ]}
                            headings={[
                              "Step number",
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
                                    to={`/app/bundles/${params.bundleid}/steps/${step.id}`}
                                  >
                                    {step.title}
                                  </Link>,
                                  step.stepType === StepType.PRODUCT ? (
                                    <Badge tone="warning">Product step</Badge>
                                  ) : (
                                    <Badge>Content step</Badge>
                                  ),
                                  <ButtonGroup>
                                    <Button
                                      icon={ArrowDownIcon}
                                      size="slim"
                                      variant="plain"
                                      onClick={() => {
                                        {
                                        }
                                      }}
                                    />
                                    <Button
                                      icon={ArrowUpIcon}
                                      size="slim"
                                      variant="plain"
                                      onClick={() => {
                                        {
                                        }
                                      }}
                                    />
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
                                          `/app/bundles/${params.bundleid}/steps/${step.id}`,
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
                                          `/app/bundles/${params.bundleid}/steps/${step.id}`,
                                        );
                                      }}
                                    >
                                      Duplicate
                                    </Button>

                                    <Button
                                      icon={EditIcon}
                                      variant="primary"
                                      url={`/app/bundles/${params.bundleid}/steps/${step.id}`}
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
                              Your customers will be able to select products or
                              add content (like text or images) at each step to
                              their bundle.
                            </p>
                          </EmptyState>
                        )}
                      </BlockStack>
                    </Card>
                  </Layout.Section>
                </Layout>
              </BlockStack>
              <PageActions
                primaryAction={{
                  content: "Publish",
                  onAction: () => submitBundle(true),
                }}
                secondaryActions={[
                  {
                    content: "Delete",
                    destructive: true,
                    onAction: () => {
                      submitAction(
                        "deleteBundle",
                        true,
                        `/app/bundles/${params.bundleid}`,
                      );
                    },
                  },
                  {
                    content: "Save as draft",
                    onAction: () => submitBundle(false),
                  },
                ]}
              />
            </Form>
          </Page>
        </>
      )}
    </>
  );
}
