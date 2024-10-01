import { redirect, json, Outlet } from '@remix-run/react';
import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import { JsonData } from '../../types/jsonData';
import { ShopifyBundleBuilderPage } from '~/adminBackend/service/ShopifyBundleBuilderPage';
import { BundleRepository } from '~/adminBackend/repository/BundleBuilderRepository';
import { ShopifyBundleProductRepository } from '~/adminBackend/repository/ShopifyBundleProductRepository';
import { ShopifyRedirectRepository } from '~/adminBackend/repository/ShopifyRedirectRepository';
import userRepository from '~/adminBackend/repository/UserRepository';

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
                const maxBundleId = await BundleRepository.getMaxBundleBuilderId(session.shop);

                const defaultBundleTitle = `New bundle ${maxBundleId ? maxBundleId : ''}`;

                //Create a new product that will be used as a bundle wrapper
                const bundleProductId = await ShopifyBundleProductRepository.createBundleProduct(admin, defaultBundleTitle, session.shop);

                if (!bundleProductId) {
                    return;
                }

                //Service for creating and managing new page
                const bundlePageService = await ShopifyBundleBuilderPage.build(session, admin, defaultBundleTitle);

                if (!bundlePageService.getPage() || !bundlePageService.getPage().id) {
                    throw new Error('Failed to create a new bundle page');
                    return;
                }

                const bundlePageHandle = bundlePageService.getPageHandle();
                const user = await userRepository.getUserByStoreUrl(admin, session.shop);

                //Url of the bundle page
                const bundlePageUrl = `${user.primaryDomain}/pages/${bundlePageHandle}`;

                const [urlRedirectRes, bundleId] = await Promise.all([
                    //Create redirect
                    ShopifyRedirectRepository.createProductToBundleRedirect(admin, bundlePageService.getPage().handle as string, bundleProductId),
                    //Create new bundle
                    BundleRepository.createNewBundleBuilder(session.shop, defaultBundleTitle, bundleProductId, bundlePageService.getPage().id?.toString() as string, bundlePageUrl),
                ]);

                await bundlePageService.setPageMetafields(bundleId);

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
