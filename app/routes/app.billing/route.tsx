import { useNavigation, json, useLoaderData, Link } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Card, BlockStack, SkeletonPage, Text, SkeletonBodyText, Divider, InlineStack, Button } from '@shopify/polaris';
import { authenticate, BASIC_ANNUAL_PLAN, BASIC_MONTHLY_PLAN } from '../../shopify.server';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import PricingPlan from './pricingPlan';
import { GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection } from '~/constants';
import { useState } from 'react';
import ToggleSwitch from './toogleSwitch';

export type PricingInterval = 'MONTHLY' | 'YEARLY';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin, billing } = await authenticate.admin(request);

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [BASIC_MONTHLY_PLAN, BASIC_ANNUAL_PLAN],
        isTest: false,
    });
    console.log(hasActivePayment);
    console.log(appSubscriptions);

    return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session, billing } = await authenticate.admin(request);

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [BASIC_MONTHLY_PLAN, BASIC_ANNUAL_PLAN],
        isTest: false,
    });

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case BASIC_MONTHLY_PLAN: {
            const res = await billing.require({
                plans: [BASIC_MONTHLY_PLAN],
                isTest: true,
                onFailure: async () => billing.request({ plan: BASIC_MONTHLY_PLAN }),
            });

            console.log(res);
            break;
        }
        case BASIC_ANNUAL_PLAN: {
            const res = await billing.require({
                plans: [BASIC_ANNUAL_PLAN],
                isTest: true,
                onFailure: async () => billing.request({ plan: BASIC_ANNUAL_PLAN }),
            });

            console.log(res);
            break;
        }

        default: {
            return json(
                {
                    ...new JsonData(true, 'success', "This is the default action that doesn't do anything."),
                },
                { status: 200 },
            );
        }
    }
};

export default function Index() {
    const nav = useNavigation();
    const isLoading = nav.state !== 'idle';
    const asyncSubmit = useAsyncSubmit(); //Function for doing the submit action where the only data is action and url
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit action as if form was submitted

    const loaderResponse = useLoaderData<typeof loader>();

    const [pricingInterval, setPricingInterval] = useState<PricingInterval>('MONTHLY');

    const handlePricingIntervalToogle = () => {
        setPricingInterval((state: PricingInterval) => {
            if (state === 'MONTHLY') return 'YEARLY';

            return 'MONTHLY';
        });
    };

    return (
        <>
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
                    <Page title="Billing">
                        <BlockStack align="center" gap={GapBetweenSections}>
                            {/* Monthly/Yearly toogle */}
                            <InlineStack gap={GapInsideSection} align="center" blockAlign="center">
                                <Text as="p" variant="headingMd">
                                    Monthly
                                </Text>
                                <ToggleSwitch label="Biling frequency" labelHidden={true} onChange={() => handlePricingIntervalToogle()} />
                                <Text as="p" variant="headingMd">
                                    Yearly (15% off)
                                </Text>
                            </InlineStack>

                            {/* Pricing plans */}
                            <InlineStack gap={GapBetweenSections} align="center">
                                <PricingPlan
                                    title="Basic"
                                    monthlyPricing={0}
                                    yearlyPricing={0}
                                    pricingInterval={pricingInterval}
                                    features={['Create up to 5 bundles', 'Create product steps', 'Customize the colors', 'Customer support']}
                                />
                                <PricingPlan
                                    title="Pro"
                                    monthlyPricing={4.99}
                                    yearlyPricing={49.99}
                                    pricingInterval={pricingInterval}
                                    features={['Create unlimited bundles', 'Create product steps', 'Colect images and text on steps', 'Customize colors', 'Priority support']}
                                />
                            </InlineStack>

                            <Text as="p">
                                Note: The plans displayed reflect current pricing. If you previously signed up at a different price, you will continue to be charged your original
                                price until you change your plan.
                            </Text>
                        </BlockStack>
                    </Page>
                </>
            )}
        </>
    );
}
