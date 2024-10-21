import { useNavigation, json, useLoaderData, useNavigate, redirect, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Card, BlockStack, SkeletonPage, Text, SkeletonBodyText, Divider, InlineStack, Button, Banner, Spinner, Box } from '@shopify/polaris';
import { authenticate } from '../../shopify.server';
import { LargeGapBetweenSections, BillingPlanIdentifiers } from '../../constants';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import PricingPlanComponent from './pricingPlan';
import { GapBetweenSections, GapInsideSection } from '~/constants';
import ToggleSwitch from './toogleSwitch';
import userRepository from '~/adminBackend/repository/impl/UserRepository';
import styles from './route.module.css';
import { Modal, TitleBar } from '@shopify/app-bridge-react';
import { PricingPlan } from '@prisma/client';

export type PricingInterval = 'MONTHLY' | 'YEARLY';

export type BillingPlan = {
    planName: string;
    planId: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin, billing } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [BillingPlanIdentifiers.PRO_MONTHLY, BillingPlanIdentifiers.PRO_YEARLY],
        isTest: true,
    });

    if (hasActivePayment) {
        return json({ planName: user.activeBillingPlan, planId: appSubscriptions[0].name });
    } else if (user.activeBillingPlan === 'BASIC') {
        return json({ planName: user.activeBillingPlan, planId: BillingPlanIdentifiers.BASIC });
    } else return json({ planName: user.activeBillingPlan, planId: 'NONE' });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session, billing } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [BillingPlanIdentifiers.PRO_MONTHLY, BillingPlanIdentifiers.PRO_YEARLY],
        isTest: true,
    });

    const formData = await request.formData();
    const action = formData.get('action');

    let state: 'upgrading' | 'downgrading' | 'none' = 'none';
    console.log(action);

    switch (action) {
        case 'CANCEL': {
            if (hasActivePayment) {
                const cancelledSubscription = await billing.cancel({
                    subscriptionId: appSubscriptions[0].id,
                    isTest: true,
                    prorate: false,
                });
            }
            await userRepository.updateUser({ ...user, activeBillingPlan: 'NONE' });
            return redirect('/app/billing');
        }

        case BillingPlanIdentifiers.BASIC: {
            if (hasActivePayment) {
                const cancelledSubscription = await billing.cancel({
                    subscriptionId: appSubscriptions[0].id,
                    isTest: true,
                    prorate: false,
                });

                state = 'downgrading';
            }

            await userRepository.updateUser({ ...user, activeBillingPlan: 'BASIC' });

            if (state === 'downgrading') {
                return redirect('/app/billing');
            } else {
                return redirect('/app/thank-you?variant=firstPlan');
            }
        }

        case BillingPlanIdentifiers.PRO_MONTHLY: {
            if (user.activeBillingPlan === 'BASIC') state = 'upgrading';

            await userRepository.updateUser({ ...user, activeBillingPlan: 'PRO' });

            console.log("I'm here");

            const res = await billing.request({
                plan: action,
                isTest: true,
                returnUrl: `https://admin.shopify.com/store/${session.shop.split('.')[0]}/apps/neat-bundles/app/thank-you?variant=${state === 'upgrading' ? 'upgrade' : state === 'none' ? 'firstPlan' : ''}`,
            });

            break;
        }

        case BillingPlanIdentifiers.PRO_YEARLY: {
            if (user.activeBillingPlan === 'BASIC') state = 'upgrading';

            await userRepository.updateUser({ ...user, activeBillingPlan: 'PRO' });

            console.log("I'm here");

            const res = await billing.request({
                plan: action,
                isTest: true,
                returnUrl: `https://admin.shopify.com/store/${session.shop.split('.')[0]}/apps/neat-bundles/app/thank-you?variant=${state === 'upgrading' ? 'upgrade' : state === 'none' ? 'firstPlan' : ''}`,
            });

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
    const fetcher = useFetcher();
    const navigate = useNavigate();

    const activeSubscription: BillingPlan = useLoaderData<typeof loader>();

    //
    //pricing interval
    const [pricingInterval, setPricingInterval] = useState<PricingInterval>('MONTHLY');

    const handlePricingIntervalToogle = () => {
        setPricingInterval((state: PricingInterval) => {
            if (state === 'MONTHLY') return 'YEARLY';

            return 'MONTHLY';
        });
    };

    //
    //cancel handler
    const handleCanclePlan = async () => {
        const form = new FormData();

        form.append('action', 'CANCEL');
        fetcher.submit(form, { method: 'POST', navigate: false });
    };

    //
    //downgrade handler
    const [isDowngrading, setIsDowngrading] = useState<boolean>();

    //
    //subscription change
    const [newSelectedSubscription, setNewSelectedSubscription] = useState<BillingPlan>();

    const handleSubscription = (newPlan: BillingPlan) => {
        //check if the person is downgrading
        if (
            newPlan.planId === BillingPlanIdentifiers.BASIC &&
            (activeSubscription.planId === BillingPlanIdentifiers.PRO_MONTHLY || activeSubscription.planId === BillingPlanIdentifiers.PRO_YEARLY)
        ) {
            setNewSelectedSubscription(newPlan);
            setIsDowngrading(true);
            return;
        }

        chargeCustomer(newPlan);
    };

    //charge handler
    const chargeCustomer = (newPlan: BillingPlan) => {
        const form = new FormData();

        form.append('action', newPlan.planId);
        fetcher.submit(form, { method: 'POST', navigate: false });
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
                    <Modal id="cancel-subscription-modal">
                        <Box padding="300">
                            <Text as="p">If you cancel the subscription, you won't be able to use Neat Bundles app. Are you sure that you want to to that?</Text>
                        </Box>
                        <TitleBar title="Cancel confirmation">
                            <button onClick={() => shopify.modal.hide('cancel-subscription-modal')}>Close</button>
                            <button
                                variant="primary"
                                tone="critical"
                                onClick={() => {
                                    handleCanclePlan();
                                    shopify.modal.hide('cancel-subscription-modal');
                                }}>
                                Cancel
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Modal for users to confirm downgrading */}
                    <Modal id="downgrading-subscription-modal" open={isDowngrading}>
                        <Box padding="300">
                            <Text as="p">
                                You are about to downgrade from the <b>{activeSubscription.planId}</b> plan to the <b>{newSelectedSubscription?.planId}</b> plan. You'll lose all
                                the features from the <b>{activeSubscription.planId}</b> plan. Are you sure that you want to do that?
                            </Text>
                        </Box>
                        <TitleBar title="Downgrade confirmation">
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
                            content: 'Back',
                            onAction: async () => {
                                navigate(-1);
                            },
                        }}>
                        <div id={styles.tableWrapper}>
                            <div className={fetcher.state !== 'idle' ? styles.loadingTable : styles.hide}>
                                <Spinner accessibilityLabel="Spinner example" size="large" />
                            </div>
                            <BlockStack align="center" gap={LargeGapBetweenSections}>
                                <Banner onDismiss={() => {}}>
                                    <Text as="p">
                                        Select the plan that best suits your needs. <b>For a limited time, we have a generous free plan</b> that should be enough to get your
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
                                    <PricingPlanComponent
                                        activePlan={activeSubscription.planId === BillingPlanIdentifiers.BASIC}
                                        subscriptionIdentifier={{
                                            yearly: { planName: PricingPlan.BASIC, planId: BillingPlanIdentifiers.BASIC },
                                            monthly: { planName: PricingPlan.BASIC, planId: BillingPlanIdentifiers.BASIC },
                                        }}
                                        handleSubscription={handleSubscription}
                                        title={{ yearly: 'Basic', monthly: 'Basic' }}
                                        monthlyPricing={'Free'}
                                        yearlyPricing={'Free'}
                                        pricingInterval={pricingInterval}
                                        features={[
                                            'Create up to 2 bundles',
                                            'Create up to 2 two steps in one bundle',
                                            'Create product steps',
                                            'Customize colors',
                                            'Customer support',
                                        ]}
                                    />
                                    <PricingPlanComponent
                                        activePlan={
                                            activeSubscription.planId === BillingPlanIdentifiers.PRO_MONTHLY || activeSubscription.planId === BillingPlanIdentifiers.PRO_YEARLY
                                        }
                                        subscriptionIdentifier={{
                                            yearly: { planName: PricingPlan.PRO, planId: BillingPlanIdentifiers.PRO_YEARLY },
                                            monthly: { planName: PricingPlan.PRO, planId: BillingPlanIdentifiers.PRO_MONTHLY },
                                        }}
                                        handleSubscription={handleSubscription}
                                        title={{ yearly: 'Pro (yearly)', monthly: 'Pro (monthly)' }}
                                        monthlyPricing={'$4.99'}
                                        yearlyPricing={'$49.99'}
                                        pricingInterval={pricingInterval}
                                        features={[
                                            'Create unlimited bundles',
                                            'Create up to 5 steps on all bundles',
                                            'Create product steps',
                                            'Collect images or text on steps',
                                            'Remove Neat bundles branding',
                                            'Customize colors',
                                            'Priority support',
                                        ]}
                                    />
                                </InlineStack>

                                {/* Current plan */}
                                <InlineStack gap={GapBetweenSections} align="center" blockAlign="center">
                                    <Text as="p">
                                        <u>
                                            {activeSubscription.planId === 'NONE'
                                                ? "You don't have an active plan."
                                                : `Your currently active plan is ${activeSubscription.planId}.`}
                                        </u>
                                    </Text>

                                    {activeSubscription.planId !== BillingPlanIdentifiers.BASIC && activeSubscription.planName !== 'NONE' && (
                                        <Button onClick={() => shopify.modal.show('cancel-subscription-modal')}>Cancel plan</Button>
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
