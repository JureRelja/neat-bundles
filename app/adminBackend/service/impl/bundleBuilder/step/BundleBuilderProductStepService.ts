import { BundleBuilderStepTypeService } from "./BundleBuilderStepTypeService";
import { BundleStepProduct } from "../../../dto/BundleStep";
import { error } from "../../../dto/jsonData";
import { bundleBuilderProductStepRepository } from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderProductStepRepository";
import { bundleBuilderStepsService } from "../../BundleBuilderStepsService";
import { ProductStepDataDto } from "~/adminBackend/service/dto/ProductStepDataDto";
import { StepType } from "@prisma/client";
import bundleBuilderRepository from "~/adminBackend/repository/impl/BundleBuilderRepository";
import { bundleBuilderStepRepository } from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderStepRepository";

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

    public async addNewStep(bundleId: number, stepData: ProductStepDataDto): Promise<BundleStepProduct> {
        const newStep: BundleStepProduct = await bundleBuilderProductStepRepository.addNewStep(bundleId, stepData);
        return newStep;
    }

    public async duplicateStep(bundleId: number, stepId: number): Promise<BundleStepProduct> {
        const stepToDuplicate: BundleStepProduct | null = await bundleBuilderProductStepRepository.getStepById(stepId);

        if (!stepToDuplicate) {
            throw new Error("Step not found");
        }

        const stepData: ProductStepDataDto = {
            description: stepToDuplicate.description,
            title: stepToDuplicate.title + " (Copy)",
            stepNumber: stepToDuplicate.stepNumber + 1,
            stepType: stepToDuplicate.stepType,
            productInput: {
                minProductsOnStep: stepToDuplicate.productInput?.minProductsOnStep || 1,
                maxProductsOnStep: stepToDuplicate.productInput?.maxProductsOnStep || 1,
                allowProductDuplicates: stepToDuplicate.productInput?.allowProductDuplicates || false,
                showProductPrice: stepToDuplicate.productInput?.showProductPrice || true,
                products: stepToDuplicate.productInput?.products || [],
            },
        };

        await bundleBuilderStepsService.incrementStepNumberForStepsGreater(bundleId, stepToDuplicate.stepNumber);

        const newStep: BundleStepProduct = await bundleBuilderProductStepRepository.addNewStep(bundleId, stepData);

        return newStep;
    }
}

export const bundleBuilderProductStepService = new BundleBuilderProductStepService();
