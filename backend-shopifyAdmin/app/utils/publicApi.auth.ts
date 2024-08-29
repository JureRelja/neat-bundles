import { json } from "@remix-run/node";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";

// Function to check if the bundle is published and belongs to the store
export async function checkPublicAuth(
  storeUrl: string | null,
  bundleId: string | null,
) {
  // Check if storeUrl is provided
  if (!storeUrl) {
    return json(
      new JsonData(
        false,
        "error",
        "There was an error with your request. 'storeUrl' wasn't specified.",
      ),
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
      new JsonData(
        false,
        "error",
        "There was an error with your request. 'bundleId' wasn't specified.",
      ),
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
      new JsonData(
        false,
        "error",
        "There was an error with your request. Requested bundle either doesn't exist or it's not active.",
      ),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  }
}
