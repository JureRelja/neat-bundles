import { BlockStack, Box, Button, Card, Divider, Icon, InlineStack, Text } from '@shopify/polaris';
import { CheckSmallIcon } from '@shopify/polaris-icons';
import { GapInsideSection } from '~/constants';
import { PricingInterval } from './route';

export default function Index({
    subscriptionIdentifier,
    title,
    features,
    monthlyPricing,
    yearlyPricing,
    pricingInterval,
    handleSubscription,
}: {
    subscriptionIdentifier: string;
    title: string;
    features: string[];
    pricingInterval: PricingInterval;
    monthlyPricing: string;
    yearlyPricing: string;
    handleSubscription: (subscriptionIdentifier: string) => void;
}) {
    return (
        <Card padding={'600'}>
            <div style={{ height: '280px', width: '300px', display: 'flex', justifyItems: 'space-between', flexDirection: 'column', backgroundColor: 'red' }}>
                <div style={{ backgroundColor: 'blue' }}>
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
                </div>

                <div style={{ backgroundColor: 'green' }}>
                    <BlockStack gap={GapInsideSection}>
                        {/* Plan price */}
                        <Text as="h2" variant="headingLg" alignment="center">
                            {pricingInterval === 'MONTHLY' ? monthlyPricing : yearlyPricing}
                        </Text>

                        {/* Select button */}
                        <Button
                            variant="primary"
                            onClick={() => {
                                handleSubscription(subscriptionIdentifier);
                            }}>
                            Select plan
                        </Button>
                    </BlockStack>
                </div>
            </div>
        </Card>
    );
}
