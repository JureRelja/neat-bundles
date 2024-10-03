import { AdminApiContext, Session } from '@shopify/shopify-app-remix/server';
import { Page, PageCreatePayload } from '@shopifyGraphql/graphql';
import { bundlePageKey, bundlePageNamespace, bundlePageType } from '~/constants';
import { ShopifyBundleBuilderPageRepository } from '../ShopifyBundleBuilderPageRepository';

export class ShopifyBundleBuilderPageGraphql implements ShopifyBundleBuilderPageRepository {
    constructor() {}

    public async createPage(admin: AdminApiContext, session: Session, pageTitle: string): Promise<{ id: string; handle: string }> {
        //BundlePage
        const pageResponse = await admin.graphql(
            `#graphql 
            mutation pageCreate($page: PageCreateInput!) {
                pageCreate(page: $page) {
                    page {
                    # Page fields
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
                    page: {
                        title: pageTitle,
                        body: `<p>This is a page for displaying the bundle created by <b>Neat bundles</b> app</p>
        <p>Neat bundles creates a page for every bundle you configure in the app. These pages are used to display the bundle to your customers.</p>
        <p>You can delete this text or customize this page like every other page using Shopify admin.</p>
        `,
                    },
                },
            },
        );

        const pageData = (await pageResponse.json()).data;

        const pageCreatePayload: PageCreatePayload = pageData.pageCreate;

        if (pageCreatePayload.userErrors.length > 0) {
            throw new Error('Failed to create the bundle builder page');
        }

        const bundleBuilderPage = pageData.pageCreate.page;

        return bundleBuilderPage;
    }

    public async createPageWithMetafields(admin: AdminApiContext, session: Session, pageTitle: string, bundleBuilderId: number): Promise<{ id: string; handle: string }> {
        //BundlePage
        const pageResponse = await admin.graphql(
            `#graphql 
            mutation pageCreate($page: PageCreateInput!) {
                pageCreate(page: $page) {
                    page {
                    # Page fields
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
                    page: {
                        title: pageTitle,
                        metafields: [
                            {
                                key: bundlePageKey,
                                value: bundleBuilderId,
                                type: bundlePageType,
                                namespace: bundlePageNamespace,
                            },
                        ],
                        body: `<p>This is a page for displaying the bundle created by <b>Neat bundles</b> app</p>
        <p>Neat bundles creates a page for every bundle you configure in the app. These pages are used to display the bundle to your customers.</p>
        <p>You can delete this text or customize this page like every other page using Shopify admin.</p>`,
                    },
                },
            },
        );

        const pageData = (await pageResponse.json()).data;

        if (pageData.pageCreate.userErrors.length > 0) {
            console.log(pageData.pageCreate.userErrors);
            throw new Error('Failed to create the bundle builder page');
        }

        const bundleBuilderPage = pageData.pageCreate.page;

        return bundleBuilderPage;
    }

    public async deletePage(admin: AdminApiContext, session: Session, pageId: string): Promise<void> {
        const deletePageResponse = await admin.graphql(
            `#graphql
            mutation deletePage($id: ID!) {
                pageDelete(id: $id) {
                    page {
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
                    id: pageId,
                },
            },
        );
    }

    public async setPageMetafields(bundleBuilderId: number, pageId: string, session: Session, admin: AdminApiContext): Promise<void> {
        //Adding the bundleId metafield to the page for easier identification

        const pageMetafieldsUpdateResponse = await admin.graphql(
            `#graphql
            mutation updatePageMetafields($id: ID!, $page: PageUpdateInput!) {
                pageUpdate(id: $id, page: $page) {
                    page {
                        # Page fields
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
                    id: pageId,
                    page: {
                        metafields: [
                            {
                                key: bundlePageKey,
                                value: bundleBuilderId,
                                type: bundlePageType,
                                namespace: bundlePageNamespace,
                            },
                        ],
                    },
                },
            },
        );

        const pageMetafieldsUpdateData = (await pageMetafieldsUpdateResponse.json()).data;

        if (pageMetafieldsUpdateData.pageUpdate.userErrors.length > 0) {
            console.log(pageMetafieldsUpdateData.pageUpdate.userErrors);

            throw new Error('Failed to update the bundle builder page metafields');
        }
    }

    public async updateBundleBuilderPageTitle(admin: AdminApiContext, session: Session, shopifyPageId: number, newBundleBuilderPageTitle: string): Promise<boolean> {
        const updatePageTitleResponse = await admin.graphql(
            `#graphql
            mutation updatePageTitle($id: ID!, $page: PageCreateInput!) {
                pageUpdate(id: $id, page: $page) {ShopifyBundleBuilderPage
                    page {
                        title
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`,
            {
                variables: {
                    id: shopifyPageId,
                    page: {
                        title: newBundleBuilderPageTitle,
                    },
                },
            },
        );

        const updatePageTitleData = (await updatePageTitleResponse.json()).data;

        if (updatePageTitleData.pageUpdate.userErrors.length > 0) {
            console.log(updatePageTitleData.pageUpdate.userErrors);
            return false;
        }

        return true;
    }
}

const shopifyBundleBuilderPageRepository = new ShopifyBundleBuilderPageGraphql();

export default shopifyBundleBuilderPageRepository;
