import { Button, BlockStack, InlineStack, Divider, SkeletonPage, Page, Badge, Layout } from '@shopify/polaris';
import { GapBetweenSections } from '../../constants';
import { StepType } from '@prisma/client';
import { json, redirect } from '@remix-run/node';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useNavigation, useLoaderData, useNavigate, Outlet, useParams, useRevalidator } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import db from '../../db.server';
import { BundleStep } from '@prisma/client';
import { JsonData } from '../../types/jsonData';
import { bundleStepBasic, BundleStepBasicResources } from '~/types/BundleStep';
import { useEffect, useRef, useState } from 'react';
import styles from './route.module.css';
import BundlePreview from './bundlePreview';
import { ApiCacheService } from '~/service/impl/ApiCacheService';
import { ApiCacheKeyService } from '~/service/impl/ApiCacheKeyService';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await authenticate.admin(request);

    let bundleStep: BundleStepBasicResources | null;

    if (!params.stepnum) {
        bundleStep = await db.bundleStep.findFirst({
            where: {
                bundleId: Number(params.bundleid),
                stepNumber: Number(1),
            },
            select: bundleStepBasic,
        });
    } else {
        bundleStep = await db.bundleStep.findFirst({
            where: {
                bundleId: Number(params.bundleid),
                stepNumber: Number(params.stepnum),
            },
            select: bundleStepBasic,
        });
    }

    if (!bundleStep) {
        throw new Response(null, {
            status: 404,
            statusText: 'Not Found',
        });
    }

    return json(new JsonData(true, 'success', 'Bundle step succesfuly retrieved', [], bundleStep), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action') as string;

    switch (action) {
        //Adding a new step to the bundle
        case 'addStep': {
            const numOfSteps = await db.bundleStep.aggregate({
                _max: {
                    stepNumber: true,
                },
                where: {
                    bundleId: Number(params.bundleid),
                },
            });

            if (numOfSteps._max.stepNumber === 5)
                return json(
                    {
                        ...new JsonData(false, 'error', 'There was an error with your request', [
                            {
                                fieldId: 'stepsLength',
                                field: 'Number of total stepss',
                                message: "You can't have more than 5 steps",
                            },
                        ]),
                    },
                    { status: 400 },
                );

            try {
                const newStep: BundleStep = await db.bundleStep.create({
                    data: {
                        bundleId: Number(params.bundleid),
                        stepNumber: numOfSteps._max.stepNumber ? numOfSteps._max.stepNumber + 1 : 1,
                        stepType: StepType.PRODUCT,
                        title: 'Step ' + (numOfSteps._max.stepNumber ? numOfSteps._max.stepNumber + 1 : 1),
                        productInput: {
                            create: {},
                        },
                        contentInputs: {
                            create: [{}, {}],
                        },
                    },
                });

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string));

                return redirect(`/app/bundles/${params.bundleid}/steps/${newStep.stepNumber}`);
            } catch (error) {
                console.log(error);
                return json(
                    {
                        ...new JsonData(false, 'error', 'There was an error with your request', [
                            {
                                fieldId: 'bundleStep',
                                field: 'Bundle step',
                                message: "New step could't be created.",
                            },
                        ]),
                    },
                    { status: 400 },
                );
            }
        }

        //Moving the step up
        case 'moveStepDown': {
            try {
                const stepId: string = formData.get('id') as string;

                let step: BundleStep | null = await db.bundleStep.findUnique({
                    where: {
                        id: Number(stepId),
                    },
                });

                if (!step)
                    return json(
                        {
                            ...new JsonData(false, 'error', 'There was an error with your request', [
                                {
                                    fieldId: 'stepId',
                                    field: 'Step Id',
                                    message: 'Step with the entered Id was not found.',
                                },
                            ]),
                        },
                        { status: 400 },
                    );

                const StepThatWasDown = (
                    await db.bundleStep.findMany({
                        where: {
                            stepNumber: step?.stepNumber + 1,
                            bundleId: step.bundleId,
                        },
                    })
                )[0];

                const maxStep: { _max: { stepNumber: number | null } } = await db.bundleStep.aggregate({
                    _max: {
                        stepNumber: true,
                    },
                    where: {
                        bundleId: step.bundleId,
                    },
                });

                if (maxStep._max.stepNumber === null || step.stepNumber >= maxStep._max.stepNumber) {
                    return json(
                        {
                            ...new JsonData(false, 'error', 'There was an error with your request', [
                                {
                                    fieldId: 'stepNumber',
                                    field: 'Step number',
                                    message: 'This step is allready the last step in a bundle.',
                                },
                            ]),
                        },
                        { status: 400 },
                    );
                }

                await db.$transaction([
                    //Increment the step on which the operation was clicked
                    db.bundleStep.update({
                        where: {
                            id: step.id,
                        },
                        data: {
                            stepNumber: {
                                increment: 1,
                            },
                        },
                    }),

                    db.bundleStep.update({
                        where: {
                            id: StepThatWasDown.id,
                        },
                        data: {
                            stepNumber: {
                                decrement: 1,
                            },
                        },
                    }),
                ]);

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await Promise.all([
                    ApiCacheService.multiKeyDelete(await cacheKeyService.getAllStepsKeys(params.bundleid as string)),
                    ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string)),
                ]);

                return json({
                    ...new JsonData(true, 'success', 'Step moved down'),
                });
            } catch (error) {
                console.log(error);
                return json(
                    {
                        ...new JsonData(false, 'error', 'There was an error with your request'),
                    },
                    { status: 400 },
                );
            }
        }
        //Moving the step down
        case 'moveStepUp': {
            try {
                const stepId: string = formData.get('id') as string;

                let step: BundleStep | null = await db.bundleStep.findUnique({
                    where: {
                        id: Number(stepId),
                    },
                });

                if (!step)
                    return json(
                        {
                            ...new JsonData(false, 'error', 'There was an error with your request', [
                                {
                                    fieldId: 'stepId',
                                    field: 'Step Id',
                                    message: 'Step with the entered Id was not found.',
                                },
                            ]),
                        },
                        { status: 400 },
                    );

                const stepThatWasUp = (
                    await db.bundleStep.findMany({
                        where: {
                            stepNumber: step?.stepNumber - 1,
                            bundleId: step.bundleId,
                        },
                    })
                )[0];

                if (step.stepNumber <= 1) {
                    return json(
                        {
                            ...new JsonData(false, 'error', 'There was an error with your request', [
                                {
                                    fieldId: 'stepNumber',
                                    field: 'Step number',
                                    message: 'This step is allready the first step in a bundle.',
                                },
                            ]),
                        },
                        { status: 400 },
                    );
                }
                await db.$transaction([
                    //Update the step
                    db.bundleStep.update({
                        where: {
                            id: Number(stepId),
                        },
                        data: {
                            stepNumber: {
                                decrement: 1,
                            },
                        },
                    }),
                    //Update the step that was before this step
                    db.bundleStep.update({
                        where: {
                            id: stepThatWasUp.id,
                        },
                        data: {
                            stepNumber: {
                                increment: 1,
                            },
                        },
                    }),
                ]);

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await Promise.all([
                    ApiCacheService.multiKeyDelete(await cacheKeyService.getAllStepsKeys(params.bundleid as string)),
                    ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string)),
                ]);

                return json({
                    ...new JsonData(true, 'success', 'Step moved up'),
                });
            } catch (error) {
                console.log(error);
                return json(
                    {
                        ...new JsonData(false, 'error', 'There was an error with your request'),
                    },
                    { status: 400 },
                );
            }
        }

        default:
            return json(
                {
                    ...new JsonData(true, 'success', "This is the default action that doesn't do anything"),
                },
                { status: 200 },
            );
    }
};

