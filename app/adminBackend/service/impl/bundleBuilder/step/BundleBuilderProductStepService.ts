import { BundleBuilderStepTypeService } from "./BundleBuilderStepTypeService";
import { BundleStepProduct } from "../../../dto/BundleStep";
import { error } from "../../../dto/jsonData";
import { bundleBuilderProductStepRepository } from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderProductStepRepository";
import { bundleBuilderStepsService } from "../../BundleBuilderStepsService";

class BundleBuilderProductStepService extends BundleBuilderStepTypeService {
    public checkIfErrorsInStepData(stepData: BundleStepProduct): error[] {
        const errors: error[] = [];

        if (!stepData.productInput?.minProductsOnStep) {
            errors.push({
                fieldId: "minProducts",
                field: "Minimum products on step",
                message: "Please enter the minimum number of products (1 or more) that the customer can select on this step.",
            });
        } else if (!stepData.productInput?.maxProductsOnStep) {
            errors.push({
                fieldId: "maxProducts",
                field: "Maximum products on step",
                message: "Please enter the maximum number of products (1 or more) that the customer can select on this step.",
            });
        } else if (stepData.productInput?.minProductsOnStep > stepData.productInput?.maxProductsOnStep) {
            errors.push({
                fieldId: "minProducts",
                field: "Minimum products on step",
                message: "Minimum number of products can not be greater than the maximum number of products.",
            });
        } else if (stepData.productInput?.products.length < stepData.productInput.minProductsOnStep) {
            errors.push({
                fieldId: "products",
                field: "Products",
                message: `Please select at least ${stepData.productInput.minProductsOnStep} products.`,
            });
        }

        return errors;
    }

    public async updateStep(stepData: BundleStepProduct): Promise<BundleStepProduct> {
        const updatedStep: BundleStepProduct = await bundleBuilderProductStepRepository.updateStep(stepData);

        return updatedStep;
    }

    public async addNewStep(bundleId: number, stepDescription: string, stepNumber: number, newStepTitle: string): Promise<BundleStepProduct> {
        const newStep: BundleStepProduct = await bundleBuilderProductStepRepository.addNewStep(bundleId, stepDescription, stepNumber, newStepTitle);
        return newStep;
    }

    public async duplicateStep(bundleId: number, stepId: number): Promise<BundleStepProduct> {
        const stepToDuplicate: BundleStepProduct | null = await bundleBuilderProductStepRepository.getStepById(stepId);

        if (!stepToDuplicate) {
            throw new Error("Step not found");
        }

        const newStep: BundleStepProduct = await bundleBuilderProductStepRepository.addNewStep(
            bundleId,
            stepToDuplicate.description,
            stepToDuplicate.stepNumber + 1,
            stepToDuplicate.title,
        );

        await bundleBuilderStepsService.incrementStepNumberForStepsGreater(bundleId, stepToDuplicate.stepNumber + 1);

        return newStep;
    }
}

export const bundleBuilderProductStepService = new BundleBuilderProductStepService();
