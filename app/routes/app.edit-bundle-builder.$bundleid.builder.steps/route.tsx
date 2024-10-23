import {
    BlockStack,
    SkeletonPage,
    Badge,
    SkeletonBodyText,
    Card,
    Box,
    Button,
    Text,
    ButtonGroup,
    Divider,
    TextField,
    EmptyState,
    DataTable,
    InlineStack,
    Spinner,
} from "@shopify/polaris";
import { GapBetweenSections } from "../../constants";
import { Product, StepType } from "@prisma/client";
import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useNavigation, useLoaderData, useNavigate, useParams, Link, useFetcher } from "@remix-run/react";
import { TitleBar, Modal, useAppBridge } from "@shopify/app-bridge-react";
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
import { ArrowDownIcon, ArrowUpIcon, DeleteIcon, EditIcon, PageAddIcon, PlusIcon } from "@shopify/polaris-icons";
import { useState } from "react";
import styles from "./route.module.css";
import { ProductStepDataDto } from "~/adminBackend/service/dto/ProductStepDataDto";
import { ContentStepDataDto } from "~/adminBackend/service/dto/ContentStepDataDto";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect("/app");

    let allBundleSteps = await bundleBuilderStepRepository.getAllStepsForBundleId(Number(params.bundleid));

    if (allBundleSteps.length === 0) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

    return json(new JsonData(true, "success", "Bundle step succesfuly retrieved", [], { user, allBundleSteps }), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get("action") as string;

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect("/app");

    switch (action) {
        //Adding a new step to the bundle
        case "addProductStep": {
            const canAddMoreSteps = await bundleBuilderStepsService.canAddMoreSteps(Number(params.bundleid), user);

            if (!canAddMoreSteps.ok) {
                return json(canAddMoreSteps, { status: 400 });
            }
            const numOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(Number(params.bundleid));

            try {
                const stepDataJson = formData.get("stepData") as string;

                const productStepData: ProductStepDataDto = JSON.parse(stepDataJson as string);

                const newStep: BundleStepProduct = await bundleBuilderProductStepRepository.addNewStep(Number(params.bundleid), { ...productStepData, stepNumber: numOfSteps + 1 });

                if (!newStep) throw new Error("New step couldn't be created.");

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string));

                const url = new URL(request.url);

                if (url.searchParams.get("onboarding") === "true") {
                    if (url.searchParams.get("multiStep") === "true") {
                        return redirect(`/app/create-bundle-builder/${params.bundleid}/step-3`);
                    }
                    return redirect(`/app/create-bundle-builder/${params.bundleid}/step-5`);
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

        case "addContentStep": {
            const canAddMoreSteps = await bundleBuilderStepsService.canAddMoreSteps(Number(params.bundleid), user);

            if (!canAddMoreSteps.ok) {
                return json(canAddMoreSteps, { status: 400 });
            }
            const numOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(Number(params.bundleid));

            try {
                const stepDataJson = formData.get("stepData") as string;

                const contentStepData: ContentStepDataDto = JSON.parse(stepDataJson as string);

                const newStep: BundleStepContent = await bundleBuilderContentStepRepository.addNewStep(Number(params.bundleid), { ...contentStepData, stepNumber: numOfSteps + 1 });

                if (!newStep) throw new Error("New step couldn't be created.");

                // Clear the cache for the bundle
                const cacheKeyService = new ApiCacheKeyService(session.shop);

                await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid as string));

                const url = new URL(request.url);

                if (url.searchParams.get("onboarding") === "true") {
                    if (url.searchParams.get("multiStep") === "true") {
                        return redirect(`/app/create-bundle-builder/${params.bundleid}/step-3`);
                    }
                    return redirect(`/app/create-bundle-builder/${params.bundleid}/step-5`);
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

                let newStep: BundleStep | null = null;

                if (newStepType === "PRODUCT") {
                    newStep = await bundleBuilderStepRepository.addNewEmptyStep(Number(params.bundleid), StepType.PRODUCT, newStepDescription, numOfSteps + 1, newStepTitle);
                } else if (newStepType === "CONTENT") {
                    newStep = await bundleBuilderStepRepository.addNewEmptyStep(Number(params.bundleid), StepType.CONTENT, newStepDescription, numOfSteps + 1, newStepTitle);
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
                    return redirect(`/app/create-bundle-builder/${params.bundleid}/step-5`);
                }

                return redirect(`/app/edit-bundle-builder/${params.bundleid}/steps/${newStep.stepNumber}/${newStep.stepType === "CONTENT" ? "content" : "product"}`);
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
    const fetcher = useFetcher();

    //user data from the loader
    const user = useLoaderData<typeof loader>().data.user;

    const bundleBuilderSteps: BundleStep[] = useLoaderData<typeof loader>().data.allBundleSteps;

    const sortedBundleBuilderSteps = bundleBuilderSteps.sort((a, b) => a.stepNumber - b.stepNumber);

    const checkStepCount = (): boolean => {
        if (bundleBuilderSteps.length >= 5) {
            shopify.modal.show("no-more-steps-modal");
            return false;
        }

        if (user.activeBillingPlan === "BASIC" && bundleBuilderSteps.length >= 2) {
            shopify.modal.show("step-limit-modal");
            return false;
        }

        return true;
    };

    //Function for adding the step if there are less than 5 steps total
    const [newStepTitle, setNewStepTitle] = useState<string>();
    const [activeBtnOption, setActiveBtnOption] = useState<"PRODUCT" | "CONTENT">("PRODUCT");
    const addStep = async (): Promise<void> => {
        if (!checkStepCount()) return;

        shopify.modal.show("new-step-modal");
    };

    const addStepHandler = () => {
        if (!newStepTitle) return;

        const form = new FormData();
        form.append("action", "addEmptyStep");
        form.append("stepType", activeBtnOption);
        form.append("stepTitle", newStepTitle);

        fetcher.submit(form, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps` });

        shopify.modal.hide("new-step-modal");
    };

    //Duplicating the step
    const duplicateStep = async (stepNumber: number): Promise<void> => {
        if (!checkStepCount()) return;

        const form = new FormData();
        form.append("action", "duplicateStep");

        fetcher.submit(form, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps/${stepNumber}` });
    };

    const handeleStepDelete = async (stepNumber: number): Promise<void> => {
        if (!checkStepCount()) return;

        const form = new FormData();
        form.append("action", "deleteStep");

        fetcher.submit(form, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps/${stepNumber}` });
    };

    //Rearanging the steps
    const handleStepRearange = async (stepId: number, direction: "moveStepUp" | "moveStepDown"): Promise<void> => {
        const form = new FormData();

        form.append("action", direction);
        form.append("stepId", stepId.toString());

        fetcher.submit(form, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps` });
    };

    const handleNavigationOnUnsavedChanges = async (navPath: string): Promise<void> => {
        await shopify.saveBar.leaveConfirmation();

        navigate(navPath);
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
                    {/* Modal to show the customer that they've reacheda  limit and should upgrade */}
                    <Modal id="step-limit-modal">
                        <Box padding="300">
                            <BlockStack gap={GapBetweenSections}>
                                <Text as="p">You are on the 'Basic' plan which only allows you to create up to 2 steps for each bundle.</Text>
                                <Text as="p" variant="headingSm">
                                    If you want to create more steps, go to <Link to={"/app/billing"}>billing</Link> and upgrade to paid plan.
                                </Text>
                            </BlockStack>
                        </Box>
                        <TitleBar title="Maximum steps reached">
                            <button variant="primary" onClick={() => shopify.modal.hide("step-limit-modal")}>
                                Close
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Modal to alert the user that he can't have more tha 5 steps in one bundle. */}
                    <Modal id="no-more-steps-modal">
                        <Box padding="300">
                            <Text as="p">You can't add more than 5 steps for one bundle.</Text>
                        </Box>
                        <TitleBar title="Maximum steps reached">
                            <button variant="primary" onClick={() => shopify.modal.hide("no-more-steps-modal")}>
                                Close
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Title modal */}
                    <Modal id="new-step-modal">
                        <Box padding="300">
                            <BlockStack gap={GapBetweenSections}>
                                <BlockStack gap={GapBetweenSections}>
                                    <Text as="p" variant="headingSm">
                                        Enter the title of your new step
                                    </Text>
                                    <TextField
                                        label="Title"
                                        labelHidden
                                        autoComplete="off"
                                        inputMode="text"
                                        name="bundleTitle"
                                        helpText="Customer will see this title when they build a bundle."
                                        value={newStepTitle}
                                        error={newStepTitle === "" ? "Please enter a title" : undefined}
                                        onChange={(newTitile) => {
                                            setNewStepTitle(newTitile);
                                        }}
                                        type="text"
                                    />
                                </BlockStack>

                                <Divider />

                                <BlockStack gap={GapBetweenSections} align="center" inlineAlign="center">
                                    <Text as="p" variant="headingSm">
                                        Select the type of step you want to create.
                                    </Text>
                                    <ButtonGroup variant="segmented">
                                        <Button pressed={activeBtnOption === "PRODUCT"} size="large" onClick={() => setActiveBtnOption("PRODUCT")}>
                                            Product selection
                                        </Button>
                                        <Button pressed={activeBtnOption === "CONTENT"} size="large" onClick={() => setActiveBtnOption("CONTENT")}>
                                            Content input
                                        </Button>
                                    </ButtonGroup>
                                    <Text as="p" variant="bodyMd">
                                        {activeBtnOption === "PRODUCT"
                                            ? "Customers will be able to select products on this step."
                                            : "Customers will be able to add content on this step."}
                                    </Text>
                                </BlockStack>
                            </BlockStack>
                        </Box>
                        <TitleBar title="New step">
                            <button variant="primary" onClick={addStepHandler} disabled={isLoading}>
                                Create
                            </button>
                        </TitleBar>
                    </Modal>

                    <div id={styles.tableWrapper}>
                        <div className={fetcher.state !== "idle" ? styles.loadingTable : styles.hide}>
                            <Spinner accessibilityLabel="Spinner example" size="large" />
                        </div>
                        <Card>
                            <BlockStack>
                                <InlineStack align="space-between">
                                    <Text as="h2" variant="headingMd">
                                        Bundle steps
                                    </Text>

                                    <Button icon={PlusIcon} size="slim" variant="primary" onClick={addStep}>
                                        Add step
                                    </Button>
                                </InlineStack>
                                {sortedBundleBuilderSteps.length > 0 ? (
                                    <DataTable
                                        hoverable
                                        columnContentTypes={["text", "text", "text", "text", "text"]}
                                        headings={["Step", "Title", "Type", "Rearange", "Actions"]}
                                        rows={sortedBundleBuilderSteps.map((step: BundleStepBasicResources) => {
                                            return [
                                                step.stepNumber,
                                                <Link
                                                    onClick={handleNavigationOnUnsavedChanges.bind(null, `/app/edit-bundle-builder/${params.bundleid}/steps/${step.stepNumber}`)}
                                                    to={"#"}>
                                                    <div className={styles.stepTitleContainer}>
                                                        <Text as="p" tone="base">
                                                            {step.title}
                                                        </Text>
                                                    </div>
                                                </Link>,
                                                step.stepType === StepType.PRODUCT ? <Badge tone="warning">Product step</Badge> : <Badge tone="magic">Content step</Badge>,
                                                <ButtonGroup>
                                                    <InlineStack align="space-between" blockAlign="stretch">
                                                        {step.stepNumber !== sortedBundleBuilderSteps.length ? (
                                                            <Button
                                                                icon={ArrowDownIcon}
                                                                size="slim"
                                                                variant="plain"
                                                                onClick={handleStepRearange.bind(null, step.id, "moveStepDown")}
                                                            />
                                                        ) : (
                                                            <div className={styles.dummyIconPlaceholder}> </div>
                                                        )}
                                                        {step.stepNumber !== 1 && (
                                                            <Button icon={ArrowUpIcon} size="slim" variant="plain" onClick={handleStepRearange.bind(null, step.id, "moveStepUp")} />
                                                        )}
                                                    </InlineStack>
                                                </ButtonGroup>,
                                                <ButtonGroup>
                                                    <Button icon={DeleteIcon} variant="secondary" tone="critical" onClick={handeleStepDelete.bind(null, step.stepNumber)}></Button>

                                                    <Button
                                                        icon={PageAddIcon}
                                                        variant="secondary"
                                                        onClick={() => {
                                                            duplicateStep(step.stepNumber);
                                                        }}>
                                                        Duplicate
                                                    </Button>

                                                    <Button
                                                        icon={EditIcon}
                                                        variant="primary"
                                                        onClick={handleNavigationOnUnsavedChanges.bind(
                                                            null,
                                                            `/app/edit-bundle-builder/${params.bundleid}/steps/${step.stepNumber}`,
                                                        )}>
                                                        Edit
                                                    </Button>
                                                </ButtonGroup>,
                                            ];
                                        })}></DataTable>
                                ) : (
                                    <EmptyState
                                        heading="Let’s create the first step for your customers to take!"
                                        action={{
                                            content: "Create step",
                                            icon: PlusIcon,
                                            onAction: addStep,
                                        }}
                                        fullWidth
                                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png">
                                        <p>Your customers will be able to select products or add content (like text or images) at each step to their bundle.</p>
                                    </EmptyState>
                                )}
                            </BlockStack>
                        </Card>
                    </div>
                </>
            )}
        </>
    );
}
