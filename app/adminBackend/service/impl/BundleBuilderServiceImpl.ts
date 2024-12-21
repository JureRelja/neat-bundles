import db from "~/db.server";
import bundleBuilderRepository from "~/adminBackend/repository/impl/BundleBuilderRepository";

export class BundleBuilderServiceImpl {
    deleteBundle(bundleId: number): void {
        // Deleting the bundle
        db.bundleBuilder.delete({
            where: {
                id: bundleId,
            },
        });
    }

    // Deleting non-allowed bundles
    async deleteNonAllowedBundles(shop: string): Promise<void> {
        //All bundles
        let bundles = (await bundleBuilderRepository.getAllBundleBuilderAndBundleStepsAsc(shop)) || [];

        //Ids of bundles that should be deleted
        const bundlesForDeleting: number[] = [];

        bundles.forEach((bundle) => {
            if (bundle.steps.length > 2) {
                bundlesForDeleting.push(bundle.id);
            }
        });

        bundles = bundles.filter((bundle) => {
            if (bundlesForDeleting.includes(bundle.id)) {
                return false;
            }
            return true;
        });

        if (bundles.length > 2) {
            bundlesForDeleting.push(...bundles.slice(2).map((bundle) => bundle.id));
        }

        await bundleBuilderRepository.deleteBundles(bundlesForDeleting);
    }
}

export const bundleBuilderService = new BundleBuilderServiceImpl();
