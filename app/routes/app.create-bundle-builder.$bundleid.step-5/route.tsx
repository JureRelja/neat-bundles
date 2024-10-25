import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate, useNavigation, useParams } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Text, Button, ButtonGroup, Select, TextField } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { error, JsonData } from "../../adminBackend/service/dto/jsonData";
import styles from "./route.module.css";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { BundleBuilderRepository } from "~/adminBackend/repository/impl/BundleBuilderRepository";
import { BundleBuilder, BundleDiscountType } from "@prisma/client";
import { useState } from "react";
import WideButton from "~/components/wideButton";
import { AuthorizationCheck } from "~/adminBackend/service/utils/AuthorizationCheck";
import { GapBetweenTitleAndContent, GapInsideSection } from "~/constants";
import { BundleBuilderClient } from "~/frontend/types/BundleBuilderClient";

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
    const params = useParams();
    const fetcher = useFetcher();

    const loaderData = useLoaderData<typeof loader>();

    const [discountType, setDiscountType] = useState(loaderData.data.discountType);
    const [discountValue, setDiscountValue] = useState(loaderData.data.discountValue);

    const handleButtonClick = (index: number) => {
        const form = new FormData();

        form.append("action", "updateDiscount");
    };

    const handleNextBtnHandler = () => {
        const form = new FormData();

        fetcher.submit(form, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}?stepNumber=4&onboarding=true` });
    };

    return (
        <div className={styles.fadeIn}>
            <BlockStack gap={"1200"} inlineAlign="center">
                <Text as={"p"} variant="headingLg" alignment="center">
                    Bundle discount
                </Text>

                <BlockStack gap={GapBetweenTitleAndContent}>
                    <Text as="p" variant="headingMd">
                        Discount
                    </Text>
                    <BlockStack gap={GapInsideSection}>
                        <Select
                            label="Type"
                            name="bundleDiscountType"
                            options={[
                                {
                                    label: "Percentage (e.g. 25% off)",
                                    value: BundleDiscountType.PERCENTAGE,
                                },
                                {
                                    label: "Fixed (e.g. 10$ off)",
                                    value: BundleDiscountType.FIXED,
                                },

                                {
                                    label: "No discount",
                                    value: BundleDiscountType.NO_DISCOUNT,
                                },
                            ]}
                            value={bundleState.discountType}
                            onChange={(newDiscountType: string) => {}}
                        />

                        <TextField
                            label="Amount"
                            type="number"
                            autoComplete="off"
                            inputMode="numeric"
                            disabled={bundleState.discountType === "NO_DISCOUNT"}
                            name={`discountValue`}
                            prefix={bundleState.discountType === BundleDiscountType.PERCENTAGE ? "%" : "$"}
                            min={0}
                            max={100}
                            value={bundleState.discountValue.toString()}
                            error={errors?.find((err: error) => err.fieldId === "discountValue")?.message}
                            onChange={(newDiscountValue) => {}}
                        />
                    </BlockStack>
                </BlockStack>

                {/*  */}
                <WideButton onClick={handleNextBtnHandler} />
            </BlockStack>
        </div>
    );
}
