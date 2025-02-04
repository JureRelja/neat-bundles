import { bundleBuilderStepRepository } from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderStepRepository";

export class BundleBuilderDeleteStepService {
    public async deleteStep(bundleId: number, stepNumber: number): Promise<void> {
        const stepDeleted = await bundleBuilderStepRepository.deleteStepByBundleBuilderIdAndStepNumber(bundleId, stepNumber);
    }
}

export const bundleBuilderDeleteStepService = new BundleBuilderDeleteStepService();
