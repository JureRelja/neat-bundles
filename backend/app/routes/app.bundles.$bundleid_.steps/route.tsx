import {
  ChoiceList,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Text,
  ButtonGroup,
  TextField,
  Divider,
  InlineGrid,
  SkeletonPage,
  Page,
  Badge,
  Layout,
} from "@shopify/polaris";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  DeleteIcon,
  PageAddIcon,
} from "@shopify/polaris-icons";
import {
  GapBetweenSections,
  GapInsideSection,
  HorizontalGap,
  GapBetweenTitleAndContent,
} from "../../constants";
import { StepType, ProductResourceType } from "@prisma/client";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useNavigation,
  useSubmit,
  useLoaderData,
  useNavigate,
  Outlet,
} from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import db from "../../db.server";
import { JsonData } from "../../types/jsonData";
import { bundleStepBasic, BundleStepBasicResources } from "~/types/BundleStep";
import { useEffect, useRef, useState } from "react";
import styles from "./route.module.css";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  let bundleStep: BundleStepBasicResources | null;

  if (!params.stepId) {
    bundleStep = await db.bundleStep.findFirst({
      where: {
        bundleId: Number(params.bundleid),
        stepNumber: Number(1),
      },
      select: bundleStepBasic,
    });
  } else {
    bundleStep = await db.bundleStep.findUnique({
      where: {
        id: Number(params.stepId),
      },
      select: bundleStepBasic,
    });
  }

  if (!bundleStep) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return json(
    new JsonData(
      true,
      "success",
      "Bundle step succesfuly retrieved",
      "",
      bundleStep,
    ),
    { status: 200 },
  );
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action") as string;

  switch (action) {
    //Adding a new step to the bundle
    case "addStep": {
      try {
        console.log("Adding a new step to the bundle");
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

export default function Index({}) {
  const submit = useSubmit();
  const navigate = useNavigate();
  const nav = useNavigation();
  const shopify = useAppBridge();
  const isLoading = nav.state != "idle";

  const stepData: BundleStepBasicResources =
    useLoaderData<typeof loader>().data;

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
        <SkeletonPage />
      ) : (
        <Page
          fullWidth
          titleMetadata={
            stepData.stepType === StepType.PRODUCT ? (
              <Badge tone="warning">Product step</Badge>
            ) : (
              <Badge>Content step</Badge>
            )
          }
          backAction={{
            content: "Products",
            onAction: async () => {
              // Save or discard the changes before leaving the page
              await shopify.saveBar.leaveConfirmation();
              navigate(-1);
            },
          }}
          title={`Edit step - ${stepData.stepNumber}`}
        >
          <Layout>
            <Layout.Section variant="oneThird">
              <Outlet />
            </Layout.Section>
            <Layout.Section>
              <div
                ref={previewBoxRef}
                className={`${sticky.isSticky ? styles.sticky : ""}`}
              >
                <Card></Card>
                {/* <BundlePreview /> */}
              </div>
            </Layout.Section>
          </Layout>
        </Page>
      )}
    </>
  );
}
