import { AdminApiContext, Session } from "@shopify/shopify-app-remix/server";
import { Page } from "~/shopifyGraphql/graphql";

export interface ShopifyBundleBuilderPageRepository {
    createPage(admin: AdminApiContext, session: Session, pageTitle: string): Promise<Page>;

    createPageWithMetafields(admin: AdminApiContext, session: Session, pageTitle: string, bundleBuilderId: number): Promise<Page>;

    deletePage(admin: AdminApiContext, session: Session, pageId: string): Promise<void>;

    setPageMetafields(bundleBuilderId: number, pageId: string, session: Session, admin: AdminApiContext): Promise<void>;

    updateBundleBuilderPageTitle(admin: AdminApiContext, session: Session, shopifyPageId: string, newBundleBuilderPageTitle: string): Promise<boolean>;

    checkIfPageExists(adming: AdminApiContext, shopifyPageId: string): Promise<boolean>;
}
