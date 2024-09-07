import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { bundleAndSteps, BundleAndStepsBasicServer } from "~/types/Bundle";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";
import { checkPublicAuth } from "~/utils/publicApi.auth";
import { ApiCacheService } from "../../utils/ApiCacheService";

import { ApiCacheKeyService } from "~/utils/ApiCacheKeyService";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const res = await checkPublicAuth(request); //Public auth check

    if (!res.ok)
      return json(res, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      });

    //Get query params
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop") as string;
    const bundleId = url.searchParams.get("bundleId");

    try {
      if (request.headers.get("Content-Type") === "multipart/form-data") {
        const formData = request.formData();

        console.log(formData);
      }
    } catch (error) {
      console.log(error);
    }

    return json(
      new JsonData(false, "success", "Bundle succesfuly added to cart.", []),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  } catch (error) {
    return json(
      new JsonData(
        true,
        "error",
        "Error occured while adding bundle to cart.",
        [],
      ),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  }
};
