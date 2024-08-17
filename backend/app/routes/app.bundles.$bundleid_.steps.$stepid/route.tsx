import { json, redirect } from "@remix-run/node";
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
  SkeletonPage,
  PageActions,
  SkeletonBodyText,
  SkeletonDisplayText,
  InlineGrid,
  InlineStack,
  ButtonGroup,
  ChoiceList,
  Divider,
} from "@shopify/polaris";
import { useAppBridge, Modal, TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { useState } from "react";
import {
  GapBetweenSections,
  GapBetweenTitleAndContent,
  GapInsideSection,
  HorizontalGap,
} from "../../constants";
import db from "../../db.server";
import { BundleStep, ProductResourceType, StepType } from "@prisma/client";
import { BundleStepAllResources, bundleStepFull } from "~/types/BundleStep";
import { JsonData } from "../../types/jsonData";
import ContentStepInputs from "./content-step-inputs";
import ResourcePicker from "./resource-picker";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const stepData: BundleStepAllResources | null =
    await db.bundleStep.findUnique({
      where: {
        id: Number(params.stepid),
      },
      include: bundleStepFull,
    });

  if (!stepData) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return json({
    ...new JsonData(true, "success", "Step data was loaded", "", stepData),
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action") as string;

  switch (action) {
    //Deleting the step from the bundle
    case "deleteStep": {
      try {
        const step: BundleStep = await db.bundleStep.delete({
          where: {
            id: Number(params.stepId),
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

      return redirect(`/app/bundles/${params.bundleid}`);
    }

    //Duplicating the step
    // case "duplicateStep": {
    //   try {
    //     let stepToDuplicate: BundleStepWithAllResources | null =
    //       await db.bundleStep.findFirst({
    //         where: {
    //           bundleId: Number(params.id),
    //           stepNumber: Number(formData.get("stepNumber")),
    //         },
    //         include: {

    //         },
    //       });

    //     if (!stepToDuplicate) {
    //       return json(
    //         {
    //           ...new JsonData(
    //             false,
    //             "error",
    //             "Thre was an error with your request",
    //             "Requested step for duplication doesn't exist.",
    //           ),
    //         },
    //         { status: 400 },
    //       );
    //     }

    //     //Creating a new step with the same data as the duplicated step
    //     await db.bundleStep.create({
    //       data: {
    //         bundleId: Number(params.id),
    //         stepNumber: Number(formData.get("stepNumber")) + 1,
    //         title: stepToDuplicate.title,
    //         stepType: stepToDuplicate.stepType,
    //         description: stepToDuplicate.description,
    //         productResources: stepToDuplicate.productResources,
    //         resourceType: stepToDuplicate.resourceType,
    //         minProductsOnStep: stepToDuplicate.minProductsOnStep,
    //         maxProductsOnStep: stepToDuplicate.maxProductsOnStep,
    //         allowProductDuplicates: stepToDuplicate.allowProductDuplicates,
    //         showProductPrice: stepToDuplicate.showProductPrice,
    //         contentInputs: {
    //           create: stepToDuplicate.contentInputs.map(
    //             (contentInput: ContentInput) => {
    //               return {
    //                 inputType: contentInput.inputType,
    //                 inputLabel: contentInput.inputLabel,
    //                 maxChars: contentInput.maxChars,
    //                 required: contentInput.required,
    //               };
    //             },
    //           ),
    //         },
    //       },
    //     });

    //     //Incrementing the step number for all steps with stepNumber greater than the duplicated step
    //     await db.bundleStep.updateMany({
    //       where: {
    //         bundleId: Number(params.id),
    //         stepNumber: {
    //           gte: Number(formData.get("stepNumber")),
    //         },
    //       },
    //       data: {
    //         stepNumber: {
    //           increment: 1,
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
    //           "Error while duplicating a step",
    //           "Make sure that your entered correct data.",
    //         ),
    //       },
    //       { status: 400 },
    //     );
    //   }
    //   return json(
    //     { ...new JsonData(true, "success", "Step was succesfuly duplicated") },
    //     { status: 200 },
    //   );
    // }

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

  const serverStepData: BundleStepAllResources =
    useLoaderData<typeof loader>().data;

  const [stepData, setStepData] =
    useState<BundleStepAllResources>(serverStepData);

  const updateSelectedResources = (selectedResources: string[]) => {
    setStepData((stepData: BundleStepAllResources) => {
      if (!stepData.productStep) return stepData;

      return {
        ...stepData,
        productStep: {
          ...stepData.productStep,
          productResources: selectedResources,
        },
      };
    });
  };

  return (
    <>
      {isLoading ? (
        <SkeletonPage primaryAction fullWidth></SkeletonPage>
      ) : (
        <Card>
          <BlockStack gap={GapBetweenSections}>
            <BlockStack gap={GapInsideSection}>
              <TextField
                label="Step title"
                value={stepData.title}
                onChange={(newTitle) => {}}
                autoComplete="off"
                name={`stepTitle`}
              />
              <TextField
                label="Step description"
                value={stepData.description}
                name={`stepDescription`}
                onChange={(newDesc) => {}}
                autoComplete="off"
              />
            </BlockStack>
            <ChoiceList
              title="Step type:"
              name={`stepType`}
              choices={[
                {
                  label: "Product step",
                  value: StepType.PRODUCT,
                  helpText: `Customers can choose products on this step`,
                },
                {
                  label: "Content step",
                  value: StepType.CONTENT,
                  helpText: `Customer can add text or images on this step`,
                },
              ]}
              selected={[stepData.stepType]}
              onChange={(selected: string[]) => {}}
            />

            <Divider borderColor="border-inverse" />
            {stepData.stepType === StepType.PRODUCT ? (
              <>
                <BlockStack gap={GapInsideSection}>
                  <ChoiceList
                    title="Display products:"
                    name={`productResourceType`}
                    choices={[
                      {
                        label: "Selected products",
                        value: ProductResourceType.PRODUCT,
                      },
                      {
                        label: "Selected collections",
                        value: ProductResourceType.COLLECTION,
                      },
                    ]}
                    selected={[stepData.productStep?.resourceType as string]}
                    onChange={(selected: string[]) => {}}
                  />

                  <ResourcePicker
                    resourceType={
                      stepData.productStep?.resourceType as ProductResourceType
                    }
                    selectedResources={
                      stepData.productStep?.productResources as string[]
                    }
                    updateSelectedResources={updateSelectedResources}
                  />
                </BlockStack>

                <Divider />
                <BlockStack gap={GapInsideSection}>
                  <Text as="p">Rules</Text>

                  <InlineGrid columns={2} gap={HorizontalGap}>
                    <TextField
                      label="Minimum products to select"
                      type="number"
                      autoComplete="off"
                      inputMode="numeric"
                      name={`minProductsToSelect`}
                      min={1}
                      value={stepData.productStep?.minProductsOnStep.toString()}
                      onChange={(value) => {}}
                    />

                    <TextField
                      label="Maximum products to select"
                      type="number"
                      autoComplete="off"
                      inputMode="numeric"
                      name={`maxProductsToSelect`}
                      min={1}
                      value={stepData.productStep?.maxProductsOnStep.toString()}
                      onChange={(value) => {}}
                    />
                  </InlineGrid>
                  <ChoiceList
                    title="Display products"
                    allowMultiple
                    name={`displayProducts`}
                    choices={[
                      {
                        label:
                          "Allow customers to select one product more than once",
                        value: "allowProductDuplicates",
                      },
                      {
                        label: "Show price under each product",
                        value: "showProductPrice",
                      },
                    ]}
                    selected={[
                      stepData.productStep?.allowProductDuplicates
                        ? "allowProductDuplicates"
                        : "",
                      stepData.productStep?.showProductPrice
                        ? "showProductPrice"
                        : "",
                    ]}
                    onChange={(selectedValues) => {}}
                  />
                </BlockStack>
              </>
            ) : (
              <BlockStack gap={GapBetweenSections}>
                {/* {stepData.map((contentInput, index) => (
                  <ContentStepInputs
                    key={contentInput.id}
                    contentInput={contentInput}
                    inputId={index + 1}
                    updateContentInput={updateContentInput}
                    stepNumber={stepData.stepNumber}
                  />
                ))} */}
              </BlockStack>
            )}
          </BlockStack>
        </Card>
      )}
    </>
  );
}
