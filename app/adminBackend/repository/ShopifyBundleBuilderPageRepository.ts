import { AdminApiContext, Session } from '@shopify/shopify-app-remix/server';
import { Page } from '@shopifyGraphql/graphql';

export interface ShopifyBundleBuilderPageRepository {
    createPage(admin: AdminApiContext, session: Session, pageTitle: string): Promise<{ id: string; handle: string }>;

    createPageWithMetafields(admin: AdminApiContext, session: Session, pageTitle: string, bundleBuilderId: number): Promise<{ id: string; handle: string }>;

    deletePage(admin: AdminApiContext, session: Session, pageId: string): Promise<void>;

    setPageMetafields(bundleBuilderId: number, pageId: string, session: Session, admin: AdminApiContext): Promise<void>;

    updateBundleBuilderPageTitle(admin: AdminApiContext, session: Session, shopifyPageId: number, newBundleBuilderPageTitle: string): Promise<boolean>;
}
