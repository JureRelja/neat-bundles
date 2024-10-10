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
import { shopifyDiscountRepository } from '~/adminBackend/repository/impl/ShopifyDiscountRepository';

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

                //Repository for creating a new page
                const shopifyBundleBuilderPage: ShopifyBundleBuilderPageRepository = shopifyBundleBuilderPageRepositoryGraphql;

                const [bundleProductId, bundleBuilderPage] = await Promise.all([
                    //Create a new product that will be used as a bundle wrapper
                    shopifyBundleBuilderProductRepository.createBundleProduct(admin, defaultBundleTitle, session.shop),

                    //Create new page that will be used to display the bundle
                    shopifyBundleBuilderPage.createPage(admin, session, defaultBundleTitle),
                ]);

                const [urlRedirectRes, bundle] = await Promise.all([
                    //Create redirect
                    ShopifyRedirectRepository.createProductToBundleRedirect(admin, bundleBuilderPage.handle as string, bundleProductId),
                    //Create new bundle
                    BundleBuilderRepository.createNewBundleBuilder(session.shop, defaultBundleTitle, bundleProductId, String(bundleBuilderPage.id), bundleBuilderPage.handle),
                ]);

                await shopifyBundleBuilderPage.setPageMetafields(bundle.id, bundleBuilderPage.id, session, admin);

                return redirect(`/app/bundles/${bundle.id}`);
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
