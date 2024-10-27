import { json, useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import { ShopifyCatalogRepository } from "~/adminBackend/repository/impl/ShopifyCatalogRepository";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { Shop } from "@shopifyGraphql/graphql";
import { useEffect } from "react";
import { BlockStack, Card, SkeletonBodyText, SkeletonPage } from "@shopify/polaris";
import { BillingPlanIdentifiers } from "~/constants";
import { loopsClient } from "../../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session, billing } = await authenticate.admin(request);

    let user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) {
        const response = await admin.graphql(
            `#graphql
                query  {
                shop {
                    name
                    shopOwnerName
                    email
                    primaryDomain {
                    url
                    }
                }
                }`,
        );

        const data: Shop = (await response.json()).data.shop;

        const onlineStorePublicationId = await ShopifyCatalogRepository.getOnlineStorePublicationId(admin);

        if (!onlineStorePublicationId) {
            return json(
                {
                    ...new JsonData(false, "error", "Failed to get the publication id of the online store", [], { redirect: "/app/error" }),
                },
                { status: 500 },
            );
        }

        user = await userRepository.createUser(session.shop, data.email, data.name, data.primaryDomain.url, onlineStorePublicationId, data.shopOwnerName);

        //welcome emails
        //etc.

        const firstName = user.ownerName.split(" ")[0];

        const contactProperties = {
            firstName: firstName,
            lastName: user.ownerName.replace(firstName, "").trim(),
            email: user.email,
            shopifyPrimaryDomain: user.primaryDomain,
            myShopifyDomain: user.storeUrl,
            source: "Shopify - Installed the app",
            userGroup: "neat-bundles",
        };
        const mailingLists = {
            cm2rilz99023y0lmjc9vp4zin: true, //Neat Bundles mailing list
            cm2rinqh8007n0ljmcqtgbiz9: false, //Neat Merchant - all users
        };

        const loopsResponse = await loopsClient.createContact(user.email, contactProperties, mailingLists);

        if (!loopsResponse.success) {
            //try again
            await loopsClient.createContact(user.email, contactProperties, mailingLists);
        }
    }

    if (!user.hasAppInstalled) {
        await userRepository.updateUser({ ...user, hasAppInstalled: true });
    }

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [BillingPlanIdentifiers.PRO_MONTHLY, BillingPlanIdentifiers.PRO_YEARLY],
        isTest: true,
    });

    //if the user doesn't have an active payment
    if (!hasActivePayment) {
        //if it says in the database that the user has an active billing plan that is not BASIC
        //this can happend if the user had an active payment and then canceled it or the payment failed
        if (user.activeBillingPlan !== "BASIC") {
            await userRepository.updateUser({ ...user, activeBillingPlan: "NONE" });
            return json(
                {
                    ...new JsonData(true, "success", "Customer doesn't have an active subscription.", [], { redirect: "/app/billing" }),
                },
                { status: 500 },
            );
        }
    }
    //if the user has an active payment
    else {
        if (user.activeBillingPlan === "NONE") {
            user.activeBillingPlan =
                appSubscriptions[0].name === BillingPlanIdentifiers.PRO_MONTHLY || appSubscriptions[0].name === BillingPlanIdentifiers.PRO_YEARLY ? "PRO" : "BASIC";
            await userRepository.updateUser(user);
        }
    }

    //if the user hasn't completed the installation redirect to installation page
    if (!user.completedInstallation) {
        return json(
            {
                ...new JsonData(true, "success", "Customer freshly installed the app.", [], { redirect: "/app/installation" }),
            },
            { status: 500 },
        );
    }

    return json(
        {
            ...new JsonData(true, "success", "Customer freshly installed the app.", [], { redirect: `/app/users/${user.id}/bundles` }),
        },
        { status: 500 },
    );
};

export default function Index() {
    const loaderResponse = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    useEffect(() => {
        navigate(loaderResponse.data.redirect);
    }, [loaderResponse]);

    return (
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
    );
}
