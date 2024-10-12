import { useNavigation, json, useLoaderData, Link, useNavigate } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Card, BlockStack, SkeletonPage, Text, SkeletonBodyText, Divider, InlineStack, Button } from '@shopify/polaris';
import { authenticate } from '../../shopify.server';
import { BASIC_ANNUAL_PLAN, BASIC_MONTHLY_PLAN } from '../../constants';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import PricingPlan from './pricingPlan';
import { BigGapBetweenSections, GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection } from '~/constants';
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

    const navigate = useNavigate();

    const loaderResponse = useLoaderData<typeof loader>();

    const [pricingInterval, setPricingInterval] = useState<PricingInterval>('MONTHLY');

    const handlePricingIntervalToogle = () => {
        setPricingInterval((state: PricingInterval) => {
            if (state === 'MONTHLY') return 'YEARLY';

            return 'MONTHLY';
        });
    };

    const handleSubscription = (subscriptionIdentifier: string) => {};

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
                    <Page
                        title="Billing"
                        backAction={{
                            content: 'Back',
                            onAction: async () => {
                                navigate(-1);
                            },
                        }}>
                        <BlockStack align="center" gap={BigGapBetweenSections}>
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
                                <PricingPlan
                                    subscriptionIdentifier={BASIC_MONTHLY_PLAN}
                                    handleSubscription={handleSubscription}
                                    title="Basic"
                                    monthlyPricing={'Free'}
                                    yearlyPricing={'Free'}
                                    pricingInterval={pricingInterval}
                                    features={['Create up to 5 bundles', 'Create product steps', 'Customize colors', 'Customer support']}
                                />
                                <PricingPlan
                                    subscriptionIdentifier={BASIC_ANNUAL_PLAN}
                                    handleSubscription={handleSubscription}
                                    title="Pro"
                                    monthlyPricing={'$4.99'}
                                    yearlyPricing={'$49.99'}
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
