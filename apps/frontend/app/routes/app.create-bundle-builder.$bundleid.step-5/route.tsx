import { json } from "@remix-run/node";
import { useLoaderData, useParams, useSubmit } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Text, Select, TextField } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import type { error } from "../../adminBackend/service/dto/jsonData";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import styles from "./route.module.css";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { BundleBuilderRepository } from "~/adminBackend/repository/impl/BundleBuilderRepository";
import type { BundleBuilder } from "@prisma/client";
import { useState } from "react";
import WideButton from "~/components/wideButton";
import { AuthorizationCheck } from "~/adminBackend/service/utils/AuthorizationCheck";
import { GapInsideSection, LargeGapBetweenSections } from "~/constants";
import { BundleDiscountTypeClient } from "~/types/BundleDiscountTypeClient";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { session, redirect } = await authenticate.admin(request);

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
    // const { admin, session } = await authenticate.admin(request);

    // const formData = await request.formData();
    // const action = formData.get("action");

    return json(
        {
            ...new JsonData(true, "success", "This is the default action that doesn't do anything."),
        },
        { status: 200 },
    );
};

export default function Index() {
    const submit = useSubmit();
    const params = useParams();

    const loaderData = useLoaderData<typeof loader>();

    const [discountType, setDiscountType] = useState<BundleDiscountTypeClient>(loaderData.data.discountType as BundleDiscountTypeClient);
    const [discountValue, setDiscountValue] = useState<number>(loaderData.data.discountValue ?? 0);

    const [errors, setErrors] = useState<error[]>([]);

    const handleNextBtnHandler = () => {
        if (discountValue <= 0 || discountValue >= 100) {
            setErrors([
                {
                    fieldId: "discountValue",
                    field: "discountValue",
                    message: "Discount value should be between 0 and 100",
                },
            ]);
            return;
        }

        const form = new FormData();

        form.append("action", "updateDiscount");
        form.append("discountType", discountType);
        form.append("discountValue", discountValue.toString());

        submit(form, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/builder?stepNumber=5&onboarding=true` });
    };

    return (
        <div className={styles.fadeIn}>
            <BlockStack gap={"1000"} inlineAlign="center">
                <BlockStack gap={GapInsideSection}>
                    <Text as={"p"} variant="headingLg" alignment="center">
                        Enter bundle discount
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                        Customers are more likely to buy a bundle if they know they are getting a discount.
                    </Text>
                </BlockStack>

                <div style={{ width: "300px" }}>
                    <BlockStack gap={LargeGapBetweenSections}>
                        <Select
                            label="Discount Type"
                            name="bundleDiscountType"
                            options={[
                                {
                                    label: "Percentage (e.g. 25% off)",
                                    value: BundleDiscountTypeClient.PERCENTAGE,
                                },
                                {
                                    label: "Fixed (e.g. 10$ off)",
                                    value: BundleDiscountTypeClient.FIXED,
                                },

                                {
                                    label: "No discount",
                                    value: BundleDiscountTypeClient.NO_DISCOUNT,
                                },
                            ]}
                            value={discountType}
                            onChange={(newDiscountType: string) => {
                                setDiscountType(newDiscountType as BundleDiscountTypeClient);
                            }}
                        />
                        <TextField
                            label="Discount amount"
                            type="number"
                            autoComplete="off"
                            inputMode="numeric"
                            disabled={discountType === "NO_DISCOUNT"}
                            name={`discountValue`}
                            prefix={discountType === BundleDiscountTypeClient.PERCENTAGE ? "%" : "$"}
                            min={0}
                            max={100}
                            value={discountValue.toString()}
                            error={errors?.find((err: error) => err.fieldId === "discountValue")?.message}
                            onChange={(newDiscountValue) => {
                                setDiscountValue(Number(newDiscountValue));
                            }}
                        />
                    </BlockStack>
                </div>

                {/*  */}
                <WideButton onClick={handleNextBtnHandler} />
            </BlockStack>
        </div>
    );
}
