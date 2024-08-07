import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
  useLoaderData,
} from "@remix-run/react";
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
  PageActions,
  SkeletonBodyText,
  SkeletonDisplayText,
  InlineGrid,
} from "@shopify/polaris";
import { OrderDraftIcon, DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { useState, useRef, useEffect, FormEvent } from "react";
import BundleStepComponent from "./routeComponents/bundleStep";
import { GapBetweenSections, GapBetweenTitleAndContent } from "./constants";
import BundlePreview from "./bundlePreview";
import styles from "./route.module.css";
import db from "../../db.server";
import { Prisma, BundleStep, BundleSettings } from "@prisma/client";
import { BundleStepWithAllResources } from "./types/BundleStep";

//Defining bundle type
const bundleSelect = {
  id: true,
  title: true,
  bundleSettings: true,
  steps: {
    select: {
      bundleId: true,
      id: true,
      stepNumber: true,
      title: true,
      stepType: true,
      description: true,
      productResources: true,
      resourceType: true,
      minProductsOnStep: true,
      maxProductsOnStep: true,
      allowProductDuplicates: true,
      showProductPrice: true,
      contentInputs: true,
    },
  },
} satisfies Prisma.BundleSelect;

type BundlePayload = Prisma.BundleGetPayload<{ select: typeof bundleSelect }>;

//
//

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const bundle = await db.bundle.findFirst({
    where: {
      id: Number(params.id),
    },
    select: bundleSelect,
  });

  if (!bundle) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return json({ bundle });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticate.admin(request);

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
        throw new Response(null, {
          status: 400,
          statusText: "Bad Request",
        });
      }
      return null;
    }
    //Deleting the step from the bundle
    case "deleteStep": {
      try {
        await db.bundleStep.delete({
          where: {
            id: Number(formData.get("stepId")),
          },
        });
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
        console.log(error);
        throw new Response(null, {
          status: 400,
          statusText: "Bad Request",
        });
      }

      return null;
    }

    //Duplicating the step
    case "duplicateStep": {
    }
    //Moving the step up
    case "moveStepDown": {
    }
    //Moving the step down
    case "moveStepUp": {
    }
    //Updating the bundle
    default:
      console.log(formData);
      const bundleData = JSON.parse(formData.get("bundle") as string);
      console.log(bundleData);

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
        throw new Response(null, {
          status: 400,
          statusText: "Bad Request",
        });
      }

      return null;
  }
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const shopify = useAppBridge();
  const isLoading = nav.state != "idle";

  const bundle = useLoaderData<typeof loader>().bundle as BundlePayload;
  const [bundleState, setBundleState] = useState(bundle);
  const bundleSteps = bundleState.steps.sort(
    (a, b) => a.stepNumber - b.stepNumber,
  );

  //Function for checking if there are free steps and displaying a modal if there are not
  const thereAreFreeSteps = (bundle: BundlePayload) => {
    if (bundle.steps.length >= 5) {
      shopify.modal.show("no-more-steps-modal");
      return false;
    }
    return true;
  };

  //Function for adding the step if there are less than 5 steps total
  const addStep = (): void => {
    if (!thereAreFreeSteps(bundle)) {
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
  const updateSettings = (newBundleSettings: BundleSettings): void => {
    setBundleState((prevBundle: BundlePayload) => {
      return { ...prevBundle, settings: newBundleSettings };
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
                onAction: submitForm,
              },
            ]}
          >
            <BlockStack gap={GapBetweenSections}>
              <Layout>
                <Layout.Section variant="oneThird">
                  <Form
                    onSubmit={submitForm}
                    data-save-bar
                    data-discard-confirmation
                    method="POST"
                  >
                    <input
                      type="hidden"
                      name="bundle"
                      value={JSON.stringify(bundleState)}
                    />
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
                            {bundle.steps.length} steps total
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

                      {bundleSteps.map((step) => (
                        <BundleStepComponent
                          key={step.id}
                          stepData={step}
                          updateStepData={updateStepData}
                        ></BundleStepComponent>
                      ))}
                      <Card>
                        <InlineGrid columns={2} alignItems="center">
                          <Text as="h2" variant="headingMd">
                            {bundle.steps.length} steps total
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
                      {/* <BundleSettingsComponent
                        settingsId={bundle.settings.id}
                      /> */}
                      <Divider borderColor="transparent" />
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
