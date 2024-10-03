import { useNavigation, json, useLoaderData, Link } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import {
    Page,
    Card,
    Button,
    BlockStack,
    EmptyState,
    Banner,
    Text,
    Box,
    MediaCard,
    VideoThumbnail,
    SkeletonPage,
    SkeletonBodyText,
    SkeletonDisplayText,
    DataTable,
    ButtonGroup,
    Badge,
    Spinner,
    Divider,
} from '@shopify/polaris';
import { PlusIcon, ExternalIcon, EditIcon, DeleteIcon, SettingsIcon } from '@shopify/polaris-icons';
import { authenticate } from '../../shopify.server';
import db from '../../db.server';
import { User } from '@prisma/client';
import { BundleAndStepsBasicServer, BundleAndStepsBasicClient, bundleAndSteps } from '../../adminBackend/service/dto/Bundle';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { useAsyncSubmit } from '../../hooks/useAsyncSubmit';
import { useNavigateSubmit } from '~/hooks/useNavigateSubmit';
import styles from '../app.bundles.$bundleid/route.module.css';
import { ShopifyCatalogRepository } from '~/adminBackend/repository/impl/ShopifyCatalogRepository';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request);

    const user: User | null = await db.user.findUnique({
        where: {
            storeUrl: session.shop,
        },
    });

    if (!user) {
        const response = await admin.graphql(
            `#graphql
        query  {
          shop {
            name
            email
            primaryDomain {
              url
            }
          }
        }`,
        );

        const data = await response.json();

        const onlineStorePublicationId = await ShopifyCatalogRepository.getOnlineStorePublicationId(admin);

        if (!onlineStorePublicationId) {
            return json(
                {
                    ...new JsonData(false, 'error', 'Failed to get the publication id of the online store', [], []),
                },
                { status: 500 },
            );
        }

        await db.user.create({
            data: {
                ownerName: '',
                storeUrl: session.shop,
                email: data.data.shop.email,
                storeName: data.data.shop.name,
                primaryDomain: data.data.shop.primaryDomain.url,
                onlineStorePublicationId: onlineStorePublicationId,
            },
        });
    }

    const bundleBuilders: BundleAndStepsBasicServer[] = await db.bundleBuilder.findMany({
        where: {
            user: {
                storeUrl: session.shop,
            },
            deleted: false,
        },
        select: bundleAndSteps,
        orderBy: {
            createdAt: 'desc',
        },
    });

    return json(
        {
            ...new JsonData(true, 'success', 'Bundles were succesfully returned', [], bundleBuilders),
        },
        { status: 200 },
    );
};
