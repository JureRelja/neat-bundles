import db from "~/db.server";
import bundleBuilderRepository from "~/adminBackend/repository/impl/BundleBuilderRepository";

export class BundleBuilderServiceImpl {
    constructor() {}

    deleteBundle(bundleId: number): void {
        // Deleting the bundle
        db.bundleBuilder.delete({
            where: {
                id: bundleId,
            },
        });
    }

    async deleteNonAllowedBundles(shop: string): Promise<void> {
        // Deleting non-allowed bundles
        const bundles = await bundleBuilderRepository.getAllBundleBuilderAndBundleStepsAsc(shop);

        bundles?.forEach((bundle) => {
            if (bundle.steps.length > 2) {
                bundleBuilderRepository.deleteBundleBuilderById(bundle.id);
            }
        });
    }
}

export const bundleBuilderService = new BundleBuilderServiceImpl();
