import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
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
import { useState, useRef, useEffect } from "react";
import BundleStepComponent from "./routeComponents/bundleStep";
import { Bundle, defaultBundle } from "./types/Bundle";
import { BundleStep, defaultBundleStep } from "./types/BundleStep";
import { GapBetweenSections, GapBetweenTitleAndContent } from "./constants";
import BundleSettingsComponent from "./routeComponents/bundleSettings";
import { BundleSettings } from "./types/BundleSettings";
import BundlePreview from "./bundlePreview";
import styles from "./route.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const title = formData.get("title");
  console.log("formData", formData);

  return null;
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const shopify = useAppBridge();
  const isLoading = nav.state === "loading";

  //
  //
  //

  //Bundle state
  const [bundle, setBundle] = useState<Bundle>(defaultBundle);

  //
  //
  //

  //Function for checking if there are free steps and displaying a modal if there are not
  const thereAreFreeSteps = (bundle: Bundle) => {
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
  const updateStepData = (stepData: BundleStep | null, stepId?: number) => {
    //If stepData is null, it means that the step should be deleted
    if (stepData === null) {
      setBundle((prevBundle: Bundle) => {
        const updatedSteps = prevBundle.steps.filter((step: BundleStep) => {
          return step.stepId !== stepId;
        });

        return {
          ...prevBundle,
          steps: updatedSteps.map((step, index) => ({
            ...step,
            stepId: index + 1,
          })),
        };
      });
      return;
    }

    //If stepData is not null, it means that the step should be updated
    setBundle((prevBundle: Bundle) => {
      const index = prevBundle.steps.findIndex((step: BundleStep) => {
        return step.stepId === stepData.stepId;
      });
      prevBundle.steps[index] = stepData;

      return { ...prevBundle };
    });
  };
  //Function for duplicating the step
  const duplicateBundleStepAction = (clickedFromStepId: number) => {
    setBundle((prevBundle: Bundle) => {
      if (!thereAreFreeSteps(prevBundle)) {
        return prevBundle;
      }

      const clickedStep = prevBundle.steps.find((step) => {
        return step.stepId === clickedFromStepId;
      });

      if (clickedStep) {
        const newStepId = clickedFromStepId + 1;
        const newStep: BundleStep = {
          ...clickedStep,
          stepId: newStepId,
        };

        const updatedSteps = prevBundle.steps.map((step) => {
          if (step.stepId > clickedFromStepId) {
            return { ...step, stepId: step.stepId + 1 };
          }
          return step;
        });
        return {
          ...prevBundle,
          steps: [...updatedSteps, newStep].sort((a, b) => a.stepId - b.stepId),
        };
      }
      return prevBundle;
    });
  };

  //Moving the step up (switching place with the step above it)
  const moveStepUpAction = (stepId: number) => {
    setBundle((prevBundle: Bundle) => {
      const clickedStepIndex = prevBundle.steps.findIndex((step) => {
        return step.stepId === stepId;
      });

      if (clickedStepIndex === 0) {
        return prevBundle;
      }

      const updatedSteps = prevBundle.steps.map((step, index) => {
        if (index === clickedStepIndex - 1) {
          return { ...step, stepId: step.stepId + 1 };
        }
        if (index === clickedStepIndex) {
          return { ...step, stepId: step.stepId - 1 };
        }
        return step;
      });

      return {
        ...prevBundle,
        steps: updatedSteps.sort((a, b) => a.stepId - b.stepId),
      };
    });
  };

  //Moving the step down (switching place with the step underneath it)
  const moveStepDownAction = (stepId: number) => {
    setBundle((prevBundle: Bundle) => {
      const clickedStepIndex = prevBundle.steps.findIndex((step) => {
        return step.stepId === stepId;
      });

      if (clickedStepIndex === prevBundle.steps.length - 1) {
        return prevBundle;
      }

      const updatedSteps = prevBundle.steps.map((step, index) => {
        if (index === clickedStepIndex + 1) {
          return { ...step, stepId: step.stepId - 1 };
        }
        if (index === clickedStepIndex) {
          return { ...step, stepId: step.stepId + 1 };
        }
        return step;
      });

      return {
        ...prevBundle,
        steps: updatedSteps.sort((a, b) => a.stepId - b.stepId),
      };
    });
  };

  //
  //
  //

  //Function for updating the settings of the bundle
  const updateSettings = (newBundleSettings: BundleSettings) => {
    setBundle((prevBundle: Bundle) => {
      return { ...prevBundle, settings: newBundleSettings };
    });
  };

  //
  //
  //

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
                onAction: () => {},
              },
            ]}
          >
            <Form
              data-save-bar
              data-discard-confirmation
              method="post"
              action="/app/create-bundle"
            >
              <BlockStack gap={GapBetweenSections}>
                <Layout>
                  <Layout.Section variant="oneThird">
                    <BlockStack gap={GapBetweenSections}>
                      <Card>
                        <BlockStack gap={GapBetweenTitleAndContent}>
                          <Text as="h2" variant="headingSm">
                            Bundle title
                          </Text>
                          <TextField
                            label="Title"
                            autoComplete="off"
                            name="title"
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

                      {bundle.steps.map((step) => (
                        <BundleStepComponent
                          key={step.stepId}
                          stepData={step}
                          updateStepData={updateStepData}
                          duplicateBundleStepAction={duplicateBundleStepAction}
                          moveStepUpAction={moveStepUpAction}
                          moveStepDownAction={moveStepDownAction}
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
                      <BundleSettingsComponent
                        updateSettings={updateSettings}
                        bundleSettings={bundle.settings}
                      />
                      <Divider borderColor="transparent" />
                    </BlockStack>
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
            </Form>
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
                },
              ]}
            />
          </Page>
        </>
      )}
    </>
  );
}
