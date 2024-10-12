import { BlockStack, Box, Button, Card, Divider, Icon, InlineStack, Text } from '@shopify/polaris';
import { CheckSmallIcon } from '@shopify/polaris-icons';
import { GapBetweenTitleAndContent } from '~/constants';
import { PricingInterval } from './route';

export default function Index({
    title,
    features,
    monthlyPricing,
    yearlyPricing,
    pricingInterval,
}: {
    title: string;
    features: string[];
    pricingInterval: PricingInterval;
    monthlyPricing: number;
    yearlyPricing: number;
}) {
    return (
        <Card padding={'1000'}>
            <Box minHeight="">
                <BlockStack gap={GapBetweenTitleAndContent}>
                    <Text as="h2" variant="headingLg">
                        {title}
                    </Text>
                    <Divider />
                    <BlockStack gap={'100'}>
                        {features.map((feature) => {
                            return (
                                <InlineStack align="start">
                                    <Icon source={CheckSmallIcon} />
                                    <Text as="p">{feature}</Text>
                                </InlineStack>
                            );
                        })}
                    </BlockStack>

                    <Text as="h2" variant="headingLg">
                        {pricingInterval === 'MONTHLY' ? monthlyPricing : yearlyPricing}
                    </Text>
                    <Button variant="primary">Select plan</Button>
                </BlockStack>
            </Box>
        </Card>
    );
}
