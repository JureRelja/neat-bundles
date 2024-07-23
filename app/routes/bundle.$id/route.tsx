import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import fs from "fs";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const path = fs.readFileSync("../../test.liquid", "utf-8");
  return new Response(path, {
    headers: {
      "Content-Type": "application/liquid",
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {};
