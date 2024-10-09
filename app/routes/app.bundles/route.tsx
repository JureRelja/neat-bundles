import { redirect, json, Outlet } from '@remix-run/react';
import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import { JsonData } from '../../adminBackend/service/dto/jsonData';
import shopifyBundleBuilderPageRepositoryGraphql from '~/adminBackend/repository/impl/ShopifyBundleBuilderPageRepositoryGraphql';
import { ShopifyBundleBuilderPageRepository } from '@adminBackend/repository/ShopifyBundleBuilderPageRepository';
import { BundleBuilderRepository } from '~/adminBackend/repository/impl/BundleBuilderRepository';
import { ShopifyRedirectRepository } from '~/adminBackend/repository/impl/ShopifyRedirectRepository';
import { shopifyBundleBuilderProductRepository } from '~/adminBackend/repository/impl/ShopifyBundleBuilderProductRepository';
import { shopifyProductVariantRepository } from '~/adminBackend/repository/impl/ShopifyProductVariantRepository';

export const loader = async ({ request }: ActionFunctionArgs) => {
    await authenticate.admin(request);

    // const formData = await request.formData();
    // if (!formData) {
    //   return redirect("/app");
    // }

    return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { session, admin } = await authenticate.admin(request);

    const formData = await request.formData();
    const action = formData.get('action');

    switch (action) {
        case 'createBundle': {
            try {
                const maxBundleId = await BundleBuilderRepository.getMaxBundleBuilderId(session.shop);

                const defaultBundleTitle = `New bundle ${maxBundleId ? maxBundleId : ''}`;

                //Create a new product that will be used as a bundle wrapper
                const bundleProductId = await shopifyBundleBuilderProductRepository.createBundleProduct(admin, defaultBundleTitle, session.shop);

                //Repository for creating a new page
                const shopifyBundleBuilderPage: ShopifyBundleBuilderPageRepository = shopifyBundleBuilderPageRepositoryGraphql;

                const bundleBuilderPage = await shopifyBundleBuilderPage.createPage(admin, session, defaultBundleTitle);

                const [urlRedirectRes, bundleId] = await Promise.all([
                    //Create redirect
                    ShopifyRedirectRepository.createProductToBundleRedirect(admin, bundleBuilderPage.handle as string, bundleProductId),
                    //Create new bundle
                    BundleBuilderRepository.createNewBundleBuilder(session.shop, defaultBundleTitle, bundleProductId, String(bundleBuilderPage.id), bundleBuilderPage.handle),
                ]);

                await Promise.all([
                    shopifyBundleBuilderPage.setPageMetafields(bundleId, bundleBuilderPage.id, session, admin),

                    shopifyProductVariantRepository.createProductVariant(admin, bundleId, bundleProductId, 0, 0),
                ]);

                return redirect(`/app/bundles/${bundleId}`);
            } catch (error) {
                console.log(error);
            }
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
    return <Outlet />;
}
