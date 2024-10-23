import { json, redirect } from "@remix-run/node";
import { useNavigate, useNavigation, useLoaderData, Outlet } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Card, BlockStack, Text, SkeletonPage, SkeletonBodyText, InlineStack, Badge, Divider } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { GapBetweenTitleAndContent, GapInsideSection } from "../../constants";
import db from "../../db.server";
import { BundleFullStepBasicClient, inclBundleFullStepsBasic } from "../../adminBackend/service/dto/Bundle";
import { error, JsonData } from "../../adminBackend/service/dto/jsonData";
import { useNavigateSubmit } from "../../hooks/useNavigateSubmit";
import { BundleBuilder, BundleDiscountType, BundlePricing } from "@prisma/client";
import { BundleBuilderRepository } from "~/adminBackend/repository/impl/BundleBuilderRepository";
import { shopifyBundleBuilderProductRepository } from "~/adminBackend/repository/impl/ShopifyBundleBuilderProductRepository";
import { ShopifyBundleBuilderPageRepository } from "~/adminBackend/repository/ShopifyBundleBuilderPageRepository";
import { ApiCacheKeyService } from "~/adminBackend/service/utils/ApiCacheKeyService";
import { ApiCacheService } from "~/adminBackend/service/utils/ApiCacheService";
import shopifyBundleBuilderPageRepositoryGraphql from "@adminBackend/repository/impl/ShopifyBundleBuilderPageRepositoryGraphql";
import styles from "./route.module.css";
import { DiscountType } from "@shopifyGraphql/graphql";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const bundleBuilder = await db.bundleBuilder.findUnique({
        where: {
            id: Number(params.bundleid),
        },
        include: {
            ...inclBundleFullStepsBasic,
        },
    });

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    return json(new JsonData(true, "success", "Bundle succesfuly retrieved", [], bundleBuilder), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get("action");

    switch (action) {
        case "deleteBundle": {
            try {
                //Delete the bundle along with its steps, contentInputs, bundleSettings?, bundleColors, and bundleLabels
                const bundleBuilderToDelete = await db.bundleBuilder.update({
                    where: {
                        id: Number(params.bundleid),
                    },
                    data: {
                        deleted: true,
                    },
                    select: {
                        shopifyProductId: true,
                        shopifyPageId: true,
                    },
                });

                if (!bundleBuilderToDelete)
                    return json(
                        {
                            ...new JsonData(false, "error", "There was an error with your request", [
                                {
                                    fieldId: "bundleId",
                                    field: "Bundle ID",
                                    message: "Bundle with the provided id doesn't exist.",
                                },
                            ]),
                        },
                        { status: 400 },
                    );

                const shopifyBundleBuilderPage: ShopifyBundleBuilderPageRepository = shopifyBundleBuilderPageRepositoryGraphql;

                await Promise.all([
                    //Deleting a associated bundle page
                    shopifyBundleBuilderPage.deletePage(admin, session, bundleBuilderToDelete.shopifyPageId),

                    //Deleting a associated bundle product
                    shopifyBundleBuilderProductRepository.deleteBundleBuilderProduct(admin, bundleBuilderToDelete.shopifyProductId),
                ]);
            } catch (error) {
                console.log(error, "Either the bundle product or the bundle page was already deleted.");
            } finally {
                const url: URL = new URL(request.url);

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await ApiCacheService.multiKeyDelete(await cacheKeyService.getAllBundleKeys(params.bundleid as string));

                if (url.searchParams.get("redirect") === "true") {
                    return redirect("/app");
                }

                return json({ ...new JsonData(true, "success", "Bundle deleted") }, { status: 200 });
            }
        }

        case "updatedDiscount": {
            const url = new URL(request.url);

            const discountType = formData.get("discountType");
            const discountValue = formData.get("discountValue");

            if (!discountType || !discountValue) {
                throw Error("Discount type and value are required");
            }

            await db.bundleBuilder.update({
                where: {
                    id: Number(params.bundleid),
                },
                data: {
                    discountValue: Number(discountValue),
                    discountType: discountType as BundleDiscountType,
                },
            });

            try {
                //redirect user to finish step if he is onboarding
                if (url.searchParams.get("onboarding") === "true" && url.searchParams.get("stepNumber") === "5") {
                    return redirect(`/app/create-bundle-builder/${params.bundleid}/step-6`);
                }
            } catch (error) {
                console.log(error);
            }
        }

        //Update the bundle
        case "updateBundle":
            const bundleData: BundleBuilder = JSON.parse(formData.get("bundle") as string);

            const errors: error[] = [];

            if (!bundleData.title) {
                errors.push({
                    fieldId: "bundleTitle",
                    field: "Bundle title",
                    message: "Please enter a bundle title.",
                });
            } else if (bundleData.pricing === BundlePricing.FIXED && (!bundleData.priceAmount || bundleData.priceAmount < 0)) {
                errors.push({
                    fieldId: "priceAmount",
                    field: "Price amount",
                    message: "Please enter a valid price for Fixed bundle.",
                });
            } else if (bundleData.discountType != "NO_DISCOUNT" && bundleData.discountValue <= 0) {
                errors.push({
                    fieldId: "discountValue",
                    field: "Discount value",
                    message: "Please enter a desired discount.",
                });
            } else if (bundleData.discountType === "FIXED" && bundleData.pricing === "FIXED" && bundleData.discountValue > (bundleData.priceAmount || 0)) {
                errors.push({
                    fieldId: "discountValue",
                    field: "Discount value",
                    message: "Discount amount can't be heigher that the bundle price.",
                });
            }

            if (errors.length > 0)
                return json({
                    ...new JsonData(false, "error", "There was an error while trying to update the bundle.", errors, bundleData),
                });

            //Repository for creating a new page
            const shopifyBundleBuilderPage: ShopifyBundleBuilderPageRepository = shopifyBundleBuilderPageRepositoryGraphql;

            try {
                await Promise.all([
                    db.bundleBuilder.update({
                        where: {
                            id: Number(bundleData.id),
                        },
                        data: {
                            title: bundleData.title,
                            published: bundleData.published,
                            priceAmount: bundleData.priceAmount,
                            pricing: bundleData.pricing,
                            discountType: bundleData.discountType,
                            discountValue: bundleData.discountValue,
                        },
                    }),
                    shopifyBundleBuilderProductRepository.updateBundleProductTitle(admin, bundleData.shopifyProductId, bundleData.title),
                    shopifyBundleBuilderPage.updateBundleBuilderPageTitle(admin, session, bundleData.shopifyPageId, bundleData.title),
                ]);

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string));

                const saveBtn = formData.get("submitBtn");

                if (saveBtn === "saveAndExitBtn") {
                    return redirect("/app");
                }

                return json({ ...new JsonData(true, "success", "Bundle updated") }, { status: 200 });

                //return redirect(`/app`);
            } catch (error) {
                console.log(error);

                return json({
                    ...new JsonData(false, "error", "There was an error while trying to update the bundle.", [
                        {
                            fieldId: "Bundle",
                            field: "Bundle",
                            message: "Error updating the bundle",
                        },
                    ]),
                });
            }

        case "recreateBundleBuilder": {
            //Repository for creating a new page
            const shopifyBundleBuilderPage: ShopifyBundleBuilderPageRepository = shopifyBundleBuilderPageRepositoryGraphql;

            const bundleBuilder = await db.bundleBuilder.findUnique({
                where: {
                    id: Number(params.bundleid),
                },
                include: inclBundleFullStepsBasic,
            });

            if (!bundleBuilder) {
                return json(
                    {
                        ...new JsonData(false, "error", "There was an error with your request", [
                            {
                                fieldId: "bundleId",
                                field: "Bundle ID",
                                message: "Bundle with the provided id doesn't exist.",
                            },
                        ]),
                    },
                    { status: 400 },
                );
            }

            await Promise.all([
                new Promise(async (res, rej) => {
                    //Check if the bundle builder product exists (it may have been deleted by the user on accident)
                    const doesBundleBuilderProductExist = await shopifyBundleBuilderProductRepository.checkIfProductExists(admin, bundleBuilder.shopifyProductId);

                    if (!doesBundleBuilderProductExist) {
                        //create new product
                        const newBundleBuilderProductId = await shopifyBundleBuilderProductRepository.createBundleProduct(admin, bundleBuilder.title, session.shop);

                        //set bundle product to new product
                        await BundleBuilderRepository.updateBundleBuilderProductId(Number(params.bundleid), newBundleBuilderProductId);
                    }
                    res(null);
                }),

                new Promise(async (res, rej) => {
                    //Check if the page exists
                    const doesBundleBuilderPageExist = await shopifyBundleBuilderPage.checkIfPageExists(admin, bundleBuilder.shopifyPageId);

                    if (!doesBundleBuilderPageExist) {
                        //create new page
                        const newBundleBuilderPage = await shopifyBundleBuilderPage.createPageWithMetafields(admin, session, bundleBuilder.title, Number(params.bundleid));

                        //set bundle page to new page
                        await BundleBuilderRepository.updateBundleBuilderPage(Number(params.bundleid), newBundleBuilderPage);
                    }
                    res(null);
                }),
            ]);

            return json({ ...new JsonData(true, "success", "Bundle builder refreshed") }, { status: 200 });
        }

        // case "duplicateBundle":
        //   const bundleToDuplicate: BundleAllResources | null =
        //     await db.bundle.findUnique({
        //       where: {
        //         id: Number(params.bundleid),
        //       },
        //       include: bundleAllResources,
        //     });

        //   if (!bundleToDuplicate) {
        //     return json(
        //       {
        //         ...new JsonData(
        //           false,
        //           "error",
        //           "There was an error with your request",
        //           "The bundle you are trying to duplicate does not exist",
        //         ),
        //       },
        //       { status: 400 },
        //     );
        //   }

        //   try {
        //     //Create a new product that will be used as a bundle wrapper
        //     const { _max }: { _max: { id: number | null } } =
        //       await db.bundle.aggregate({
        //         _max: {
        //           id: true,
        //         },
        //         where: {
        //           storeUrl: session.shop,
        //         },
        //       });

        //     //Create a new product that will be used as a bundle wrapper
        //     const response = await admin.graphql(
        //       `#graphql
        //     mutation productCreate($productInput: ProductInput!) {
        //       productCreate(input: $productInput) {
        //         product {
        //           id
        //         }
        //       }
        //     }`,
        //       {
        //         variables: {
        //           productInput: {
        //             title: `Neat Bundle ${_max.id ? _max.id : ""}`,
        //             productType: "Neat Bundle",
        //             vendor: "Neat Bundles",
        //             published: true,
        //             tags: [bundleTagIndentifier],
        //           },
        //         },
        //       },
        //     );

        //     const data = await response.json();

        //     await db.bundle.create({
        //       data: {
        //         storeUrl: bundleToDuplicate.storeUrl,
        //         title: `${bundleToDuplicate.title} - Copy`,
        //         shopifyProductId: data.data.productCreate.product.id,
        //         pricing: bundleToDuplicate.pricing,
        //         priceAmount: bundleToDuplicate.priceAmount,
        //         discountType: bundleToDuplicate.discountType,
        //         discountValue: bundleToDuplicate.discountValue,
        //         bundleSettings: {
        //           create: {
        //             displayDiscountBanner:
        //               bundleToDuplicate.bundleSettings?.displayDiscountBanner,
        //             skipTheCart: bundleToDuplicate.bundleSettings?.skipTheCart,
        //             showOutOfStockProducts:
        //               bundleToDuplicate.bundleSettings?.showOutOfStockProducts,
        //             numOfProductColumns:
        //               bundleToDuplicate.bundleSettings?.numOfProductColumns,

        //             bundleColors: {
        //               create: {
        //                 stepsIcon:
        //                   bundleToDuplicate.bundleSettings?.bundleColors.stepsIcon,
        //               },
        //             },
        //             bundleLabels: {
        //               create: {},
        //             },
        //           },
        //         },
        //         steps: {
        //           create: [
        //             {
        //               stepNumber: 1,
        //               title: "Step 1",
        //               stepType: "PRODUCT",
        //               productsData: {
        //                 create: {},
        //               },
        //               contentInputs: {
        //                 create: [{}, {}],
        //               },
        //             },
        //             {
        //               stepNumber: 2,
        //               title: "Step 2",
        //               stepType: "PRODUCT",
        //               productsData: {
        //                 create: {},
        //               },
        //               contentInputs: {
        //                 create: [{}, {}],
        //               },
        //             },
        //             {
        //               stepNumber: 3,
        //               title: "Step 3",
        //               stepType: "PRODUCT",
        //               productsData: {
        //                 create: {},
        //               },
        //               contentInputs: {
        //                 create: [{}, {}],
        //               },
        //             },
        //           ],
        //         },
        //       },
        //     });
        //   } catch (error) {
        //     console.log(error);
        //     return json(
        //       {
        //         ...new JsonData(
        //           false,
        //           "error",
        //           "There was an error with your request",
        //           "The bundle you are trying to duplicate does not exist",
        //         ),
        //       },
        //       { status: 400 },
        //     );
        //   }

        //   return json(
        //     { ...new JsonData(true, "success", "Bundle duplicated") },
        //     { status: 200 },
        //   );

        default: {
            return json(
                {
                    ...new JsonData(true, "success", "This is the default action that doesn't do anything."),
                },
                { status: 200 },
            );
        }
    }
};

