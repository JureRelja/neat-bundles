import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";
import { checkPublicAuth } from "~/utils/publicApi.auth";
import { ApiCacheService } from "../../utils/ApiCacheService";
import { BundleStepAllResources, bundleStepFull } from "~/types/BundleStep";
import { ApiCacheKeyService } from "~/utils/ApiCacheKeyService";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const res = await checkPublicAuth(request); //Public auth check
  if (!res.ok)
    return json(res, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });

  const url = new URL(request.url);

  //Get query params
  const stepNumber = url.searchParams.get("stepNum");
  const bundleId = url.searchParams.get("bundleId");
  const shop = url.searchParams.get("shop") as string;

  //Cache aside
  const cacheKey = new ApiCacheKeyService(shop);

  const cache = new ApiCacheService(
    cacheKey.getStepKey(url.searchParams.get("bundleId")),
  );

  const cacheData = await cache.readCache();

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
    // Returning bundle alone or with selected step
    try {
      const bundleStep: BundleStepAllResources[] | null =
        await db.bundleStep.findMany({
          where: {
            bundleId: Number(bundleId),
            stepNumber: Number(stepNumber),
          },
          include: bundleStepFull,
        });

      if (!bundleStep) {
        return json(
          new JsonData(
            false,
            "error",
            "There was an error with your request. Requested step either doesn't exist or it's not active.",
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
      await cache.writeCache(bundleStep);

      return json(
        new JsonData(
          false,
          "success",
          "Bundle succesfuly retirieved.",
          [],
          bundleStep,
        ),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          status: 200,
        },
      );
    } catch (error) {
      console.error(error);
    }
  }
};