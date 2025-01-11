import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import { ShopifyCatalogRepository } from "~/adminBackend/repository/impl/ShopifyCatalogRepository";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import type { Shop } from "~/adminBackend/shopifyGraphql/graphql";
import { BlockStack, Card, SkeletonBodyText, SkeletonPage } from "@shopify/polaris";
import { BillingPlanIdentifiers } from "~/constants";
import { loopsClient } from "../../email.server";
import { bundleBuilderService } from "~/adminBackend/service/impl/BundleBuilderServiceImpl";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session, billing, redirect } = await authenticate.admin(request);

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
                    plan {
                        partnerDevelopment
                    }
                }
                }`,
        );

        const data: Shop = (await response.json()).data.shop;

        const onlineStorePublicationId = await ShopifyCatalogRepository.getOnlineStorePublicationId(admin);

        // if (!onlineStorePublicationId) {
        //     return redirect("/app/error?type=no-publication");
        // }

        user = await userRepository.createUser(session.shop, data.email, data.name, data.primaryDomain.url, onlineStorePublicationId, data.shopOwnerName);

        if (data.plan.partnerDevelopment) {
            user.activeBillingPlan = "FREE";
            user.isDevelopmentStore = true;
            await userRepository.updateUser(user);
        }

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

    //check if the user is a development store
    const response = await admin.graphql(
        `#graphql
            query  {
            shop {
                plan {
                    partnerDevelopment
                }
            }
            }`,
    );

    const data: Shop = (await response.json()).data.shop;

    //if the user is not a development store but the database says it is a development store (this can happen if the user was a development store and then switched to a paid plan)
    if (!data.plan.partnerDevelopment && user.isDevelopmentStore) {
        user.isDevelopmentStore = false;
        await userRepository.updateUser(user);
    } //
    else if (data.plan.partnerDevelopment && !user.isDevelopmentStore) {
        user.activeBillingPlan = "FREE";
        user.isDevelopmentStore = true;
        await userRepository.updateUser(user);
    }

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [BillingPlanIdentifiers.PRO_MONTHLY, BillingPlanIdentifiers.PRO_YEARLY, BillingPlanIdentifiers.BASIC_MONTHLY, BillingPlanIdentifiers.BASIC_YEARLY],
        isTest: false,
    });

    console.log(hasActivePayment, appSubscriptions);

    //if the user doesn't have an active payment
    if (!hasActivePayment) {
        //if it says in the database that the user has an active billing plan that is not BASIC
        //this can happend if the user had an active payment and then canceled it or the payment failed
        if (user.isDevelopmentStore && user.activeBillingPlan !== "FREE") {
            user.activeBillingPlan = "FREE";
            await userRepository.updateUser(user);
        } else if (user.activeBillingPlan !== "NONE" && !user.isDevelopmentStore) {
            user.activeBillingPlan = "NONE";
            await userRepository.updateUser(user);

            return redirect(`/app/billing`);
        }
    }
    //if the user has an active payment
    else {
        //update the user's active billing plan
        switch (appSubscriptions[0].name) {
            case BillingPlanIdentifiers.PRO_MONTHLY:
                user.activeBillingPlan = "PRO";

            case BillingPlanIdentifiers.PRO_YEARLY:
                user.activeBillingPlan = "PRO";

            case BillingPlanIdentifiers.BASIC_MONTHLY:
                if (user.activeBillingPlan === "PRO") await bundleBuilderService.deleteNonAllowedBundles(session.shop);

                user.activeBillingPlan = "BASIC";

            case BillingPlanIdentifiers.BASIC_YEARLY:
                if (user.activeBillingPlan === "PRO") await bundleBuilderService.deleteNonAllowedBundles(session.shop);

                user.activeBillingPlan = "BASIC";
        }

        await userRepository.updateUser(user);
    }

    //if the user hasn't completed the installation redirect to installation page
    if (!user.completedInstallation) return redirect(`/app/installation`);

    return redirect(`/app/users/${user.id}/bundles`);
};

export default function Index() {
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
