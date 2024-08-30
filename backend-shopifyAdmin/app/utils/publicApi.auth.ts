import { json } from "@remix-run/node";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";

// Function to check if the bundle is published and belongs to the store
export async function checkPublicAuth(
  storeUrl: string | null,
  bundleId: string | null,
): Promise<JsonData<undefined>> {
  // Check if storeUrl is provided
  if (!storeUrl) {
    return new JsonData(
      false,
      "error",
      "There was an error with your request. 'storeUrl' wasn't specified.",
    );
  }

  // Check if bundleId is provided
  if (!bundleId) {
    return new JsonData(
      false,
      "error",
      "There was an error with your request. 'bundleId' wasn't specified.",
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
    return new JsonData(
      false,
      "error",
      "There was an error with your request. Requested bundle either doesn't exist or it's not active.",
    );
  } else {
    return new JsonData(
      true,
      "success",
      "Bundle is published and belongs to the store.",
    );
  }
}
