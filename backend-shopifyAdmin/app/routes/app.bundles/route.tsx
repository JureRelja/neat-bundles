import { redirect, json, Outlet } from '@remix-run/react';
import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../../shopify.server';
import { JsonData } from '../../types/jsonData';
import { BundlePageService } from '@adminBackend/service/BundlePageService';
import { BundleRepository } from '@adminBackend/repository/BundleRepository';
import { ShopifyBundleProductService } from '~/adminBackend/service/ShopifyBundleProductService';

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
                const maxBundleId = await BundleRepository.getMaxBundleId(session.shop);

                const defaultBundleTitle = `New bundle ${maxBundleId ? maxBundleId : ''}`;

                //Create a new product that will be used as a bundle wrapper
                const bundleProduct = await ShopifyBundleProductService.createBundleProduct(admin, defaultBundleTitle);

                if (!bundleProduct || !bundleProduct) {
                    return;
                }

                //Service for creating and managing new page
                const bundlePageService = await BundlePageService.build(session, admin, defaultBundleTitle);

                if (!bundlePageService.getPage() || !bundlePageService.getPage().id) {
                    return;
                }

                const [urlRedirectRes, bundleId] = await Promise.all([
                    admin.graphql(
                        `#graphql
                        mutation createProductToBundleRedirect($input: UrlRedirectInput!) {
                          urlRedirectCreate(urlRedirect: $input) {
                            urlRedirect {
                              id
                            }
                            userErrors {
                                field
                                message
                              }
                          }
                        }`,
                        {
                            variables: {
                                input: {
                                    path: `/pages/${bundlePageService.getPage().handle}`,
                                    target: `/products/${bundleProduct.handle}`,
                                },
                            },
                        },
                    ),
                    //Create new bundle
                    BundleRepository.createNewBundle(session.shop, defaultBundleTitle, bundleProduct.id, bundlePageService.getPage().id?.toString() as string),
                ]);

                const urlRedirectData = await urlRedirectRes.json();

                if (urlRedirectData.data.userErrors) {
                    console.log(urlRedirectData.data.userErrors);
                    return;
                }

                bundlePageService.setPageMetafields(bundleId);

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
