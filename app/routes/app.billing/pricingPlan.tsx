import { BlockStack, Box, Button, Card, Divider, Icon, InlineStack, Text } from '@shopify/polaris';
import { CheckSmallIcon } from '@shopify/polaris-icons';
import { GapInsideSection } from '~/constants';
import { PricingInterval } from './route';
import styles from './pricingPlan.module.css';

export default function Index({
    subscriptionIdentifier,
    title,
    features,
    monthlyPricing,
    yearlyPricing,
    pricingInterval,
    activePlan,
    handleSubscription,
}: {
    subscriptionIdentifier: { yearly: string; monthly: string };
    title: string;
    features: string[];
    activePlan: boolean;
    pricingInterval: PricingInterval;
    monthlyPricing: string;
    yearlyPricing: string;
    handleSubscription: (subscriptionIdentifier: string) => void;
}) {
    return (
        <Card padding={'600'}>
            <div className={styles.pricingPlanWrapper}>
                <BlockStack gap={GapInsideSection}>
                    {/* Plan title */}
                    <Text as="h2" variant="headingLg" alignment="center">
                        {title}
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
                    {activePlan === true ? (
                        <Button
                            variant="primary"
                            disabled={activePlan}
                            onClick={() => {
                                handleSubscription(pricingInterval === 'MONTHLY' ? subscriptionIdentifier.monthly : subscriptionIdentifier.yearly);
                            }}>
                            Current plan
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            disabled={activePlan}
                            onClick={() => {
                                handleSubscription(pricingInterval === 'MONTHLY' ? subscriptionIdentifier.monthly : subscriptionIdentifier.yearly);
                            }}>
                            Select plan
                        </Button>
                    )}
                </BlockStack>
            </div>
        </Card>
    );
}
