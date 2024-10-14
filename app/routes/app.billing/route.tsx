import { useNavigation, json, useLoaderData, Link, useNavigate, redirect } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Card, BlockStack, SkeletonPage, Text, SkeletonBodyText, Divider, InlineStack, Button, Banner, Spinner } from '@shopify/polaris';
import { authenticate } from '../../shopify.server';
import { BASIC_PLAN, LargeGapBetweenSections, PRO_PLAN_MONTHLY, PRO_PLAN_YEARLY } from '../../constants';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import PricingPlan from './pricingPlan';
import { GapBetweenSections, GapInsideSection } from '~/constants';
import { useState } from 'react';
import ToggleSwitch from './toogleSwitch';
import userRepository from '~/adminBackend/repository/impl/UserRepository';
import styles from './route.module.css';

export type PricingInterval = 'MONTHLY' | 'YEARLY';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin, billing } = await authenticate.admin(request);

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [PRO_PLAN_MONTHLY, PRO_PLAN_YEARLY],
        isTest: false,
    });
    console.log(hasActivePayment);
    console.log(appSubscriptions);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    if (user.activeBillingPlan === 'NONE') return 'NONE';

    if (user.activeBillingPlan === 'BASIC') return BASIC_PLAN;

    if (user.activeBillingPlan === 'PRO') return appSubscriptions[0].name;

    return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session, billing } = await authenticate.admin(request);

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [PRO_PLAN_MONTHLY, PRO_PLAN_YEARLY],
        isTest: false,
    });

    const formData = await request.formData();
    const action = formData.get('action');

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    switch (action) {
        case BASIC_PLAN: {
            userRepository.updateUser({ ...user, activeBillingPlan: 'BASIC' });
            break;
        }
        case PRO_PLAN_MONTHLY: {
            const res = await billing.request({
                plan: PRO_PLAN_MONTHLY,
                isTest: true,
                returnUrl: `https://admin.shopify.com/store/${user.storeName}/apps/neat-bundles/app/`,
            });

            console.log(res);
            userRepository.updateUser({ ...user, activeBillingPlan: 'PRO' });
            break;
        }
        case PRO_PLAN_YEARLY: {
            const res = await billing.request({
                plan: PRO_PLAN_YEARLY,
                isTest: true,
                returnUrl: `https://admin.shopify.com/store/${user.storeName}/apps/neat-bundles/app/`,
            });

            console.log(res);
            userRepository.updateUser({ ...user, activeBillingPlan: 'PRO' });
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

    return redirect('/app');
};

export default function Index() {
    const nav = useNavigation();
    const isLoading = nav.state !== 'idle';
    const asyncSubmit = useAsyncSubmit(); //Function for doing the submit action where the only data is action and url
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit action as if form was submitted

    const navigate = useNavigate();

    const activeSubscription = useLoaderData<typeof loader>();

    const [pricingInterval, setPricingInterval] = useState<PricingInterval>('MONTHLY');

    const handlePricingIntervalToogle = () => {
        setPricingInterval((state: PricingInterval) => {
            if (state === 'MONTHLY') return 'YEARLY';

            return 'MONTHLY';
        });
    };

    const handleSubscription = (subscriptionIdentifier: string) => {
        asyncSubmit.submit(subscriptionIdentifier, '/app/billing');
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
                    <Page
                        title="Billing"
                        backAction={{
                            content: 'Back',
                            onAction: async () => {
                                navigate(-1);
                            },
                        }}>
                        <div id={styles.tableWrapper}>
                            <div className={asyncSubmit.state != 'idle' ? styles.loadingTable : styles.hide}>
                                <Spinner accessibilityLabel="Spinner example" size="large" />
                            </div>
                            <BlockStack align="center" gap={LargeGapBetweenSections}>
                                <Banner onDismiss={() => {}}>
                                    <Text as="p">
                                        Select the plan that best suits your needs. If you wish to cancel a subscription, just uninstall the Neat bundles app. Note: All of your
                                        bundles will be lost if you uninstall the app.
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
                                    <PricingPlan
                                        activePlan={activeSubscription === BASIC_PLAN}
                                        subscriptionIdentifier={{ yearly: BASIC_PLAN, monthly: BASIC_PLAN }}
                                        handleSubscription={handleSubscription}
                                        title="Basic"
                                        monthlyPricing={'Free'}
                                        yearlyPricing={'Free'}
                                        pricingInterval={pricingInterval}
                                        features={['Create up to 5 bundles', 'Create product steps', 'Customize colors', 'Customer support']}
                                    />
                                    <PricingPlan
                                        activePlan={activeSubscription === PRO_PLAN_MONTHLY || activeSubscription === PRO_PLAN_YEARLY}
                                        subscriptionIdentifier={{ yearly: PRO_PLAN_YEARLY, monthly: PRO_PLAN_MONTHLY }}
                                        handleSubscription={handleSubscription}
                                        title="Pro"
                                        monthlyPricing={'$4.99'}
                                        yearlyPricing={'$49.99'}
                                        pricingInterval={pricingInterval}
                                        features={['Create unlimited bundles', 'Create product steps', 'Colect images and text on steps', 'Customize colors', 'Priority support']}
                                    />
                                </InlineStack>

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
