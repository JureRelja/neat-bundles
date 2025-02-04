import { AdminApiContext } from "@shopify/shopify-app-remix/server";

export interface BundleBuildersControllerService {
    createBundleProduct(admin: AdminApiContext, productTitle: string, storeUrl: string): Promise<string | null>;
    getOnlineStorePublicationId(admin: AdminApiContext): Promise<string | null>;
    publishProductToOnlineStore(admin: AdminApiContext, productId: string, storeUrl: string): Promise<boolean>;
    createProductToBundleRedirect(admin: AdminApiContext, pageHandle: string, productHandle: string): Promise<boolean>;
}
