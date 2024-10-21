import { BlockStack, Box, Button, Card, Divider, Icon, InlineStack, Text } from '@shopify/polaris';
import { CheckSmallIcon } from '@shopify/polaris-icons';
import { GapInsideSection } from '~/constants';
import { BillingPlan, PricingInterval } from './route';
import styles from './pricingPlan.module.css';

export default function Index({
    subscriptionIdentifier,
    title,
    features,
    monthlyPricing,
    yearlyPricing,
    pricingInterval,
    activePlan,
    planDisabled,
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
    handleSubscription: (plan: BillingPlan) => void;
}) {
    return (
        <Card padding={'600'}>
            <div className={styles.pricingPlanWrapper}>
                <BlockStack gap={GapInsideSection}>
                    {/* Plan title */}
                    <Text as="h2" variant="headingLg" alignment="center">
                        {pricingInterval === 'MONTHLY' ? title.monthly : title.yearly}
                    </Text>

                    <Divider />

                    {/* Plan features */}
                    <BlockStack gap={'100'} align="start">
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
                    <Text as="h2" variant="headingLg" alignment="center">
                        {pricingInterval === 'MONTHLY' ? monthlyPricing : yearlyPricing}
                    </Text>

                    {/* Select button */}

                    <Button
                        variant="primary"
                        disabled={activePlan || planDisabled}
                        onClick={() => {
                            handleSubscription(pricingInterval === 'MONTHLY' ? subscriptionIdentifier.monthly : subscriptionIdentifier.yearly);
                        }}>
                        {activePlan === true ? 'Current plan' : 'Select plan'}
                    </Button>
                </BlockStack>
            </div>
        </Card>
    );
}
