import { AdminApiContext, Session } from '@shopify/shopify-app-remix/server';
import { Page } from 'node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/page';
import { bundlePageKey, bundlePageNamespace, bundlePageType } from '~/constants';

export class ShopifyBundleBuilderPage {
    private bundlePage: Page;
    private admin;
    private pageTitle;

    constructor(admin: AdminApiContext, pageTitle: string, bundlePage: Page) {
        this.admin = admin;
        this.bundlePage = bundlePage;
        this.pageTitle = pageTitle;
    }

    public static async build(session: Session, admin: AdminApiContext, pageTitle: string) {
        //BundlePage
        const bundlePage = new admin.rest.resources.Page({
            session: session,
        });

        //Add data to a bundle page
        bundlePage.title = pageTitle;
        bundlePage.author = 'Neat bundles';
        bundlePage.body_html = `<p style="display: none;">This is a page for displaying the bundle created by <b>Neat bundles</b> app</p>
        <p style="display: none;">Neat bundles creates a page for every bundle you configure in the app. These pages are used to display the bundle to your customers.</p>
        <p style="display: none;">You can customize this page by adding more content or changing the layout of the page.</p>
        `;

        await bundlePage.save({
            update: true,
        });

        return new ShopifyBundleBuilderPage(admin, pageTitle, bundlePage);
    }

    public getPage() {
        return this.bundlePage;
    }

    public getPageId() {
        return this.bundlePage.id;
    }

    // public async asignTemplateToPage(themeId: number) {
    //     //Create new template and connect it to page
    //     const pageTemplate = new this.admin.rest.resources.Asset({ session: this.session });

    //     //Add data to bundle template
    //     pageTemplate.theme_id = themeId;
    //     pageTemplate.key = `templates/page.test.json`;
    //     pageTemplate.source_key = 'templates/page.json';

    //     this.bundlePage.template_suffix = 'test';

    //     pageTemplate.save({
    //         update: true,
    //     }),
    //         console.log('pagetemplate saved');

    //     // await Promise.all([
    //     //     pageTemplate.save({
    //     //         update: true,
    //     //     }),
    //     //
    //     // ]);

    //     return pageTemplate;
    // }

    public async setPageMetafields(bundleId: number) {
        //Adding the bundleId metafield to the page for easier identification
        this.bundlePage.metafields = [
            {
                key: bundlePageKey,
                value: bundleId,
                type: bundlePageType,
                namespace: bundlePageNamespace,
            },
        ];

        await this.bundlePage.save({
            update: true,
        });
    }

    public getPageHandle(): string {
        if (!this.bundlePage.handle) {
            throw new Error('Page handle is not set');
        }
        return this.bundlePage.handle;
    }

    public static async updateBundleBuilderPageTitle(admin: AdminApiContext, session: Session, shopifyPageId: number, newBundleBuilderPageTitle: string): Promise<boolean> {
        const bundleBuilderPage: Page | null = admin.rest.resources.Page.find({
            session: session,
            id: shopifyPageId,
        });

        if (!bundleBuilderPage) return false;

        bundleBuilderPage.title = newBundleBuilderPageTitle;

        await bundleBuilderPage.save();

        return true;
    }
}
