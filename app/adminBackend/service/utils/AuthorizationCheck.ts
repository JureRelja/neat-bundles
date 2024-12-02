import bundleBuilderRepository from "~/adminBackend/repository/impl/BundleBuilderRepository";

// Function to check if the bundle is published and belongs to the store
export async function AuthorizationCheck(storeUrl: string, bundleId: number): Promise<boolean> {
    try {
        //Checking if the the bundle is published and belongs to the store
        const bundleBuilder = await bundleBuilderRepository.getBundleBuilderByIdAndStoreUrl(bundleId, storeUrl);

        console.log("bundleBuilder", bundleBuilder);

        if (!bundleBuilder) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
    return true;
}
