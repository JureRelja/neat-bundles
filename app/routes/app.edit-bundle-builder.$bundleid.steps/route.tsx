import { BlockStack, SkeletonPage, Page, Badge, SkeletonBodyText, Card, FooterHelp } from "@shopify/polaris";
import { GapBetweenSections } from "../../constants";
import { StepType } from "@prisma/client";
import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useNavigation, useLoaderData, useNavigate, Outlet, useParams, Link } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import db from "../../db.server";
import { BundleStep } from "@prisma/client";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import { BundleStepBasicResources, BundleStepContent, BundleStepProduct } from "@adminBackend/service/dto/BundleStep";
import { ApiCacheService } from "~/adminBackend/service/utils/ApiCacheService";
import { ApiCacheKeyService } from "@adminBackend/service/utils/ApiCacheKeyService";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { bundleBuilderStepRepository } from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderStepRepository";
import bundleBuilderContentStepRepository from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderContentStepRepository";
import { bundleBuilderProductStepRepository } from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderProductStepRepository";
import { bundleBuilderStepsService } from "~/adminBackend/service/impl/BundleBuilderStepsService";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await authenticate.admin(request);

    let bundleStep = await bundleBuilderStepRepository.getStepByBundleIdAndStepNumber(Number(params.bundleid), Number(params.stepnum));

    if (!bundleStep) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    return json(new JsonData(true, "success", "Bundle step succesfuly retrieved", [], bundleStep), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get("action") as string;

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect("/app");

    switch (action) {
        //Adding a new step to the bundle
        case "addEmptyStep": {
            const canAddMoreSteps = await bundleBuilderStepsService.canAddMoreSteps(Number(params.bundleid), user);

            if (!canAddMoreSteps.ok) {
                return json(canAddMoreSteps, { status: 400 });
            }
            const numOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(Number(params.bundleid));

            try {
                const newStepType = formData.get("stepType") as string;

                const newStepTitle = formData.get("stepTitle") as string;

                let newStepDescription = formData.get("stepDescription")
                    ? (formData.get("stepDescription") as string)
                    : "This is the description for this step. Feel free to change it.";

                let newStep: BundleStepProduct | BundleStepContent | null = null;

                if (newStepType === "PRODUCT") {
                    newStep = await bundleBuilderProductStepRepository.addNewStep(Number(params.bundleid), newStepDescription, numOfSteps + 1, newStepTitle);
                } else if (newStepType === "CONTENT") {
                    newStep = await bundleBuilderContentStepRepository.addNewStep(Number(params.bundleid), newStepDescription, numOfSteps + 1, newStepTitle);
                }

                if (!newStep) throw new Error("New step couldn't be created.");

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string));

                const url = new URL(request.url);

                if (url.searchParams.get("onboarding") === "true") {
                    if (url.searchParams.get("multiStep") === "true") {
                        return redirect(`/app/create-bundle-builder/${params.bundleid}/step-3`);
                    }
                    return redirect(`/app/create-bundle-builder/${params.bundleid}/step-4`);
                }

                return redirect(`/app/edit-bundle-builder/${params.bundleid}/steps/${newStep.stepNumber}`);
            } catch (error) {
                console.log(error);
                return json(
                    {
                        ...new JsonData(false, "error", "There was an error with your request", [
                            {
                                fieldId: "bundleStep",
                                field: "Bundle step",
                                message: "New step could't be created.",
                            },
                        ]),
                    },
                    { status: 400 },
                );
            }
        }

        //Moving the step up
        case "moveStepDown": {
            try {
                const stepId: string = formData.get("stepId") as string;

                let step: BundleStep | null = await db.bundleStep.findUnique({
                    where: {
                        id: Number(stepId),
                    },
                });

                if (!step)
                    return json(
                        {
                            ...new JsonData(false, "error", "There was an error with your request", [
                                {
                                    fieldId: "stepId",
                                    field: "Step Id",
                                    message: "Step with the entered Id was not found.",
                                },
                            ]),
                        },
                        { status: 400 },
                    );

                const StepThatWasDown = (
                    await db.bundleStep.findMany({
                        where: {
                            stepNumber: step?.stepNumber + 1,
                            bundleBuilderId: step.bundleBuilderId,
                        },
                    })
                )[0];

                const maxStep: { _max: { stepNumber: number | null } } = await db.bundleStep.aggregate({
                    _max: {
                        stepNumber: true,
                    },
                    where: {
                        bundleBuilderId: step.bundleBuilderId,
                    },
                });

                if (maxStep._max.stepNumber === null || step.stepNumber >= maxStep._max.stepNumber) {
                    return json(
                        {
                            ...new JsonData(false, "error", "There was an error with your request", [
                                {
                                    fieldId: "stepNumber",
                                    field: "Step number",
                                    message: "This step is allready the last step in a bundle.",
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
                    ...new JsonData(true, "success", "Step moved down"),
                });
            } catch (error) {
                console.log(error);
                return json(
                    {
                        ...new JsonData(false, "error", "There was an error with your request"),
                    },
                    { status: 400 },
                );
            }
        }
        //Moving the step down
        case "moveStepUp": {
            try {
                const stepId: string = formData.get("stepId") as string;

                let step: BundleStep | null = await db.bundleStep.findUnique({
                    where: {
                        id: Number(stepId),
                    },
                });

                if (!step)
                    return json(
                        {
                            ...new JsonData(false, "error", "There was an error with your request", [
                                {
                                    fieldId: "stepId",
                                    field: "Step Id",
                                    message: "Step with the entered Id was not found.",
                                },
                            ]),
                        },
                        { status: 400 },
                    );

                const stepThatWasUp = (
                    await db.bundleStep.findMany({
                        where: {
                            stepNumber: step?.stepNumber - 1,
                            bundleBuilderId: step.bundleBuilderId,
                        },
                    })
                )[0];

                if (step.stepNumber <= 1) {
                    return json(
                        {
                            ...new JsonData(false, "error", "There was an error with your request", [
                                {
                                    fieldId: "stepNumber",
                                    field: "Step number",
                                    message: "This step is allready the first step in a bundle.",
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
                    ...new JsonData(true, "success", "Step moved up"),
                });
            } catch (error) {
                console.log(error);
                return json(
                    {
                        ...new JsonData(false, "error", "There was an error with your request"),
                    },
                    { status: 400 },
                );
            }
        }

        default:
            return json(
                {
                    ...new JsonData(true, "success", "This is the default action that doesn't do anything"),
                },
                { status: 200 },
            );
    }
};

export default function Index({}) {
    const navigate = useNavigate();
    const nav = useNavigation();
    const shopify = useAppBridge();
    const isLoading = nav.state != "idle";
    const params = useParams();

    const stepData: BundleStepBasicResources = useLoaderData<typeof loader>().data;

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
                <Page
                    titleMetadata={stepData.stepType === StepType.PRODUCT ? <Badge tone="warning">Product step</Badge> : <Badge tone="magic">Content step</Badge>}
                    backAction={{
                        content: "Products",
                        onAction: async () => {
                            // Save or discard the changes before leaving the page
                            await shopify.saveBar.leaveConfirmation();
                            navigate(`/app/edit-bundle-builder/${params.bundleid}`);
                        },
                    }}
                    title={`Edit step: ${stepData.stepNumber}`}>
                    <BlockStack gap={GapBetweenSections}>
                        <Outlet />
                        <FooterHelp>
                            You stuck? <Link to="/app/help">Get help</Link> from us, or <Link to="/app/feature-request">suggest new features</Link>.
                        </FooterHelp>
                    </BlockStack>
                </Page>
            )}
        </>
    );
}
