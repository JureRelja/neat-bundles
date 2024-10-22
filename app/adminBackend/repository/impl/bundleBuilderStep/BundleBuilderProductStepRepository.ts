import { BundleBuilderStepTypeRepository } from "./BundleBuilderStepTypeRepository";
import { Product, StepType } from "@prisma/client";
import { BundleStepProduct, selectBundleStepProduct } from "~/adminBackend/service/dto/BundleStep";
import db from "~/db.server";

export class BundleBuilderProductStepRepository extends BundleBuilderStepTypeRepository {
    public async getStepById(stepId: number): Promise<BundleStepProduct | null> {
        const step: BundleStepProduct | null = await db.bundleStep.findFirst({
            where: {
                id: stepId,
            },
            include: selectBundleStepProduct,
        });

        return step;
    }

    public async getStepByBundleIdAndStepNumber(bundleId: number, stepNumber: number): Promise<BundleStepProduct | null> {
        const step: BundleStepProduct | null = await db.bundleStep.findFirst({
            where: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
            },
            include: selectBundleStepProduct,
        });

        return step;
    }

    public async addNewStep(bundleId: number, stepDescription: string, stepNumber: number, newStepTitle: string): Promise<BundleStepProduct> {
        const newStep: BundleStepProduct = await db.bundleStep.create({
            data: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
                stepType: StepType.PRODUCT,
                title: newStepTitle,
                description: stepDescription,
            },
            include: selectBundleStepProduct,
        });

        if (!newStep) throw new Error("Failed to create new step");

        return newStep;
    }

    public async updateStep(stepData: BundleStepProduct): Promise<BundleStepProduct> {
        const updatedStep: BundleStepProduct = await db.bundleStep.update({
            where: {
                id: stepData.id,
            },
            data: {
                title: stepData.title,
                description: stepData.description,
                productInput: {
                    update: {
                        minProductsOnStep: stepData.productInput?.minProductsOnStep,
                        maxProductsOnStep: stepData.productInput?.maxProductsOnStep,
                        allowProductDuplicates: stepData.productInput?.allowProductDuplicates,
                        showProductPrice: stepData.productInput?.showProductPrice,
                        products: {
                            set: [],
                            connectOrCreate: stepData.productInput?.products.map((product: Product) => {
                                return {
                                    where: {
                                        shopifyProductId: product.shopifyProductId,
                                    },
                                    create: {
                                        shopifyProductId: product.shopifyProductId,
                                        shopifyProductHandle: product.shopifyProductHandle,
                                    },
                                };
                            }),
                        },
                    },
                },
            },
            include: selectBundleStepProduct,
        });

        return updatedStep;
    }
}

export const bundleBuilderProductStepRepository = new BundleBuilderProductStepRepository();
