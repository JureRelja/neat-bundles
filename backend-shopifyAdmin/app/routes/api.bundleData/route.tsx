import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  BundleAllResources,
  BundleAndStepsBasicServer,
  bundleAndSteps,
} from "~/types/Bundle";
import db from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  //Get query params
  const bundleId = url.searchParams.get("bundleId");
  const stepId = url.searchParams.get("stepId");
  const stepNumber = url.searchParams.get("stepNum");
  const storeUrl = url.searchParams.get("storeUrl");

  // Check if storeUrl is provided
  if (!storeUrl) {
    return json(
      { msg: "No 'storeUrl' specified." },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  }

  // Check if bundleId is provided
  if (!bundleId) {
    return json(
      { msg: "No 'bundleId' specified." },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  }

  //Checking if the the bundle is published and belongs to the store
  const bundle = await db.bundle.findUnique({
    where: {
      id: Number(bundleId),
    },
    select: {
      published: true,
      storeUrl: true,
    },
  });

  if (!bundle || !bundle.published || bundle.storeUrl !== storeUrl) {
    return json(
      { msg: "Bundle not found or not published." },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  }

  let data: BundleAllResources | BundleAndStepsBasicServer | null = null;
  // Returning bundle alone or with selected step
  if (bundleId && stepNumber) {
    try {
      data = (await db.bundle.findUnique({
        where: {
          id: Number(bundleId),
        },
        include: {
          steps: {
            where: {
              stepNumber: Number(stepNumber),
            },
          },
        },
      })) as BundleAllResources;
    } catch (error) {
      console.log(error);
    }
  } else if (bundleId && stepId) {
    try {
      data = (await db.bundle.findUnique({
        where: {
          id: Number(bundleId),
        },
        include: {
          steps: {
            where: {
              id: Number(stepId),
            },
          },
        },
      })) as BundleAllResources;
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      data = (await db.bundle.findUnique({
        where: {
          id: Number(bundleId),
        },
        select: bundleAndSteps,
      })) as BundleAndStepsBasicServer;
    } catch (error) {
      console.log(error);
    }
  }

  if (!data) {
    return json(
      { msg: "Specified 'stepNum' or 'stepId' doesn't belong to this bundle." },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  }

  return json(data, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    status: 200,
  });
};
