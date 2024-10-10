import { json, redirect } from '@remix-run/node';
import { Link, useActionData, useNavigate, Form, useNavigation, useLoaderData, useParams } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
    Page,
    Card,
    Button,
    BlockStack,
    TextField,
    Text,
    Box,
    SkeletonPage,
    ChoiceList,
    SkeletonBodyText,
    SkeletonDisplayText,
    ButtonGroup,
    DataTable,
    EmptyState,
    InlineStack,
    Badge,
    Select,
    Tooltip,
    Icon,
    Spinner,
    Divider,
    Layout,
} from '@shopify/polaris';
import { DeleteIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon, PageAddIcon, EditIcon, QuestionCircleIcon, ExternalIcon, SettingsIcon, RefreshIcon } from '@shopify/polaris-icons';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import { useEffect, useState } from 'react';
import { bundlePagePreviewKey, GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection } from '../../constants';
import db from '../../db.server';
import { StepType, BundlePricing, BundleDiscountType } from '@prisma/client';
import { BundleStepBasicResources } from '../../adminBackend/service/dto/BundleStep';
import { BundleFullStepBasicClient } from '../../adminBackend/service/dto/Bundle';
import { JsonData, error } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '../../hooks/useNavigateSubmit';
import styles from './route.module.css';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    // const bundleBuilder = await db.bundleBuilder.findUnique({
    //     where: {
    //         id: Number(params.bundleid),
    //     },
    //     include: inclBundleFullStepsBasic,
    // });

    // if (!bundleBuilder) {
    //     throw new Response(null, {
    //         status: 404,
    //         statusText: 'Not Found',
    //     });
    // }

    // const user = await userRepository.getUserByStoreUrl(admin, session.shop);

    // //Url of the bundle page
    // const bundleBuilderPageUrl = `${user.primaryDomain}/pages/${bundleBuilder.bundleBuilderPageHandle}`;

    // const bundleBuilderWithPageUrl: BundleFullStepBasicServer = { ...bundleBuilder, bundleBuilderPageUrl };

    return json(new JsonData(true, 'success', 'Bundle succesfuly retrieved', [], null), { status: 200 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case 'updateSettings': {
        }

        default: {
            return json(
                {
                    ...new JsonData(true, 'success', "This is the default action that doesn't do anything."),
                },
                { status: 200 },
            );
        }
    }
};

export default function Index() {
    const nav = useNavigation();
    const navigate = useNavigate();
    const shopify = useAppBridge();
    const isLoading: boolean = nav.state === 'loading';
    const isSubmitting: boolean = nav.state === 'submitting';
    const params = useParams();
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit with a navigation (the same if you were to use a From with a submit button)
    const actionData = useActionData<typeof action>();

    const asyncSubmit = useAsyncSubmit(); //Function for doing the submit action where the only data is action and url

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
                    {/* Edit bundle page */}
                    <Page
                        backAction={{
                            content: 'Products',
                            onAction: async () => {
                                // Save or discard the changes before leaving the page
                                await shopify.saveBar.leaveConfirmation();
                            },
                        }}
                        title="Global settings"
                        subtitle="Edit the behaviour of all bundles"
                        compactTitle>
                        <Form method="POST" data-discard-confirmation data-save-bar>
                            <BlockStack gap={GapBetweenSections}></BlockStack>
                        </Form>
                    </Page>
                </>
            )}
        </>
    );
}
