import { json, redirect } from '@remix-run/node';
import { useActionData, useFetcher, useLoaderData, useNavigate, useNavigation, useParams, useSubmit } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Card, BlockStack, TextField, Text, Box, SkeletonPage, SkeletonBodyText, Spinner, InlineStack, Button, Tabs, ButtonGroup } from '@shopify/polaris';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';

import { JsonData } from '../../adminBackend/service/dto/jsonData';
import styles from './route.module.css';
import userRepository from '~/adminBackend/repository/impl/UserRepository';
import { BundleBuilderRepository } from '~/adminBackend/repository/impl/BundleBuilderRepository';
import { BundleBuilder } from '@prisma/client';
import { useState } from 'react';

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

    return json(new JsonData(true, 'success', 'Loader response', [], bundleBuilder), { status: 200 });
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
    const shopify = useAppBridge();
    const isLoading: boolean = nav.state === 'loading';
    const isSubmitting: boolean = nav.state === 'submitting';
    const params = useParams();

    const loaderData = useLoaderData<typeof loader>();

    const bundleBuilder = loaderData.data;

    const [activeButtonIndex, setActiveButtonIndex] = useState(0);

    const handleButtonClick = (index: number) => {
        setActiveButtonIndex(index);
    };

    const handleNextBtnHandler = () => {
        navigate(`/app/create-bundle-builder/${params.bundleid}/step-2`);
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
                    </BlockStack>
                </SkeletonPage>
            ) : (
                <>
                    <BlockStack gap={'1200'} inlineAlign="center">
                        <Text as={'p'} variant="headingLg" alignment="center">
                            How many steps do you want your bundle builder to have?
                        </Text>

                        <ButtonGroup variant="segmented">
                            <Button pressed={activeButtonIndex === 0} size="large" onClick={() => handleButtonClick(0)}>
                                One step
                            </Button>
                            <Button pressed={activeButtonIndex === 1} size="large" onClick={() => handleButtonClick(1)}>
                                Multiple steps
                            </Button>
                        </ButtonGroup>

                        {/*  */}
                        <div style={{ width: '150px' }}>
                            {/* Save button */}
                            <Button
                                fullWidth
                                variant="primary"
                                onClick={() => {
                                    handleNextBtnHandler;
                                }}>
                                Next
                            </Button>
                        </div>
                    </BlockStack>
                </>
            )}
        </>
    );
}
