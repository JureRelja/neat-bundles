import { redirect, json, Outlet } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import db from "../../db.server";
import { Bundle } from "@prisma/client";
import { JsonData } from "../../types/jsonData";
import { bundleTagIndentifier } from "~/constants";

export const loader = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "createBundle": {
      const { _max }: { _max: { id: number | null } } =
        await db.bundle.aggregate({
          _max: {
            id: true,
          },
        });

      //Create a new product that will be used as a bundle wrapper
      const response = await admin.graphql(
        `#graphql
        mutation productCreate($productInput: ProductInput!) {
          productCreate(input: $productInput) {
            product {
              id
            }
          }
        }`,
        {
          variables: {
            productInput: {
              title: `Neat Bundle ${_max.id ? _max.id : ""}`,
              productType: "Neat Bundle",
              vendor: "Neat Bundles",
              published: true,
              tags: [bundleTagIndentifier],
            },
          },
        },
      );

      const data = await response.json();

      const bundle: Bundle = await db.bundle.create({
        data: {
          user: {
            connect: {
              storeUrl: session.shop,
            },
          },
          title: `New bundle ${_max.id ? _max.id : ""}`,
          shopifyId: data.data.productCreate.product.id,
          bundleSettings: {
            create: {
              bundleColors: {
                create: {},
              },
              bundleLabels: {
                create: {},
              },
            },
          },
          steps: {
            create: [
              {
                stepNumber: 1,
                title: "Step 2",
                stepType: "PRODUCT",
                productsData: {
                  create: {},
                },
              },
              {
                stepNumber: 2,
                title: "Step 2",
                stepType: "PRODUCT",
                productsData: {
                  create: {},
                },
              },
              {
                stepNumber: 3,
                title: "Step 3",
                stepType: "PRODUCT",
                productsData: {
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

export default function Index() {
  return <Outlet />;
}