export default function Index({}) {
    const navigate = useNavigate();
    const nav = useNavigation();
    const shopify = useAppBridge();
    const isLoading = nav.state != 'idle';
    const params = useParams();
    const revalidator = useRevalidator();

    const stepData: BundleStepBasicResources = useLoaderData<typeof loader>().data;

    //Sticky preview box logic
    const [sticky, setSticky] = useState({ isSticky: false, offset: 0 });
    const previewBoxRef = useRef<HTMLDivElement>(null);

    // handle scroll event
    const handleScroll = (elTopOffset: number, elHeight: number) => {
        if (window.scrollY > elTopOffset + 30) {
            setSticky({ isSticky: true, offset: elHeight });
        } else {
            setSticky({ isSticky: false, offset: 0 });
        }
    };

    // add/remove scroll event listener
    useEffect(() => {
        if (window.innerWidth < 1040) return;
        let previewBox = previewBoxRef.current?.getBoundingClientRect();
        const handleScrollEvent = () => {
            handleScroll(previewBox?.top || 0, previewBox?.height || 0);
        };

        window.addEventListener('scroll', handleScrollEvent);

        return () => {
            window.removeEventListener('scroll', handleScrollEvent);
        };
    }, []);

    return (
        <>
            {isLoading ? (
                <SkeletonPage />
            ) : (
                <Page
                    fullWidth
                    titleMetadata={stepData.stepType === StepType.PRODUCT ? <Badge tone="warning">Product step</Badge> : <Badge tone="magic">Content step</Badge>}
                    backAction={{
                        content: 'Products',
                        onAction: async () => {
                            // Save or discard the changes before leaving the page
                            await shopify.saveBar.leaveConfirmation();
                            navigate(`/app/bundles/${params.bundleid}`);
                        },
                    }}
                    title={`Edit step - ${stepData.stepNumber}`}>
                    <BlockStack gap={GapBetweenSections}>
                        <Layout>
                            <Layout.Section>
                                <div ref={previewBoxRef} className={`${sticky.isSticky ? styles.sticky : ''}`}>
                                    <BlockStack gap={GapBetweenSections}>
                                        {/* <BundlePreview /> */}
                                        <BundlePreview />

                                        {/* Navigation between steps */}
                                        <InlineStack align="space-between">
                                            <Button
                                                disabled={stepData.stepNumber === 1}
                                                onClick={() => {
                                                    revalidator.revalidate();
                                                    navigate(`/app/bundles/${params.bundleid}/steps/${stepData.stepNumber - 1}`);
                                                }}>
                                                ← Step {stepData.stepNumber !== 1 ? (stepData.stepNumber - 1).toString() : '1'}
                                            </Button>

                                            <Button
                                                disabled={stepData.stepNumber === 3}
                                                onClick={() => {
                                                    revalidator.revalidate();
                                                    navigate(`/app/bundles/${params.bundleid}/steps/${stepData.stepNumber + 1}`);
                                                }}>
                                                Step {stepData.stepNumber !== 3 ? (stepData.stepNumber + 1).toString() : '3'} →
                                            </Button>
                                        </InlineStack>
                                        <Divider borderColor="transparent" />
                                    </BlockStack>
                                </div>
                            </Layout.Section>
                            <Layout.Section variant="oneThird">
                                <Outlet />
                            </Layout.Section>
                        </Layout>
                        <Divider borderColor="transparent" />
                    </BlockStack>
                </Page>
            )}
        </>
    );
}
