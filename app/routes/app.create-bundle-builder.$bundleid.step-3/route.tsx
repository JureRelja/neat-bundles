import { json, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useNavigate, useNavigation, useParams } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Text, Button, InlineError, Box, InlineGrid, TextField, Divider, ChoiceList, ButtonGroup } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { error, JsonData } from "../../adminBackend/service/dto/jsonData";
import styles from "./route.module.css";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { BundleBuilderRepository } from "~/adminBackend/repository/impl/BundleBuilderRepository";
import { BundleBuilder, StepType } from "@prisma/client";
import { useState } from "react";
import ResourcePicker from "~/components/resourcePicer";
import { GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection, HorizontalGap } from "~/constants";
import { Product } from "@prisma/client";
import WideButton from "~/components/wideButton";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect("/app");

    if (!params.bundleid) {
        throw new Response(null, {
            status: 404,
            statusText: "Bundle id is required",
        });
    }

    const bundleBuilder: BundleBuilder | null = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: "Bundle with this id not found",
        });
    }

    const url = new URL(request.url);
    const multiStep = url.searchParams.get("multiStep") === "true";

    return json(new JsonData(true, "success", "Loader response", [], { bundleBuilder, multiStep }), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get("action");

    return json(
        {
            ...new JsonData(true, "success", "This is the default action that doesn't do anything."),
        },
        { status: 200 },
    );
};

export default function Index() {
    const nav = useNavigation();
    const navigate = useNavigate();
    const isLoading: boolean = nav.state === "loading";
    const isSubmitting: boolean = nav.state === "submitting";
    const fetcher = useFetcher();
    const params = useParams();

    const loaderData = useLoaderData<typeof loader>();

    const bundleBuilder = loaderData.data.bundleBuilder;

    const handleNextBtnHandler = () => {
        const form = new FormData();

        form.append("action", "addStep");
        form.append("stepType", "PRODUCT");
        form.append("stepTitle", stepTitle);

        fetcher.submit(form, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps?onboarding=true` });
    };

    //step data
    const [activeBtnOption, setActiveBtnOption] = useState<"PRODUCT" | "CONTENT">("PRODUCT");
    const [stepTitle, setStepTitle] = useState<string>("");

    return (
        <div className={styles.fadeIn}>
            <BlockStack gap={"1000"} inlineAlign="center">
                {/*  */}
                <BlockStack gap={GapInsideSection}>
                    <Text as={"p"} variant="headingLg" alignment="center">
                        Enter the title for the second step
                    </Text>

                    <TextField
                        label="Step title"
                        labelHidden
                        error={stepTitle === "" ? "Step title is required" : ""}
                        type="text"
                        name={`stepTitle`}
                        value={stepTitle}
                        helpText="Customer will see this title when they build a bundle."
                        onChange={(newTitle: string) => {
                            setStepTitle(newTitle);
                        }}
                        autoComplete="off"
                    />
                </BlockStack>

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
                        {activeBtnOption === "PRODUCT" ? "Customers will be able to select products on this step." : "Customers will be able to add content on this step."}
                    </Text>
                </BlockStack>

                {/*  */}
                <WideButton onClick={handleNextBtnHandler} />
            </BlockStack>
        </div>
    );
}
