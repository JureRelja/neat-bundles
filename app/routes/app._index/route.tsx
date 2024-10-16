import { json, useLoaderData, useNavigate } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { ShopifyCatalogRepository } from '~/adminBackend/repository/impl/ShopifyCatalogRepository';
import userRepository from '~/adminBackend/repository/impl/UserRepository';
import { Shop } from '@shopifyGraphql/graphql';
import { useEffect } from 'react';
import { BlockStack, Card, SkeletonBodyText, SkeletonPage } from '@shopify/polaris';
import { PRO_PLAN_MONTHLY, PRO_PLAN_YEARLY } from '~/constants';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session, billing } = await authenticate.admin(request);

    let user = await userRepository.getUserByStoreUrl(session.shop);

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

        const data: Shop = (await response.json()).data.shop;

        const onlineStorePublicationId = await ShopifyCatalogRepository.getOnlineStorePublicationId(admin);

        if (!onlineStorePublicationId) {
            return json(
                {
                    ...new JsonData(false, 'error', 'Failed to get the publication id of the online store', [], { redirect: '/app/error' }),
                },
                { status: 500 },
            );
        }

        user = await userRepository.createUser(session.shop, data.email, data.name, data.primaryDomain.url, onlineStorePublicationId);

        //welcome emails
        //etc.
    }

    if (!user.hasAppInstalled) {
        await userRepository.updateUser({ ...user, hasAppInstalled: true });
    }

    if (user.activeBillingPlan === 'NONE') {
        const { hasActivePayment, appSubscriptions } = await billing.check({
            plans: [PRO_PLAN_MONTHLY, PRO_PLAN_YEARLY],
            isTest: true,
        });

        if (!hasActivePayment) {
            return json(
                {
                    ...new JsonData(true, 'success', "Customer doesn't have an active subscription.", [], { redirect: '/app/billing' }),
                },
                { status: 500 },
            );
        }
    }

    if (!user.completedInstallation) {
        return json(
            {
                ...new JsonData(true, 'success', 'Customer freshly installed the app.', [], { redirect: '/app/installation' }),
            },
            { status: 500 },
        );
    }

    return json(
        {
            ...new JsonData(true, 'success', 'Customer freshly installed the app.', [], { redirect: '/app/bundles' }),
        },
        { status: 500 },
    );
};

export default function Index() {
    const loaderResponse = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    useEffect(() => {
        navigate(loaderResponse.data.redirect);
    }, [loaderResponse]);

    return (
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
    );
}
