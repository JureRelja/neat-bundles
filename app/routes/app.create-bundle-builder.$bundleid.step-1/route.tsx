import { json, redirect } from "@remix-run/node";
import { useNavigate, useNavigation, useParams } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Text, Button, ButtonGroup } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import styles from "./route.module.css";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { BundleBuilderRepository } from "~/adminBackend/repository/impl/BundleBuilderRepository";
import { BundleBuilder } from "@prisma/client";
import { useState } from "react";
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

    return json(new JsonData(true, "success", "Loader response", [], bundleBuilder), { status: 200 });
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
    const params = useParams();

    const [activeBtnOption, setActiveBtnOption] = useState<"singleStep" | "multiStep">("multiStep");

    const handleNextBtnHandler = () => {
        navigate(`/app/create-bundle-builder/${params.bundleid}/step-2-product?multiStep=${activeBtnOption === "multiStep" ? "true" : "false"}`);
    };

    return (
        <div className={styles.fadeIn}>
            <BlockStack gap={"1200"} inlineAlign="center">
                <Text as={"p"} variant="headingLg" alignment="center">
                    How many steps do you want your bundle builder to have?
                </Text>

                <ButtonGroup variant="segmented">
                    <Button pressed={activeBtnOption === "singleStep"} size="large" onClick={() => setActiveBtnOption("singleStep")}>
                        One step
                    </Button>
                    <Button pressed={activeBtnOption === "multiStep"} size="large" onClick={() => setActiveBtnOption("multiStep")}>
                        Multiple steps
                    </Button>
                </ButtonGroup>

                {/*  */}
                <WideButton onClick={handleNextBtnHandler} />
            </BlockStack>
        </div>
    );
}
