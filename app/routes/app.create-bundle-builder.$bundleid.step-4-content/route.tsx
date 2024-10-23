import { json, redirect } from '@remix-run/node';
import { Form, useFetcher, useLoaderData, useNavigate, useNavigation, useParams } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { BlockStack, Text, Button, InlineError, Box, InlineGrid, TextField, Divider } from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import { error, JsonData } from '../../adminBackend/service/dto/jsonData';
import styles from './route.module.css';
import userRepository from '~/adminBackend/repository/impl/UserRepository';
import { BundleBuilderRepository } from '~/adminBackend/repository/impl/BundleBuilderRepository';
import { BundleBuilder } from '@prisma/client';
import { useState } from 'react';
import ResourcePicker from '~/components/resourcePicer';
import { GapInsideSection, HorizontalGap } from '~/constants';
import { Product } from '@prisma/client';
import WideButton from '~/components/wideButton';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    if (!params.bundleid) {
        throw new Response(null, {
            status: 404,
            statusText: 'Bundle id is required',
        });
    }

    const bundleBuilder: BundleBuilder | null = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: 'Bundle with this id not found',
        });
    }

    const url = new URL(request.url);
    const multiStep = url.searchParams.get('multiStep') === 'true';

    return json(new JsonData(true, 'success', 'Loader response', [], { bundleBuilder, multiStep }), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    return json(
        {
            ...new JsonData(true, 'success', "This is the default action that doesn't do anything."),
        },
        { status: 200 },
    );
};

export default function Index() {
    const nav = useNavigation();
    const navigate = useNavigate();
    const isLoading: boolean = nav.state === 'loading';
    const isSubmitting: boolean = nav.state === 'submitting';
    const fetcher = useFetcher();
    const params = useParams();

    const loaderData = useLoaderData<typeof loader>();

    const bundleBuilder = loaderData.data.bundleBuilder;

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

        form.append('action', 'addStep');
        form.append('stepType', 'PRODUCT');
        form.append('stepTitle', stepTitle);
        form.append('minProducts', minProducts.toString());
        form.append('maxProducts', maxProducts.toString());

        fetcher.submit(form, { method: 'POST', action: `/app/edit-bundle-builder/${params.bundleid}/steps?onboardin=true&multiStep=true` });
    };

    //step data
    const [productSelectionActivated, setProductSelectionActivated] = useState<boolean>(false);
    const [stepTitle, setStepTitle] = useState<string>();
    const [stepProducts, setStepProducts] = useState<Product[]>([]);
    const [minProducts, setMinProducts] = useState<number>(1);
    const [maxProducts, setMaxProducts] = useState<number>(3);

    const updateSelectedProducts = (products: Product[]) => {
        setProductSelectionActivated(true);

        setStepProducts(products);
    };

    return (
        <div className={styles.fadeIn}>
            <BlockStack gap={'1000'} inlineAlign="center">
                {/*  */}
                <BlockStack gap={GapInsideSection}>
                    {loaderData.data.multiStep ? (
                        <Text as={'p'} variant="headingLg" alignment="center">
                            Enter the title for the first step
                        </Text>
                    ) : (
                        <Text as={'p'} variant="headingLg" alignment="center">
                            Enter the title for this step
                        </Text>
                    )}

                    <TextField
                        label="Step title"
                        labelHidden
                        error={stepTitle === '' ? 'Step title is required' : ''}
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

                <Text as={'p'} variant="headingLg" alignment="center">
                    Select the products you want to display
                </Text>

                <BlockStack gap={GapInsideSection}>
                    <ResourcePicker onBoarding stepId={undefined} selectedProducts={stepProducts} updateSelectedProducts={updateSelectedProducts} />
                    <InlineError
                        message={
                            (stepProducts.length === 0 || stepProducts.length < minProducts) && productSelectionActivated
                                ? `Please select between ${minProducts} and ${maxProducts} products`
                                : ''
                        }
                        fieldID="products"
                    />
                    <BlockStack gap={GapInsideSection}>
                        <Text as="h2" variant="headingSm">
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
                                    error={minProducts < 1 ? 'Min products must be greater than 0' : ''}
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
                                    error={maxProducts < minProducts ? 'Max products must be greater than or equal to min products' : ''}
                                />
                            </Box>
                        </InlineGrid>
                    </BlockStack>
                </BlockStack>

                {/*  */}
                <WideButton onClick={handleNextBtnHandler} />
            </BlockStack>
        </div>
    );
}
