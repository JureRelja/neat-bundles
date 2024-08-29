import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  bundleAllResources,
  BundleAllResources,
  BundleBasicAndSettings,
} from "~/types/Bundle";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";
import { checkPublicAuth } from "~/utils/publicApi.auth";
import { ReadCache, WriteCache } from "../cache";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  //Get query params
  const bundleId = url.searchParams.get("bundleId");
  const stepNumber = url.searchParams.get("stepNum");
  const storeUrl = url.searchParams.get("storeUrl");

  await checkPublicAuth(storeUrl, bundleId); //Public auth check

  //Cache aside
  const key = `api/bundleData/${storeUrl}/${bundleId}/${stepNumber}`;
  const cacheData = await ReadCache(key);

  if (cacheData) {
    return json(
      new JsonData(
        true,
        "success",
        "Bundle succesfuly retirieved.",
        [],
        cacheData,
        true,
      ),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  } else {
    let data: BundleAllResources | BundleBasicAndSettings | null = null;
    // Returning bundle alone or with selected step
    if (bundleId && stepNumber) {
      try {
        data = (await db.bundle.findUnique({
          where: {
            id: Number(bundleId),
          },
          include: {
            ...bundleAllResources,
            steps: {
              include: {
                productsData: true,
                contentInputs: true,
              },
              where: {
                stepNumber: Number(stepNumber),
              },
              orderBy: {
                stepNumber: "asc",
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
          include: {
            ...bundleAllResources,
            steps: {
              include: {
                productsData: true,
                contentInputs: true,
              },
              orderBy: {
                stepNumber: "asc",
              },
            },
          },
        })) as BundleAllResources;
      } catch (error) {
        console.log(error);
      }
    }

    if (!data) {
      return json(
        new JsonData(
          false,
          "error",
          "There was an error with your request. 'stepNum' or 'stepId' doesn't belong to this bundle.",
        ),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          status: 200,
        },
      );
    }

    //Write to cache
    await WriteCache(key, data);

    return json(
      new JsonData(false, "success", "Bundle succesfuly retirieved.", [], data),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  }
};
