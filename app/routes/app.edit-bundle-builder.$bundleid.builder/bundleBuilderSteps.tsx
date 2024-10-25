import type { BundleStep, User } from "@prisma/client";
import { StepType } from "@prisma/client";
import { useNavigate, useNavigation, useParams, useFetcher, useSubmit, useRevalidator, Link } from "@remix-run/react";
import { useAppBridge, TitleBar, Modal } from "@shopify/app-bridge-react";
import {
    SkeletonPage,
    BlockStack,
    Card,
    SkeletonBodyText,
    Box,
    TextField,
    Divider,
    ButtonGroup,
    Button,
    Spinner,
    InlineStack,
    DataTable,
    Badge,
    Text,
    EmptyState,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import type { BundleStepBasicResources } from "~/adminBackend/service/dto/BundleStep";
import { GapBetweenSections } from "~/constants";
import { ArrowDownIcon, ArrowUpIcon, DeleteIcon, EditIcon, PageAddIcon, PlusIcon } from "@shopify/polaris-icons";
import styles from "./bundelBuilderSteps.module.css";

export default function Index({ user, bundleBuilderSteps }: { user: User; bundleBuilderSteps: BundleStep[] }): JSX.Element {
    const navigate = useNavigate();
    const nav = useNavigation();
    const shopify = useAppBridge();
    const isLoading = nav.state != "idle";
    const params = useParams();
    const fetcher = useFetcher();
    const submit = useSubmit();
    const revalidator = useRevalidator();

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

        if (activeBtnOption === "PRODUCT") {
            const stepData = {
                title: newStepTitle,
                description: "",
                stepNumber: bundleBuilderSteps.length + 1,
                stepType: "PRODUCT",
                productInput: {
                    minProducts: 0,
                    maxProducts: 0,
                },
            };
            form.append("stepData", JSON.stringify(stepData));
            form.append("action", "addProductStep");
        } else {
            const stepData = {
                title: newStepTitle,
                description: "",
                stepNumber: bundleBuilderSteps.length + 1,
                stepType: "CONTENT",
            };
            form.append("stepData", JSON.stringify(stepData));
            form.append("action", "addContentStep");
        }

        submit(form, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps` });

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

    useEffect(() => {
        //revalidator.revalidate();
    }, [fetcher.state]);

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
                            <button variant="primary" type="button" onClick={() => shopify.modal.hide("step-limit-modal")}>
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
                            <button variant="primary" type="button" onClick={() => shopify.modal.hide("no-more-steps-modal")}>
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
                                            Product step
                                        </Button>
                                        <Button pressed={activeBtnOption === "CONTENT"} size="large" onClick={() => setActiveBtnOption("CONTENT")}>
                                            Content step
                                        </Button>
                                    </ButtonGroup>
                                    <Text as="p" variant="bodyMd">
                                        {activeBtnOption === "PRODUCT"
                                            ? "Customers will be able to select products on this step."
                                            : "Customers will be able to enter content (text, image, etc) on this step."}
                                    </Text>
                                </BlockStack>
                            </BlockStack>
                        </Box>
                        <TitleBar title="New step">
                            <button variant="primary" type="button" onClick={addStepHandler} disabled={isLoading}>
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
                                                            `/app/edit-bundle-builder/${params.bundleid}/steps/${step.stepNumber}/${step.stepType === StepType.PRODUCT ? "product" : "content"}`,
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
