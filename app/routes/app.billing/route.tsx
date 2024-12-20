import { useNavigation, json, useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page, Card, BlockStack, SkeletonPage, Text, SkeletonBodyText, Divider, InlineStack, Button, Banner, Spinner, Box } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import { GapBetweenSections, GapInsideSection, LargeGapBetweenSections, BillingPlanIdentifiers } from "~/constants";
import ToggleSwitch from "./toogleSwitch";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import styles from "./route.module.css";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { PricingPlanClient } from "~/types/PricingPlanClient";
import PricingPlanComponent from "./pricingPlan";
import type { PricingInterval } from "~/types/PricingInterval";
import type { BillingPlan } from "~/types/BillingPlan";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { billing, session, redirect } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect("/app");

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [BillingPlanIdentifiers.PRO_MONTHLY, BillingPlanIdentifiers.PRO_YEARLY, BillingPlanIdentifiers.BASIC_MONTHLY, BillingPlanIdentifiers.BASIC_YEARLY],
        isTest: false,
    });

    //if the user doesn't have an active payment
    if (!hasActivePayment) {
        //if it says in the database that the user has an active billing plan that is not BASIC
        //this can happend if the user had an active payment and then canceled it or the payment failed
        if (user.isDevelopmentStore && user.activeBillingPlan !== "FREE") {
            user.activeBillingPlan = "FREE";
            await userRepository.updateUser(user);

            //
        } else if (user.activeBillingPlan !== "NONE" && !user.isDevelopmentStore) {
            user.activeBillingPlan = "NONE";
            await userRepository.updateUser(user);
        }
    }
    //if the user has an active payment
    else {
        if (user.activeBillingPlan === "NONE") {
            //update the user's active billing plan
            switch (appSubscriptions[0].name) {
                case BillingPlanIdentifiers.PRO_MONTHLY:
                    user.activeBillingPlan = "PRO";

                case BillingPlanIdentifiers.PRO_YEARLY:
                    user.activeBillingPlan = "PRO";

                case BillingPlanIdentifiers.BASIC_MONTHLY:
                    user.activeBillingPlan = "BASIC";

                case BillingPlanIdentifiers.BASIC_YEARLY:
                    user.activeBillingPlan = "BASIC";
            }
            await userRepository.updateUser(user);
        }
    }

    //has active payment
    if (hasActivePayment) {
        return json({ planName: user.activeBillingPlan, planId: appSubscriptions[0].name, user: user });
    }
    //is on free plan (development store)
    else if (user.activeBillingPlan === "FREE") {
        return json({ planName: user.activeBillingPlan, planId: "FREE", user: user });
    }
    //doesn't have plan selected
    else return json({ planName: user.activeBillingPlan, planId: "NONE", user: user });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { session, billing, redirect } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect("/app");

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [BillingPlanIdentifiers.PRO_MONTHLY, BillingPlanIdentifiers.PRO_YEARLY, BillingPlanIdentifiers.BASIC_MONTHLY, BillingPlanIdentifiers.BASIC_YEARLY],
        isTest: false,
    });

    const formData = await request.formData();
    const action = formData.get("action");

    let state: "upgrading" | "downgrading" | "none" = "none";

    console.log(action);

    if (user.isDevelopmentStore) {
        return redirect("/app");
    }

    switch (action) {
        case "CANCEL": {
            if (hasActivePayment) {
                await billing.cancel({
                    subscriptionId: appSubscriptions[0].id,
                    isTest: false,
                    prorate: false,
                });
            }
            await userRepository.updateUser({ ...user, activeBillingPlan: "NONE" });
            return redirect("/app/billing");
        }

        //basic plan handlers
        case BillingPlanIdentifiers.BASIC_MONTHLY: {
            if (user.activeBillingPlan === "PRO") state = "downgrading";

            await userRepository.updateUser({ ...user, activeBillingPlan: "PRO" });

            await billing.request({
                plan: action,
                isTest: false,
                returnUrl: `https://admin.shopify.com/store/${session.shop.split(".")[0]}/apps/neat-bundles/app/${state === "downgrading" ? "billing" : state === "none" ? "thank-you?variant=firstPlan" : ""}`,
            });

            break;
        }

        case BillingPlanIdentifiers.BASIC_YEARLY: {
            if (user.activeBillingPlan === "PRO") state = "downgrading";

            await userRepository.updateUser({ ...user, activeBillingPlan: "PRO" });

            await billing.request({
                plan: action,
                isTest: false,
                returnUrl: `https://admin.shopify.com/store/${session.shop.split(".")[0]}/apps/neat-bundles/app/${state === "downgrading" ? "billing" : state === "none" ? "thank-you?variant=firstPlan" : ""}`,
            });

            break;
        }

        //pro plan handlers
        case BillingPlanIdentifiers.PRO_MONTHLY: {
            if (user.activeBillingPlan === "BASIC") state = "upgrading";

            await userRepository.updateUser({ ...user, activeBillingPlan: "PRO" });

            await billing.request({
                plan: action,
                isTest: false,
                returnUrl: `https://admin.shopify.com/store/${session.shop.split(".")[0]}/apps/neat-bundles/app/thank-you?variant=${state === "upgrading" ? "upgrade" : state === "none" ? "firstPlan" : ""}`,
            });

            break;
        }

        case BillingPlanIdentifiers.PRO_YEARLY: {
            if (user.activeBillingPlan === "BASIC") state = "upgrading";

            await userRepository.updateUser({ ...user, activeBillingPlan: "PRO" });

            await billing.request({
                plan: action,
                isTest: false,
                returnUrl: `https://admin.shopify.com/store/${session.shop.split(".")[0]}/apps/neat-bundles/app/thank-you?variant=${state === "upgrading" ? "upgrade" : state === "none" ? "firstPlan" : ""}`,
            });

            break;
        }

        default: {
            return json(
                {
                    ...new JsonData(true, "success", "This is the default action that doesn't do anything."),
                },
                { status: 200 },
            );
        }
    }

    return redirect("/app");
};

