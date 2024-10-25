import { json, redirect } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Text, Button, ButtonGroup } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import styles from "./route.module.css";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { BundleBuilderRepository } from "~/adminBackend/repository/impl/BundleBuilderRepository";
import { BundleBuilder } from "@prisma/client";
import { useState } from "react";
import { GapInsideSection } from "~/constants";
import WideButton from "~/components/wideButton";
import { AuthorizationCheck } from "~/adminBackend/service/utils/AuthorizationCheck";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));

    if (!isAuthorized) {
        throw new Response(null, {
            status: 404,
            statusText: "Not Found",
        });
    }

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
    const navigate = useNavigate();
    const params = useParams();

    const handleNextBtnHandler = () => {
        navigate(`/app/create-bundle-builder/${params.bundleid}/step-4-${activeBtnOption === "CONTENT" ? "content" : "product"}?stepNumber=3stepIndex=4&onboarding=true`);
    };

    //step data
    const [activeBtnOption, setActiveBtnOption] = useState<"PRODUCT" | "CONTENT">("PRODUCT");

    return (
        <div className={styles.fadeIn}>
            <BlockStack gap={"1000"} inlineAlign="center">
                {/*  */}

                <Text as={"p"} variant="headingLg" alignment="center">
                    Select the type of the second step
                </Text>

                <BlockStack gap={GapInsideSection} inlineAlign="center">
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

                {/*  */}
                <WideButton onClick={handleNextBtnHandler} />
            </BlockStack>
        </div>
    );
}
