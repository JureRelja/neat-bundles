import { AdminApiContext, Session } from '@shopify/shopify-app-remix/server';
import { Page } from 'node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/page';
import { bundlePageKey, bundlePageNamespace, bundlePageType } from '~/constants';

export class BundlePageService {
    private bundlePage: Page;
    private session;
    private admin;
    private pageTitle;

    constructor(session: Session, admin: AdminApiContext, pageTitle: string) {
        //BundlePage
        this.bundlePage = new admin.rest.resources.Page({
            session: session,
        });

        this.session = session;
        this.admin = admin;
        this.pageTitle = pageTitle;
    }

    public getPage() {
        return this.bundlePage;
    }

    public getPageId() {
        return this.bundlePage.id;
    }

    public async asignTemplateToPage(themeId: number) {
        //Create new template and connect it to page
        const pageTemplate = new this.admin.rest.resources.Asset({ session: this.session });

        //Add data to bundle template
        pageTemplate.theme_id = themeId;
        pageTemplate.key = `templates/${this.pageTitle}.json`;

        //Add data to a bundle page
        this.bundlePage.title = this.pageTitle;

        this.bundlePage.template_suffix = this.pageTitle;
        this.bundlePage.body_html = `<p style="display: none;">This is a page for displaying the bundle created by <b>Neat bundles</b> app</p>
                                  <p style="display: none;">Neat bundles creates a page for every bundle you configure in the app. These pages are used to display the bundle to your customers.</p>
                                  <p style="display: none;">You can customize this page by adding more content or changing the layout of the page.</p>
                                  `;

        await Promise.all([
            pageTemplate.save({
                update: true,
            }),
            this.bundlePage.save({
                update: true,
            }),
        ]);
    }

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
}
