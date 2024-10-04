// import { AdminApiContext, Session } from '@shopify/shopify-app-remix/server';
// import { Page } from 'node_modules/@shopify/shopify-api/dist/ts/rest/admin/2023-10/page';
// import { bundlePageKey, bundlePageNamespace, bundlePageType } from '~/constants';
// import { ShopifyBundleBuilderPageRepository } from '../ShopifyBundleBuilderPageRepository';

// export class ShopifyBundleBuilderPageREST implements ShopifyBundleBuilderPageRepository {
//     constructor() {}

//     public async createPage(admin: AdminApiContext, session: Session, pageTitle: string): Promise<{ id: string; handle: string }> {
//         //BundlePage
//         const bundleBuilderPage = new admin.rest.resources.Page({
//             session: session,
//         });

//         //Add data to a bundle page
//         bundleBuilderPage.title = pageTitle;
//         bundleBuilderPage.author = 'Neat bundles';
//         bundleBuilderPage.body_html = `<p style="display: none;">This is a page for displaying the bundle created by <b>Neat bundles</b> app</p>
//     <p style="display: none;">Neat bundles creates a page for every bundle you configure in the app. These pages are used to display the bundle to your customers.</p>
//     <p style="display: none;">You can customize this page by adding more content or changing the layout of the page.</p>
//     `;

//         await bundleBuilderPage.save({
//             update: true,
//         });

//         return bundleBuilderPage;
//     }

//     public async createPageWithMetafields(admin: AdminApiContext, session: Session, pageTitle: string, bundleBuilderId: number): Promise<Page> {
//         //BundlePage
//         const bundleBuilderPage = new admin.rest.resources.Page({
//             session: session,
//         });

//         //Add data to a bundle page
//         bundleBuilderPage.title = pageTitle;
//         (bundleBuilderPage.metafields = [
//             {
//                 key: bundlePageKey,
//                 value: bundleBuilderId,
//                 type: bundlePageType,
//                 namespace: bundlePageNamespace,
//             },
//         ]),
//             (bundleBuilderPage.author = 'Neat bundles');
//         bundleBuilderPage.body_html = `<p style="display: none;">This is a page for displaying the bundle created by <b>Neat bundles</b> app</p>
//     <p style="display: none;">Neat bundles creates a page for every bundle you configure in the app. These pages are used to display the bundle to your customers.</p>
//     <p style="display: none;">You can customize this page by adding more content or changing the layout of the page.</p>
//     `;

//         await bundleBuilderPage.save({
//             update: true,
//         });

//         return bundleBuilderPage;
//     }

//     public async deletePage(admin: AdminApiContext, session: Session, pageId: string): Promise<void> {
//         const deletePageResponse = await admin.rest.resources.Page.delete({
//             session: session,
//             id: pageId,
//         });
//     }

//     public async setPageMetafields(bundleBuilderId: number, pageId: string, session: Session, admin: AdminApiContext): Promise<void> {
//         const bundleBuilderPage: Page | null = await admin.rest.resources.Page.find({
//             session: session,
//             id: pageId,
//         });

//         if (!bundleBuilderPage) throw new Error('Bundle builder page not found');

//         //Adding the bundleId metafield to the page for easier identification
//         bundleBuilderPage.metafields = [
//             {
//                 key: bundlePageKey,
//                 value: bundleBuilderId,
//                 type: bundlePageType,
//                 namespace: bundlePageNamespace,
//             },
//         ];

//         await bundleBuilderPage.save({
//             update: true,
//         });
//     }

//     public async updateBundleBuilderPageTitle(admin: AdminApiContext, session: Session, shopifyPageId: number, newBundleBuilderPageTitle: string): Promise<boolean> {
//         const bundleBuilderPage: Page | null = await admin.rest.resources.Page.find({
//             session: session,
//             id: shopifyPageId,
//         });

//         if (!bundleBuilderPage) return false;

//         bundleBuilderPage.title = newBundleBuilderPageTitle;

//         await bundleBuilderPage.save({
//             update: true,
//         });

//         return true;
//     }
// }

// const shopifyBundleBuilderPageRepositoryREST = new ShopifyBundleBuilderPageREST();

// export default shopifyBundleBuilderPageRepositoryREST;
