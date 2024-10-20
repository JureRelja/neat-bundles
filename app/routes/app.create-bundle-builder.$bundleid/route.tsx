import { json, redirect } from '@remix-run/node';
import { useActionData, useFetcher, useNavigate, useNavigation, useParams, useSubmit } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Page, Card, BlockStack, TextField, Text, Box, SkeletonPage, SkeletonBodyText, Spinner } from '@shopify/polaris';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import { useEffect, useState } from 'react';
import { GapBetweenSections } from '../../constants';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '../../hooks/useNavigateSubmit';
import styles from './route.module.css';
import userRepository from '~/adminBackend/repository/impl/UserRepository';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(session.shop);

    if (!user) return redirect('/app');

    return json(new JsonData(true, 'success', 'Loader response', []), { status: 200 });
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
    const submit = useSubmit();
    const fetcher = useFetcher();

    const [newBundleTitle, setNewBundleTitle] = useState<string>();

    const bundleOnBoardingHandle = () => {
        const form = new FormData();
        form.append('bundleTitle', newBundleTitle as string);
        form.append('action', 'createBundle');

        fetcher.submit(form, { action: `/app/users/${params.userid}/bundles?onboarding=true`, navigate: false });
    };

    return (
        <>
            {isLoading || isSubmitting ? (
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
                    {/* Title modal */}
                    <Modal id="bundle-onboarding-modal" open>
                        <Box padding="300">
                            <BlockStack gap={GapBetweenSections}>
                                <Text as="p" variant="headingSm">
                                    Enter the title of your bundle.
                                </Text>
                                <TextField
                                    label="Title"
                                    labelHidden
                                    autoComplete="off"
                                    inputMode="text"
                                    name="bundleTitle"
                                    helpText="This title will be displayed to your customers on bundle page, in checkout and in cart."
                                    value={newBundleTitle}
                                    error={newBundleTitle === '' ? 'Please enter a title' : undefined}
                                    onChange={(newTitile) => {
                                        setNewBundleTitle(newTitile);
                                    }}
                                    type="text"
                                />
                            </BlockStack>
                        </Box>
                        <TitleBar title="Bundle title">
                            <button variant="primary" onClick={bundleOnBoardingHandle} disabled={fetcher.state !== 'idle'}>
                                Next
                                {fetcher.state !== 'idle' && <Spinner accessibilityLabel="Spinner example" size="large" />}
                            </button>
                        </TitleBar>
                    </Modal>

                    {/* Edit bundle page */}
                    <Page title={`Create a new bundle`}></Page>
                </>
            )}
        </>
    );
}
