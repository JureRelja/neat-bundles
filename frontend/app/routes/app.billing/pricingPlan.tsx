import { BlockStack, Box, Button, Card, Divider, Icon, InlineStack, Text } from "@shopify/polaris";
import { CheckSmallIcon } from "@shopify/polaris-icons";
import { GapBetweenTitleAndContent, GapInsideSection } from "~/constants";
import type { PricingInterval } from "../../types/PricingInterval";
import type { BillingPlan } from "../../types/BillingPlan";

import styles from "./pricingPlan.module.css";

export default function Index({
    subscriptionIdentifier,
    title,
    features,
    monthlyPricing,
    yearlyPricing,
    pricingInterval,
    activePlan,
    planDisabled,
    trialDays,
    handleSubscription,
}: {
    subscriptionIdentifier: { yearly: { planName: string; planId: string }; monthly: { planName: string; planId: string } };
    title: { yearly: string; monthly: string };
    features: string[];
    planDisabled?: boolean;
    activePlan: boolean;
    pricingInterval: PricingInterval;
    monthlyPricing: string;
    yearlyPricing: string;
    trialDays?: number;
    handleSubscription: (plan: BillingPlan) => void;
}) {
    return (
        <Card>
            <div className={styles.pricingPlanWrapper}>
                <BlockStack gap={GapInsideSection}>
                    {/* Plan title */}
                    <Text as="h2" variant="headingLg" alignment="center">
                        {pricingInterval === "MONTHLY" ? title.monthly : title.yearly}
                    </Text>

                    <Divider />

                    {/* Plan features */}
                    <BlockStack gap={"100"} align="start">
                        {features.map((feature) => {
                            return (
                                <InlineStack key={feature} align="start">
                                    <Box>
                                        <Icon source={CheckSmallIcon} />
                                    </Box>
                                    <Box>
                                        <Text as="p">{feature}</Text>
                                    </Box>
                                </InlineStack>
                            );
                        })}
                    </BlockStack>
                </BlockStack>

                <BlockStack gap={GapInsideSection}>
                    {/* Plan price */}
                    <BlockStack gap={GapBetweenTitleAndContent} align="center">
                        <Text as="h2" variant="headingLg" alignment="center">
                            {pricingInterval === "MONTHLY" ? monthlyPricing : yearlyPricing}
                        </Text>

                        {/* Trial days */}
                        {trialDays && (
                            <Text as="h2" variant="headingMd" alignment="center">
                                + {trialDays}-day free trial
                            </Text>
                        )}
                    </BlockStack>

                    {/* Select button */}

                    <Button
                        variant="primary"
                        disabled={activePlan || planDisabled}
                        onClick={() => {
                            handleSubscription(pricingInterval === "MONTHLY" ? subscriptionIdentifier.monthly : subscriptionIdentifier.yearly);
                        }}>
                        {activePlan === true ? "Current plan" : "Select plan"}
                    </Button>
                </BlockStack>
            </div>
        </Card>
    );
}
