import { useNavigation, json, useLoaderData, Link, useNavigate, redirect } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Card, BlockStack, SkeletonPage, Text, SkeletonBodyText, Divider, InlineStack, Button, Banner, Spinner, Box } from '@shopify/polaris';
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
import { Modal, TitleBar } from '@shopify/app-bridge-react';

export type PricingInterval = 'MONTHLY' | 'YEARLY';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin, billing } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [PRO_PLAN_MONTHLY, PRO_PLAN_YEARLY],
        isTest: true,
    });
    console.log(appSubscriptions);

    if (hasActivePayment) return appSubscriptions[0].name;

    if (user.activeBillingPlan === 'BASIC') return BASIC_PLAN; //free plan

    return 'NONE';
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session, billing } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    const { hasActivePayment, appSubscriptions } = await billing.check({
        plans: [PRO_PLAN_MONTHLY, PRO_PLAN_YEARLY],
        isTest: true,
    });

    const formData = await request.formData();
    const action = formData.get('action');

    let isUpgrading = true;

    switch (action) {
        case 'CANCEL': {
            if (hasActivePayment) {
                const cancelledSubscription = await billing.cancel({
                    subscriptionId: appSubscriptions[0].id,
                    isTest: true,
                    prorate: false,
                });

                isUpgrading = false;
            }
            await userRepository.updateUser({ ...user, activeBillingPlan: 'NONE' });
            break;
        }

        case BASIC_PLAN: {
            if (hasActivePayment) {
                const cancelledSubscription = await billing.cancel({
                    subscriptionId: appSubscriptions[0].id,
                    isTest: true,
                    prorate: false,
                });

                isUpgrading = false;
            }

            await userRepository.updateUser({ ...user, activeBillingPlan: 'BASIC' });

            break;
        }
        case PRO_PLAN_MONTHLY: {
            // if (appSubscriptions[0].name === PROFESIONAL) {
            //     isUpgrading = false;
            // }

            const res = await billing.request({
                plan: PRO_PLAN_MONTHLY,
                isTest: true,
                returnUrl: `https://admin.shopify.com/store/${session.shop.split('.')[0]}/apps/neat-bundles/app/installation?thankYou=true`,
            });

            await userRepository.updateUser({ ...user, activeBillingPlan: 'PRO' });
            break;
        }
        case PRO_PLAN_YEARLY: {
            const res = await billing.request({
                plan: PRO_PLAN_YEARLY,
                isTest: true,
                returnUrl: `https://admin.shopify.com/store/${session.shop.split('.')[0]}/apps/neat-bundles/app/installation?thankYou=true`,
            });

            await userRepository.updateUser({ ...user, activeBillingPlan: 'PRO' });
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

    if (isUpgrading) return redirect(`https://admin.shopify.com/store/${session.shop.split('.')[0]}/apps/neat-bundles/app/installation?thankYou=true`);

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
    const [showModal, setShowModal] = useState<boolean>(false);

    const handlePricingIntervalToogle = () => {
        setPricingInterval((state: PricingInterval) => {
            if (state === 'MONTHLY') return 'YEARLY';

            return 'MONTHLY';
        });
    };

    const handleSubscription = (subscriptionIdentifier: string) => {
        asyncSubmit.submit(subscriptionIdentifier, '/app/billing');
    };

    const handleCanclePlan = async () => {
        setShowModal(true);
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
                    <Modal id="cancel-subscription-modal" open={showModal}>
                        <Box padding="300">
                            <Text as="p">
                                If you cancel the subscription, you'll need to choose another plan (free plan included) if you want to continue using Neat bundles app.
                            </Text>
                        </Box>
                        <TitleBar title="Cancel confirmation">
                            <button onClick={() => setShowModal(false)}>Close</button>
                            <button
                                variant="primary"
                                tone="critical"
                                onClick={() => {
                                    asyncSubmit.submit('CANCEL', `/app/billing`);
                                    setShowModal(false);
                                }}>
                                Cancel
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
                            <div className={asyncSubmit.state != 'idle' ? styles.loadingTable : styles.hide}>
                                <Spinner accessibilityLabel="Spinner example" size="large" />
                            </div>
                            <BlockStack align="center" gap={LargeGapBetweenSections}>
                                <Banner onDismiss={() => {}}>
                                    <Text as="p">
                                        Select the plan that best suits your needs. <b>For a limited time we have a generous free plan</b> that should be enough to get your
                                        customers started with custome bundles.
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
                                        title={{ yearly: 'Basic', monthly: 'Basic' }}
                                        monthlyPricing={'Free'}
                                        yearlyPricing={'Free'}
                                        pricingInterval={pricingInterval}
                                        features={['Create up to 5 bundles', 'Create product steps', 'Customize colors', 'Customer support']}
                                    />
                                    <PricingPlan
                                        activePlan={activeSubscription === PRO_PLAN_MONTHLY || activeSubscription === PRO_PLAN_YEARLY}
                                        subscriptionIdentifier={{ yearly: PRO_PLAN_YEARLY, monthly: PRO_PLAN_MONTHLY }}
                                        handleSubscription={handleSubscription}
                                        title={{ yearly: 'Pro (yearly)', monthly: 'Pro (monthly)' }}
                                        monthlyPricing={'$4.99'}
                                        yearlyPricing={'$49.99'}
                                        pricingInterval={pricingInterval}
                                        features={['Create unlimited bundles', 'Create product steps', 'Colect images and text on steps', 'Customize colors', 'Priority support']}
                                    />
                                </InlineStack>

                                {/* Current plan */}
                                <InlineStack gap={GapBetweenSections} align="center" blockAlign="center">
                                    <Text as="p">
                                        <u>{activeSubscription === 'NONE' ? "You don't have an active plan." : `Your currently active plan is ${activeSubscription}.`}</u>
                                    </Text>

                                    {activeSubscription !== BASIC_PLAN && activeSubscription !== 'NONE' && (
                                        <>
                                            <Button onClick={() => handleCanclePlan()}>Cancel plan</Button>

                                            <Banner onDismiss={() => {}} tone="warning">
                                                <Text as="p">
                                                    Note: If you cancel the current plan, you will have to choose on of the remaiming plans (including Free plan) to continue using
                                                    Neat bundles app.
                                                </Text>
                                            </Banner>
                                        </>
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
