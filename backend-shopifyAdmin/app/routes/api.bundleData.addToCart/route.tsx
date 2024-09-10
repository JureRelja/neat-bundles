import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { bundleAndSteps } from "~/types/Bundle";
import db from "~/db.server";
import { JsonData } from "~/types/jsonData";
import { checkPublicAuth } from "~/utils/publicApi.auth";

export const action = async ({ request }: ActionFunctionArgs) => {
  const res = await checkPublicAuth(request); //Public auth check

  console.log(request);
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
    const formData = await request.formData();

    const customerInputs = formData.get("customerInputs");

    console.log(formData);
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
};
