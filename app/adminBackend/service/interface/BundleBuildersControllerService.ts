export interface BundleBuildersControllerService {
    createBundleProduct(admin: any, productTitle: string, storeUrl: string): Promise<string | null>;
    getOnlineStorePublicationId(admin: any): Promise<string | null>;
    publishProductToOnlineStore(admin: any, productId: string, storeUrl: string): Promise<boolean>;
    createProductToBundleRedirect(admin: any, pageHandle: string, productHandle: string): Promise<boolean>;
}
