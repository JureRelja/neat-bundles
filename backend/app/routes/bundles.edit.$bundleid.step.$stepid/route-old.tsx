import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
  useLoaderData,
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
  Divider,
  SkeletonPage,
  PageActions,
  SkeletonBodyText,
  SkeletonDisplayText,
  InlineGrid,
} from "@shopify/polaris";
import { OrderDraftIcon, DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { useState, useRef, useEffect } from "react";
import BundleStepComponent from "./route";
import BundleSettingsComponent from "../bundles.edit.$bundleid.settings.$settingsid/route";
import { GapBetweenSections, GapBetweenTitleAndContent } from "../../constants";
import BundlePreview from "./bundlePreview";
import styles from "./route.module.css";
import db from "../../db.server";
import { BundleStep, ContentInput } from "@prisma/client";
import { BundleStepWithAllResources } from "../../types/BundleStep";
import { BundleSettingsWithAllResources } from "../../types/BundleSettings";
import { BundlePayload, bundleSelect } from "../../types/Bundle";
import { JsonData } from "../../types/jsonData";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const bundle: BundlePayload | null = await db.bundle.findFirst({
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
    {
      ...new JsonData(
        true,
        "success",
        "Bundle succesfuly retrieved",
        "",
        bundle,
      ),
    },
    { status: 200 },
  );
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  if (request.method !== "POST") {
    return json(
      {
        ...new JsonData(
          false,
          "error",
          "There was an error with your request",
          "GET request isn't allowed",
        ),
      },
      { status: 405 },
    );
  }

  if (params.id === undefined) {
    return json(
      {
        ...new JsonData(
          false,
          "error",
          "There was an error with your request",
          "bundleId is not defined",
        ),
      },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const action = formData.get("action") as string;

  switch (action) {
    //Adding a new step to the bundle
    case "addStep": {
      try {
        const allSteps: BundleStep[] = await db.bundleStep.findMany({
          where: {
            bundleId: Number(params.id),
          },
        });

        await db.bundleStep.create({
          data: {
            stepNumber: allSteps.length + 1,
            title: `Title for step ${allSteps.length + 1}`,
            contentInputs: {
              create: [{}, {}],
            },
            bundle: {
              connect: {
                id: Number(params.id),
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
              "New step couldn't be created",
            ),
          },
          { status: 400 },
        );
      }

      return json(
        { ...new JsonData(true, "success", "New step was succesfully added.") },
        { status: 200 },
      );
    }
    //Deleting the step from the bundle
    case "deleteStep": {
      try {
        const step: BundleStep = await db.bundleStep.delete({
          where: {
            id: Number(formData.get("stepId")),
          },
        });

        if (!step) {
          return json(
            {
              ...new JsonData(
                true,
                "error",
                "There was an error with your request.",
                "Requested step couldn't be found",
              ),
            },
            { status: 400 },
          );
        }

        await db.bundleStep.updateMany({
          where: {
            bundleId: Number(params.id),
            stepNumber: {
              gte: Number(formData.get("stepNumber")),
            },
          },
          data: {
            stepNumber: {
              decrement: 1,
            },
          },
        });
      } catch (error) {
        return json(
          {
            ...new JsonData(
              false,
              "error",
              "There was an error with your request.",
              "Step couldn't be deleted",
            ),
          },
          { status: 400 },
        );
      }

      return json({ status: 200 });
    }

    //Duplicating the step
    case "duplicateStep": {
      try {
        let stepToDuplicate: BundleStepWithAllResources | null =
          await db.bundleStep.findFirst({
            where: {
              bundleId: Number(params.id),
              stepNumber: Number(formData.get("stepNumber")),
            },
            include: {
              contentInputs: true,
            },
          });

        if (!stepToDuplicate) {
          return json(
            {
              ...new JsonData(
                false,
                "error",
                "Thre was an error with your request",
                "Requested step for duplication doesn't exist.",
              ),
            },
            { status: 400 },
          );
        }

        //Creating a new step with the same data as the duplicated step
        await db.bundleStep.create({
          data: {
            bundleId: Number(params.id),
            stepNumber: Number(formData.get("stepNumber")) + 1,
            title: stepToDuplicate.title,
            stepType: stepToDuplicate.stepType,
            description: stepToDuplicate.description,
            productResources: stepToDuplicate.productResources,
            resourceType: stepToDuplicate.resourceType,
            minProductsOnStep: stepToDuplicate.minProductsOnStep,
            maxProductsOnStep: stepToDuplicate.maxProductsOnStep,
            allowProductDuplicates: stepToDuplicate.allowProductDuplicates,
            showProductPrice: stepToDuplicate.showProductPrice,
            contentInputs: {
              create: stepToDuplicate.contentInputs.map(
                (contentInput: ContentInput) => {
                  return {
                    inputType: contentInput.inputType,
                    inputLabel: contentInput.inputLabel,
                    maxChars: contentInput.maxChars,
                    required: contentInput.required,
                  };
                },
              ),
            },
          },
        });

        //Incrementing the step number for all steps with stepNumber greater than the duplicated step
        await db.bundleStep.updateMany({
          where: {
            bundleId: Number(params.id),
            stepNumber: {
              gte: Number(formData.get("stepNumber")),
            },
          },
          data: {
            stepNumber: {
              increment: 1,
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
              "Error while duplicating a step",
              "Make sure that your entered correct data.",
            ),
          },
          { status: 400 },
        );
      }
      return json(
        { ...new JsonData(true, "success", "Step was succesfuly duplicated") },
        { status: 200 },
      );
    }
    //Moving the step up
    case "moveStepDown": {
    }
    //Moving the step down
    case "moveStepUp": {
    }
    //Updating the bundle
    case "updateBundle":
      const bundleData = JSON.parse(formData.get("bundle") as string);

      try {
        await db.bundle.update({
          where: {
            id: Number(bundleData.id),
          },
          data: {
            title: bundleData.title,
          },
        });
      } catch (error) {
        console.log(error);
        return json(
          { error: "Error while updating a bundle" },
          { status: 400 },
        );
      }

      return json(
        {
          ...new JsonData(true, "success", "Bundle succesfuly updated"),
        },
        { status: 200 },
      );

    default:
      return json(
        {
          ...new JsonData(
            true,
            "success",
            "This is the default action that doesn't do anything",
          ),
        },
        { status: 200 },
      );
  }
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const shopify = useAppBridge();
  const isLoading = nav.state != "idle";

  const reponse: JsonData<BundlePayload> = useLoaderData<
    typeof loader
  >() as JsonData<BundlePayload>;

  const [bundleState, setBundleState] = useState(reponse.data as BundlePayload);
  const bundleSteps = bundleState.steps.sort(
    (a, b) => a.stepNumber - b.stepNumber,
  );

  //Function for checking if there are free steps and displaying a modal if there are not
  const thereAreFreeSteps = (bundle: BundlePayload): boolean => {
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

    submit({ action: "addStep" }, { method: "post" });
  };

  //Function for updating the step with a new data from it's component
  const updateStepData = (stepData: BundleStepWithAllResources): void => {
    setBundleState((prevBundle: BundlePayload) => {
      const index = prevBundle.steps.findIndex(
        (step: BundleStepWithAllResources) => {
          return step.id === stepData.id;
        },
      );
      prevBundle.steps[index] = stepData;

      return { ...prevBundle };
    });
  };

  //Function for updating the settings of the bundle
  const updateSettings = (
    newBundleSettings: BundleSettingsWithAllResources,
  ): void => {
    setBundleState((prevBundle: BundlePayload): BundlePayload => {
      return { ...prevBundle, bundleSettings: newBundleSettings };
    });
  };

  //Sticky preview box logic
  const [sticky, setSticky] = useState({ isSticky: false, offset: 0 });
  const previewBoxRef = useRef<HTMLDivElement>(null);

  // handle scroll event
  const handleScroll = (elTopOffset: number, elHeight: number) => {
    if (window.scrollY > elTopOffset + elHeight) {
      setSticky({ isSticky: true, offset: elHeight });
    } else {
      setSticky({ isSticky: false, offset: 0 });
    }
  };

  // add/remove scroll event listener
  useEffect(() => {
    let previewBox = previewBoxRef.current?.getBoundingClientRect();
    const handleScrollEvent = () => {
      handleScroll(previewBox?.top || 0, previewBox?.height || 0);
    };

    window.addEventListener("scroll", handleScrollEvent);

    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
    };
  }, []);

  //Submiting the form
  const submitForm = (): void => {
    const newData = new FormData();
    newData.append("bundle", JSON.stringify(bundleState));
    newData.append("action", "updateBundle");
    submit(newData, {
      method: "POST",
    });
  };

  return (
    <>
      {isLoading ? (
        <SkeletonPage primaryAction fullWidth></SkeletonPage>
      ) : (
        <>
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
            backAction={{ content: "Products", url: "/bundles" }}
            title="Edit bundle"
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
                onAction: submitForm,
              },
            ]}
          >
            <BlockStack gap={GapBetweenSections}>
              <Layout>
                <Layout.Section variant="oneThird">
                  <Form
                    onSubmit={submitForm}
                    // data-save-bar
                    // data-discard-confirmation
                    // method="POST"
                  >
                    {/* <input
                      type="hidden"
                      name="bundle"
                      value={JSON.stringify(bundleState)}
                    /> */}
                    <BlockStack gap={GapBetweenSections}>
                      <Card>
                        <BlockStack gap={GapBetweenTitleAndContent}>
                          <Text as="h2" variant="headingSm">
                            Bundle title
                          </Text>
                          <TextField
                            label="Title"
                            autoComplete="off"
                            name="bundleTitle"
                            helpText="Only store staff can see this."
                            value={bundleState.title}
                            onChange={(newTitile) => {
                              setBundleState((prevBundle: BundlePayload) => {
                                return { ...prevBundle, title: newTitile };
                              });
                            }}
                            type="text"
                          />
                        </BlockStack>
                      </Card>
                      <Card>
                        <InlineGrid columns={2} alignItems="center">
                          <Text as="h2" variant="headingMd">
                            {bundleState.steps.length} steps total
                          </Text>
                          <Button
                            onClick={addStep}
                            variant="primary"
                            icon={PlusIcon}
                            fullWidth
                          >
                            Add step
                          </Button>
                        </InlineGrid>
                      </Card>

                      {/* {bundleSteps.map((step) => (
                        <BundleStepComponent
                          key={step.id}
                          stepData={step}
                          updateStepData={updateStepData}
                        ></BundleStepComponent>
                      ))}
                      <Card>
                        <InlineGrid columns={2} alignItems="center">
                          <Text as="h2" variant="headingMd">
                            {bundleState.steps.length} steps total
                          </Text>
                          <Button
                            onClick={addStep}
                            variant="primary"
                            icon={PlusIcon}
                            fullWidth
                          >
                            Add step
                          </Button>
                        </InlineGrid>
                      </Card>
                      <Divider borderColor="border-inverse" />
                      <BundleSettingsComponent
                        bundleSettings={bundleState.bundleSettings}
                        updateSettings={updateSettings}
                      />
                      <Divider borderColor="transparent" /> */}
                    </BlockStack>
                  </Form>
                </Layout.Section>
                <Layout.Section>
                  <div
                    ref={previewBoxRef}
                    className={`${sticky.isSticky ? styles.sticky : ""}`}
                  >
                    <BundlePreview />
                  </div>
                </Layout.Section>
              </Layout>
            </BlockStack>
            <PageActions
              primaryAction={{
                content: "Publish",
              }}
              secondaryActions={[
                {
                  content: "Delete",
                  destructive: true,
                },
                {
                  content: "Save as draft",
                  onAction: submitForm,
                },
              ]}
            />
          </Page>
        </>
      )}
    </>
  );
}
