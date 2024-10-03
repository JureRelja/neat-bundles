import { BundleBuildersControllerService } from '../BundleBuildersControllerService';

class BundleBuildersControllerServiceImpl implements BundleBuildersControllerService {
    createBundleProduct(admin: any, productTitle: string, storeUrl: string): Promise<string | null> {
        throw new Error('Method not implemented.');
    }
    getOnlineStorePublicationId(admin: any): Promise<string | null> {
        throw new Error('Method not implemented.');
    }
    publishProductToOnlineStore(admin: any, productId: string, storeUrl: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    createProductToBundleRedirect(admin: any, pageHandle: string, productHandle: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
