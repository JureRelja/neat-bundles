import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";
import { checkPublicAuth } from "~/utils/publicApi.auth";
import { ApiEndpoint, Cache } from "../../utils/cache";
import {
  settingsIncludeAll,
  SettingsWithAllResources,
} from "~/types/BundleSettings";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log(request);

  const res = await checkPublicAuth(request); //Public auth check
  if (!res.ok)
    return json(res, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });

  //Cache aside
  const cache = new Cache(request, ApiEndpoint.BundleStep);
  const cacheData = await cache.readCache();

  const url = new URL(request.url);

  //Get query params
  const bundleId = url.searchParams.get("bundleId");
  const stepNumber = url.searchParams.get("stepNum");
  const storeUrl = url.searchParams.get("shop");

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
    try {
      let bundleSettings: SettingsWithAllResources | null =
        await db.bundleSettings.findUnique({
          where: {
            bundleId: Number(bundleId),
          },
          include: settingsIncludeAll,
        });

      if (!bundleSettings) {
        return json(
          new JsonData(
            false,
            "error",
            "There was an error with your request. 'stepNum' doesn't exist for this bundle.",
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
      await cache.writeCache(bundleSettings);

      return json(
        new JsonData(
          false,
          "success",
          "Bundle succesfuly retirieved.",
          [],
          bundleSettings,
        ),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          status: 200,
        },
      );
    } catch (error) {
      console.log(error);
    }
  }
};
