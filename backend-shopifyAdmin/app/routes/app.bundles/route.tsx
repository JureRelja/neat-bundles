import { redirect, json, Outlet } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import db from "../../db.server";
import { Bundle } from "@prisma/client";
import { JsonData } from "../../types/jsonData";
import { bundleTagIndentifier } from "~/constants";

export const loader = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  // const formData = await request.formData();
  // if (!formData) {
  //   return redirect("/app");
  // }

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
          where: {
            storeUrl: session.shop,
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

      const productData = await response.json();

      //Create a new page for displaying the new bundle
      const bundlePage = new admin.rest.resources.Page({
        session: session,
      });

      (bundlePage.title = `Neat Bundle ${_max.id ? _max.id : ""}`),
        (bundlePage.body = "This is a new bundle page");

      await bundlePage.save({
        update: true,
      });

      //Create a new bundle in the database
      const bundle: Bundle = await db.bundle.create({
        data: {
          user: {
            connect: {
              storeUrl: session.shop,
            },
          },
          title: `New bundle ${_max.id ? _max.id : ""}`,
          shopifyProductId: productData.data.productCreate.product.id,
          shopifyPageId: bundlePage.id?.toString() || "",
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
                title: "Step 1",
                stepType: "PRODUCT",
                productsData: {
                  create: {},
                },
                contentInputs: {
                  create: [{}, {}],
                },
              },
              {
                stepNumber: 2,
                title: "Step 2",
                stepType: "PRODUCT",
                productsData: {
                  create: {},
                },
                contentInputs: {
                  create: [{}, {}],
                },
              },
              {
                stepNumber: 3,
                title: "Step 3",
                stepType: "PRODUCT",
                productsData: {
                  create: {},
                },
                contentInputs: {
                  create: [{}, {}],
                },
              },
            ],
          },
        },
      });

      //Adding the bundle id to the page metafields for easier identification
      const createdBundlePage = await admin.rest.resources.Page.find({
        session: session,
        id: Number(bundle.shopifyPageId),
      });

      if (createdBundlePage) {
        createdBundlePage.metafields = [
          {
            key: "bundle_id_page",
            value: bundle.id,
            type: "number_integer",
            namespace: "neat_bundles_app",
          },
        ];

        await createdBundlePage.save({
          update: true,
        });
      }

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