export default function Index() {
    const nav = useNavigation();
    const navigate = useNavigate();
    const isLoading: boolean = nav.state === "loading";
    const isSubmitting: boolean = nav.state === "submitting";
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit with a navigation (the same if you were to use a From with a submit button)

    //Data from the loader
    const serverBundle = useLoaderData<typeof loader>().data;

    return (
        <>
            {isLoading || isSubmitting ? (
                <SkeletonPage primaryAction>
                    <BlockStack gap="500">
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                        <Card>
                            <SkeletonBodyText />
                        </Card>
                    </BlockStack>
                </SkeletonPage>
            ) : (
                <div>
                    <div className={styles.sticky}>
                        <Card padding={"300"}>
                            <InlineStack gap={GapBetweenTitleAndContent} align="center">
                                <Text variant="headingMd" as="h1">
                                    <InlineStack gap={"100"} align="center">
                                        <Text as="p">
                                            <u>Editing: </u>
                                        </Text>
                                        <Text as="p" fontWeight="bold">
                                            {serverBundle.title} | Bundle ID: {serverBundle.id}
                                        </Text>
                                    </InlineStack>
                                </Text>
                                {serverBundle.published ? <Badge tone="success">Active</Badge> : <Badge tone="info">Draft</Badge>}
                            </InlineStack>
                        </Card>
                    </div>
                    <Outlet />
                </div>
            )}
        </>
    );
}
