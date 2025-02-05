import { BundleBuilderStepTypeRepository } from "./BundleBuilderStepTypeRepository";
import { Product, StepType } from "@prisma/client";
import { BundleStepProduct, selectBundleStepProduct } from "~/adminBackend/service/dto/BundleStep";
import db from "~/db.server";
import { bundleBuilderProductInputRepository } from "./BundleBuilderProductInputRepository";
import { ProductStepDataDto } from "~/adminBackend/service/dto/ProductStepDataDto";

export class BundleBuilderProductStepRepository extends BundleBuilderStepTypeRepository {
    public async getStepById(stepId: number): Promise<BundleStepProduct | null> {
        const step: BundleStepProduct | null = await db.bundleBuilderStep.findFirst({
            where: {
                id: stepId,
            },
            include: {
                ProductInput: {
                    include: {
                        ProductToProductInput: true,
                    },
                },
            },
        });

        return step;
    }

    public async getStepByBundleIdAndStepNumber(bundleId: number, stepNumber: number): Promise<BundleStepProduct | null> {
        const step: BundleStepProduct | null = await db.bundleBuilderStep.findFirst({
            where: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
            },
            include: {
                ProductInput: {
                    include: {
                        ProductToProductInput: true,
                    },
                },
            },
        });

        return step;
    }

    public async addNewStep(bundleId: number, stepData: ProductStepDataDto): Promise<BundleStepProduct> {
        const newStep: BundleStepProduct = await db.bundleBuilderStep.create({
            data: {
                bundleBuilderId: bundleId,
                stepNumber: stepData.stepNumber,
                stepType: StepType.PRODUCT,
                title: stepData.title,
                description: stepData.description,
                ProductInput: {
                    create: {
                        minProductsOnStep: stepData.productInput?.minProductsOnStep || 1,
                        maxProductsOnStep: stepData.productInput?.maxProductsOnStep || 3,
                        allowProductDuplicates: false,
                        showProductPrice: true,
                    },
                },
            },
            include: {
                ProductInput: {
                    include: {
                        ProductToProductInput: true,
                    },
                },
            },
        });

        await bundleBuilderProductInputRepository.updateSelectedProducts(newStep.id, stepData.productInput?.products || []);

        if (!newStep) throw new Error("Failed to create new step");

        return newStep;
    }

    public async updateStep(stepData: BundleStepProduct): Promise<BundleStepProduct> {
        const updatedStep: BundleStepProduct = await db.bundleBuilderStep.update({
            where: {
                id: stepData.id,
            },
            data: {
                title: stepData.title,
                description: stepData.description,
                ProductInput: {
                    update: {
                        minProductsOnStep: stepData.productInput?.minProductsOnStep,
                        maxProductsOnStep: stepData.productInput?.maxProductsOnStep,
                        allowProductDuplicates: stepData.productInput?.allowProductDuplicates,
                        showProductPrice: stepData.productInput?.showProductPrice,
                    },
                },
            },
            include: {
                ProductInput: {
                    include: {
                        ProductToProductInput: true,
                    },
                },
            },
        });

        await bundleBuilderProductInputRepository.updateSelectedProducts(updatedStep.id, stepData.productInput?.products || []);

        return updatedStep;
    }
}

export const bundleBuilderProductStepRepository = new BundleBuilderProductStepRepository();
