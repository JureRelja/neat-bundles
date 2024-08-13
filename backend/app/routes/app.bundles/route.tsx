import { redirect, json } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import db from "../../db.server";
import { Bundle } from "@prisma/client";
import { JsonData } from "../../types/jsonData";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "createBundle": {
      const allUserBundles: Bundle[] = await db.bundle.findMany({
        where: {
          user: {
            storeUrl: session.shop,
          },
        },
      });

      const bundle: Bundle = await db.bundle.create({
        data: {
          user: {
            connect: {
              storeUrl: session.shop,
            },
          },
          title: "New bundle " + (allUserBundles.length + 1),
          bundleSettings: {
            create: {},
          },
          steps: {
            create: [
              {
                stepNumber: 1,
                title: "Step 2",
                stepType: "PRODUCT",
                productStep: {
                  create: {},
                },
              },
              {
                stepNumber: 2,
                title: "Step 2",
                stepType: "PRODUCT",
                productStep: {
                  create: {},
                },
              },
              {
                stepNumber: 3,
                title: "Step 3",
                stepType: "PRODUCT",
                productStep: {
                  create: {},
                },
              },
            ],
          },
        },
      });
      return redirect(`/app/bundles/${bundle.id}`);
    }

    default: {
      return json(
        {
          ...new JsonData(
            true,
            "success",
            "This is the default action that doesn't do anything.",
          ),
        },
        { status: 200 },
      );
    }
  }
};
