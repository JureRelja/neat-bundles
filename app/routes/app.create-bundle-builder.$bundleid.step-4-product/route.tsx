import { json } from "@remix-run/node";
import { useParams, useSubmit } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { BlockStack, Text, InlineError, Box, InlineGrid, TextField } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { JsonData } from "../../adminBackend/service/dto/jsonData";
import styles from "./route.module.css";
import userRepository from "~/adminBackend/repository/impl/UserRepository";
import { BundleBuilderRepository } from "~/adminBackend/repository/impl/BundleBuilderRepository";
import type { BundleBuilder, Product } from "@prisma/client";
import { useState } from "react";
import ResourcePicker from "~/components/resourcePicer";
import { GapBetweenTitleAndContent, GapInsideSection, HorizontalGap } from "~/constants";
import WideButton from "~/components/wideButton";
import { AuthorizationCheck } from "~/adminBackend/service/utils/AuthorizationCheck";
import type { ProductStepDataDto } from "~/adminBackend/service/dto/ProductStepDataDto";
import type { ProductClient } from "~/types/ProductClient";

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
    await authenticate.admin(request);

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
    const params = useParams();
    const submit = useSubmit();

    const handleNextBtnHandler = () => {
        if (stepProducts.length === 0 || stepProducts.length < minProducts) {
            setProductSelectionActivated(true);
            return;
        }

        if (minProducts < 1 || maxProducts < minProducts) {
            setProductSelectionActivated(true);
            return;
        }

        if (!stepTitle) {
            setProductSelectionActivated(true);
            return;
        }

        const form = new FormData();

        const stepData: ProductStepDataDto = {
            title: stepTitle,
            description: "",
            stepType: "PRODUCT",
            stepNumber: 2,
            productInput: {
                minProductsOnStep: minProducts,
                maxProductsOnStep: maxProducts,
                products: stepProducts,
                allowProductDuplicates: false,
                showProductPrice: true,
            },
        };

        form.append("stepData", JSON.stringify(stepData));
        form.append("action", "addProductStep");

        submit(form, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps?stepNumber=4&onboarding=true`, navigate: true });
    };

    //step data
    const [productSelectionActivated, setProductSelectionActivated] = useState<boolean>(false);
    const [stepTitle, setStepTitle] = useState<string>();
    const [stepProducts, setStepProducts] = useState<ProductClient[]>([]);
    const [minProducts, setMinProducts] = useState<number>(1);
    const [maxProducts, setMaxProducts] = useState<number>(3);

    const updateSelectedProducts = (products: Product[]) => {
        setProductSelectionActivated(true);

        setStepProducts(products);
    };

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
                        helpText="Customers will see this title when they build a bundle."
                        onChange={(newTitle: string) => {
                            setStepTitle(newTitle);
                        }}
                        autoComplete="off"
                    />
                </BlockStack>

                <BlockStack gap={"600"} inlineAlign="center">
                    <BlockStack gap={GapBetweenTitleAndContent}>
                        <Text as={"p"} variant="headingLg" alignment="center">
                            Select the products you want to display on this step
                        </Text>
                        <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                            This is a product step, where customers can choose products to add to their bundle.
                        </Text>
                    </BlockStack>

                    <BlockStack gap={GapInsideSection}>
                        <ResourcePicker onBoarding stepId={undefined} selectedProducts={stepProducts} updateSelectedProducts={updateSelectedProducts} />
                        <InlineError
                            message={
                                (stepProducts.length === 0 || stepProducts.length < minProducts) && productSelectionActivated
                                    ? `Please select at least ${minProducts} products.`
                                    : ""
                            }
                            fieldID="products"
                        />
                        <BlockStack gap={GapInsideSection}>
                            <Text as="h2" variant="headingMd">
                                Product rules
                            </Text>

                            <InlineGrid columns={2} gap={HorizontalGap}>
                                <Box id="minProducts">
                                    <TextField
                                        label="Minimum products to select"
                                        type="number"
                                        helpText="Customers must select at least this number of products on this step."
                                        autoComplete="off"
                                        inputMode="numeric"
                                        name={`minProducts`}
                                        min={1}
                                        max={maxProducts}
                                        value={minProducts.toString()}
                                        onChange={(value) => {
                                            setMinProducts(Number(value));
                                        }}
                                        error={minProducts < 1 ? "Min products must be greater than 0" : ""}
                                    />
                                </Box>

                                <Box id="maxProducts">
                                    <TextField
                                        label="Maximum products to select"
                                        helpText="Customers can select up to this number of products on this step."
                                        type="number"
                                        autoComplete="off"
                                        inputMode="numeric"
                                        name={`maxProducts`}
                                        min={minProducts > 0 ? minProducts : 1}
                                        value={maxProducts.toString()}
                                        onChange={(value) => {
                                            setMaxProducts(Number(value));
                                        }}
                                        error={maxProducts < minProducts ? "Max products must be greater than or equal to min products" : ""}
                                    />
                                </Box>
                            </InlineGrid>
                        </BlockStack>
                    </BlockStack>
                </BlockStack>

                {/*  */}
                <WideButton onClick={handleNextBtnHandler} />
            </BlockStack>
        </div>
    );
}
