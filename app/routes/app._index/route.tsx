import { json, Navigate, redirect } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import { ShopifyCatalogRepository } from '~/adminBackend/repository/impl/ShopifyCatalogRepository';
import userRepository from '~/adminBackend/repository/impl/UserRepository';
import { Shop } from '@shopifyGraphql/graphql';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session } = await authenticate.admin(request);

    const user = await userRepository.getUserByStoreUrl(admin, session.shop);

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
                    ...new JsonData(false, 'error', 'Failed to get the publication id of the online store', [], []),
                },
                { status: 500 },
            );
        }

        await userRepository.createUser(admin, session.shop, data.email, data.name, data.primaryDomain.url, onlineStorePublicationId);

        return redirect('/app/installation');
    }

    // return null;
    return redirect('/app/bundles');
};

export default function Index() {
    return <p>Home page</p>;
}
