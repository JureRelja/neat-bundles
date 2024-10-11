import { json, redirect } from '@remix-run/node';
import { Link, useActionData, useNavigate, Form, useNavigation, useLoaderData, useParams, Outlet } from '@remix-run/react';
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
import {
    DeleteIcon,
    PlusIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    PageAddIcon,
    EditIcon,
    QuestionCircleIcon,
    ExternalIcon,
    SettingsIcon,
    ClipboardIcon,
    RefreshIcon,
} from '@shopify/polaris-icons';
import { useAppBridge, Modal, TitleBar } from '@shopify/app-bridge-react';
import { authenticate } from '../../shopify.server';
import { useEffect, useState } from 'react';
import { bundlePagePreviewKey, GapBetweenSections, GapBetweenTitleAndContent, GapInsideSection } from '../../constants';
import db from '../../db.server';
import { StepType, BundlePricing, BundleDiscountType } from '@prisma/client';
import { BundleStepBasicResources } from '../../adminBackend/service/dto/BundleStep';
import { bundleBasicAndSettings, BundleFullStepBasicClient, BundleFullStepBasicServer, inclBundleFullStepsBasic } from '../../adminBackend/service/dto/Bundle';
import { JsonData, error } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '../../hooks/useNavigateSubmit';
import styles from './route.module.css';
import { ApiCacheService } from '~/adminBackend/service/utils/ApiCacheService';
import { ApiCacheKeyService } from '~/adminBackend/service/utils/ApiCacheKeyService';
import { shopifyBundleBuilderProductRepository } from '~/adminBackend/repository/impl/ShopifyBundleBuilderProductRepository';
import shopifyBundleBuilderPageRepositoryGraphql from '~/adminBackend/repository/impl/ShopifyBundleBuilderPageRepositoryGraphql';
import { ShopifyBundleBuilderPageRepository } from '~/adminBackend/repository/ShopifyBundleBuilderPageRepository';
import { BundleBuilderRepository } from '@adminBackend/repository/impl/BundleBuilderRepository';
import userRepository from '~/adminBackend/repository/impl/UserRepository';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const bundleBuilder = await db.bundleBuilder.findUnique({
        where: {
            id: Number(params.bundleid),
        },
        include: {
            ...inclBundleFullStepsBasic,
        },
    });

    if (!bundleBuilder) {
        throw new Response(null, {
            status: 404,
            statusText: 'Not Found',
        });
    }

    return json(new JsonData(true, 'success', 'Bundle succesfuly retrieved', [], bundleBuilder), { status: 200 });
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
    const navigateSubmit = useNavigateSubmit(); //Function for doing the submit with a navigation (the same if you were to use a From with a submit button)

    //Data from the loader
    const serverBundle = useLoaderData<typeof loader>().data;

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
                    <Divider borderWidth="100" borderColor="transparent" />

                    <Card padding={'300'}>
                        <InlineStack gap={GapBetweenTitleAndContent} align="center">
                            <Text variant="headingLg" as="h1">
                                {serverBundle.title} | Bundle ID: {serverBundle.id}
                            </Text>
                            {serverBundle.published ? <Badge tone="success">Active</Badge> : <Badge tone="info">Draft</Badge>}
                        </InlineStack>
                    </Card>
                    <Outlet />
                </>
            )}
        </>
    );
}