export default function Index() {
    const nav = useNavigation();
    const isLoading = nav.state !== "idle";
    const fetcher = useFetcher();
    const navigate = useNavigate();

    const loaderData = useLoaderData<typeof loader>();

    const user = loaderData.user;

    const activeSubscription = { planId: loaderData.planId, planName: loaderData.planName };

    //
    //pricing interval
    const [pricingInterval, setPricingInterval] = useState<PricingInterval>("MONTHLY");

    const handlePricingIntervalToogle = () => {
        setPricingInterval((state: PricingInterval) => {
            if (state === "MONTHLY") return "YEARLY";

            return "MONTHLY";
        });
    };

    //
    //cancel handler
    const handleCanclePlan = async () => {
        const form = new FormData();

        form.append("action", "CANCEL");
        fetcher.submit(form, { method: "POST" });
    };

    //
    //downgrade handler
    const [isDowngrading, setIsDowngrading] = useState<boolean>();

    //
    //subscription change
    const [newSelectedSubscription, setNewSelectedSubscription] = useState<BillingPlan>();

    const handleSubscription = (newPlan: BillingPlan) => {
        if (activeSubscription.planId === BillingPlanIdentifiers.FREE) {
            shopify.modal.show("partner-stores-modal");
            return;
        }

        //check if the person is downgrading
        if (
            (newPlan.planId === BillingPlanIdentifiers.BASIC_MONTHLY || newPlan.planId === BillingPlanIdentifiers.BASIC_YEARLY) &&
            (activeSubscription.planId === BillingPlanIdentifiers.PRO_MONTHLY || activeSubscription.planId === BillingPlanIdentifiers.PRO_YEARLY)
        ) {
            setNewSelectedSubscription(newPlan);
            setIsDowngrading(true);
            return;
        }

        if (!user.isDevelopmentStore && activeSubscription.planId !== "NONE") {
            return;
        }

        chargeCustomer(newPlan);
    };

    //charge handler
    const chargeCustomer = (newPlan: BillingPlan) => {
        const form = new FormData();

        form.append("action", newPlan.planId);
        fetcher.submit(form, { method: "POST" });
    };

    return (
        <>
            {/* prettier-ignore */}
            {isLoading ? (
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
                <>
                    {/* Modal for users to confirm that they want to cancel the subscription. */}
                    <Modal id="partner-stores-modal">
                        <Box padding="300">
                            <Text as="p">Since your are running a development store, you already have all the features for free.</Text>
                        </Box>
                        <TitleBar title="Why pay when it's free!">
                            <button variant="primary" onClick={() => shopify.modal.hide("partner-stores-modal")}>
                                Close
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Modal for users to confirm that they want to cancel the subscription. */}
                    <Modal id="cancel-subscription-modal">
                        <Box padding="300">
                            <Text as="p">If you cancel the subscription, you won't be able to use Neat Bundles app. Are you sure that you want to to that?</Text>
                        </Box>
                        <TitleBar title="Cancel confirmation">
                            <button onClick={() => shopify.modal.hide("cancel-subscription-modal")}>Close</button>
                            <button
                                variant="primary"
                                tone="critical"
                                onClick={() => {
                                    handleCanclePlan();
                                    shopify.modal.hide("cancel-subscription-modal");
                                }}>
                                Cancel
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Modal for users to confirm downgrading */}
                    <Modal id="downgrading-subscription-modal" open={isDowngrading} onHide={() => setIsDowngrading(false)}>
                        <Box padding="300">
                            <Text as="p">
                                You are about to downgrade from the <b>{activeSubscription.planId}</b> plan to the <b>{newSelectedSubscription?.planId}</b> plan. All the bundles
                                that don't fit within the limitations of the new plan will be deleted. Are you sure that you want to do that?
                            </Text>
                        </Box>
                        <TitleBar title="Are you sure you want to downgrade your plan?">
                            <button onClick={() => setIsDowngrading(false)}>Close</button>
                            <button
                                variant="primary"
                                tone="critical"
                                onClick={() => {
                                    chargeCustomer(newSelectedSubscription as BillingPlan);
                                    setIsDowngrading(false);
                                }}>
                                Downgrade
                            </button>
                        </TitleBar>
                    </Modal>
                    <Page
                        title="Billing"
                        backAction={{
                            content: "Back",
                            onAction: async () => {
                                navigate(-1);
                            },
                        }}>
                        <div id={styles.tableWrapper}>
                            <div className={fetcher.state !== "idle" ? styles.loadingTable : styles.hide}>
                                <Spinner accessibilityLabel="Spinner example" size="large" />
                            </div>
                            <BlockStack align="center" gap={LargeGapBetweenSections}>
                                <Banner onDismiss={() => {}}>
                                    <Text as="p">
                                        Select the plan that best suits your needs. <b>For a limited time, we have a 30-day free trial</b> that should be enough to get your
                                        customers started with custom bundles.
                                    </Text>
                                </Banner>

                                {/* Monthly/Yearly toogle */}
                                <InlineStack gap={GapInsideSection} align="center" blockAlign="center">
                                    <Text as="h2" variant="headingLg">
                                        Monthly
                                    </Text>
                                    <ToggleSwitch label="Biling frequency" labelHidden={true} onChange={() => handlePricingIntervalToogle()} />
                                    <Text as="h2" variant="headingLg">
                                        Yearly (15% off)
                                    </Text>
                                </InlineStack>

                                {/* Pricing plans */}
                                <InlineStack gap={GapBetweenSections} align="center">
                                    {/* Free plan */}
                                    <PricingPlanComponent
                                        activePlan={activeSubscription.planId === BillingPlanIdentifiers.FREE}
                                        subscriptionIdentifier={{
                                            yearly: { planName: PricingPlanClient.FREE, planId: BillingPlanIdentifiers.FREE },
                                            monthly: { planName: PricingPlanClient.FREE, planId: BillingPlanIdentifiers.FREE },
                                        }}
                                        handleSubscription={handleSubscription}
                                        title={{ yearly: "Development", monthly: "Development" }}
                                        monthlyPricing={"Free"}
                                        yearlyPricing={"Free"}
                                        pricingInterval={pricingInterval}
                                        planDisabled={!user.isDevelopmentStore}
                                        features={["All features", "For development stores only"]}
                                    />
                                    {/* Basic plan  */}
                                    <PricingPlanComponent
                                        activePlan={
                                            activeSubscription.planId === BillingPlanIdentifiers.BASIC_MONTHLY || activeSubscription.planId === BillingPlanIdentifiers.BASIC_YEARLY
                                        }
                                        subscriptionIdentifier={{
                                            yearly: { planName: PricingPlanClient.BASIC, planId: BillingPlanIdentifiers.BASIC_YEARLY },
                                            monthly: { planName: PricingPlanClient.BASIC, planId: BillingPlanIdentifiers.BASIC_MONTHLY },
                                        }}
                                        handleSubscription={handleSubscription}
                                        title={{ yearly: "Basic (yearly)", monthly: "Basic (monthly)" }}
                                        trialDays={30}
                                        monthlyPricing={"$6.99"}
                                        yearlyPricing={"$69.99"}
                                        pricingInterval={pricingInterval}
                                        features={[
                                            "Create up to 2 bundles",
                                            "Create up to 2 two steps in one bundle",
                                            "Create product steps",
                                            "Customize colors",
                                            "Customer support",
                                        ]}
                                    />
                                    {/* Pro plan*/}
                                    <PricingPlanComponent
                                        activePlan={
                                            activeSubscription.planId === BillingPlanIdentifiers.PRO_MONTHLY || activeSubscription.planId === BillingPlanIdentifiers.PRO_YEARLY
                                        }
                                        subscriptionIdentifier={{
                                            yearly: { planName: PricingPlanClient.PRO, planId: BillingPlanIdentifiers.PRO_YEARLY },
                                            monthly: { planName: PricingPlanClient.PRO, planId: BillingPlanIdentifiers.PRO_MONTHLY },
                                        }}
                                        handleSubscription={handleSubscription}
                                        trialDays={30}
                                        title={{ yearly: "Pro (yearly)", monthly: "Pro (monthly)" }}
                                        monthlyPricing={"$9.99"}
                                        yearlyPricing={"$99.99"}
                                        pricingInterval={pricingInterval}
                                        features={[
                                            "Create unlimited bundles",
                                            "Create up to 5 steps on all bundles",
                                            "Create product steps",
                                            "Collect images or text on steps",
                                            "Customize colors",
                                            "Priority support",
                                        ]}
                                    />
                                </InlineStack>

                                {/* Current plan */}
                                <InlineStack gap={GapBetweenSections} align="center" blockAlign="center">
                                    <Text as="p">
                                        <u>
                                            {activeSubscription.planId === "NONE"
                                                ? "You don't have an active plan."
                                                : `Your currently active plan is ${activeSubscription.planId}.`}
                                        </u>
                                    </Text>

                                    {activeSubscription.planId !== "FREE" && activeSubscription.planName !== "NONE" && (
                                        <Button onClick={() => shopify.modal.show("cancel-subscription-modal")}>Cancel plan</Button>
                                    )}
                                </InlineStack>

                                <Divider />

                                <Text as="p">
                                    Note: The plans displayed reflect current pricing. If you previously signed up at a different price, you will continue to be charged your
                                    original price until you change your plan.
                                </Text>
                                <Divider />
                            </BlockStack>
                        </div>
                    </Page>
                </>
            )}
        </>
    );
}
