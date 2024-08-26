import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { sessionHandler, commitSession } from "../store.sessions";
import { redisClient } from "~/shopify.server";
import { bundleAllResources, BundleAllResources } from "~/types/Bundle";
import db from "~/db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await sessionHandler(request);

  const url = new URL(request.url);

  const bundleId = url.searchParams.get("bundleId");

  const customerId = session.get("customerId") as string;

  let bundlesJson: string = (await redisClient.hGet(
    customerId,
    "activeBundles",
  )) as string;

  const activeBundles: BundleAllResources[] = JSON.parse(bundlesJson);

  let newActiveBundle: BundleAllResources | null = null;

  if (bundleId) {
    try {
      newActiveBundle = await db.bundle.findUnique({
        where: {
          id: Number(bundleId),
        },
        include: bundleAllResources,
      });
    } catch (error) {
      console.log(error);
    }
  }

  console.log(newActiveBundle, bundleId);

  if (newActiveBundle) {
    activeBundles.push(newActiveBundle);
    redisClient.hSet(
      customerId,
      "activeBundles",
      JSON.stringify(activeBundles),
    );
  }

  console.log(activeBundles);

  return json({
    headers: {
      "Set-Cookie": await commitSession(session),
      "Access-Control-Allow-Origin": "*",
    },
    status: 200,
  });
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const session = await sessionHandler(request);
};
