import db, { BundleBuilderStep, StepType } from "@db/server";
import { BundleStepContent, BundleStepProduct } from "~/adminBackend/service/dto/BundleStep";

export class BundleBuilderStepRepository {
    public async getStepById(stepId: number): Promise<BundleBuilderStep | BundleStepProduct | BundleStepContent | null> {
        const step: BundleBuilderStep | null = await db.bundleBuilderStep.findFirst({
            where: {
                id: stepId,
            },
        });

        return step;
    }

    public async getAllStepsForBundleId(bundleId: number): Promise<BundleBuilderStep[]> {
        const steps: BundleBuilderStep[] = await db.bundleBuilderStep.findMany({
            where: {
                bundleBuilderId: bundleId,
            },
        });

        return steps;
    }

    public async getNumberOfSteps(bundleId: number): Promise<number> {
        const steps: number = await db.bundleBuilderStep.count({
            where: {
                bundleBuilderId: bundleId,
            },
        });

        return steps;
    }

    public async getStepByBundleIdAndStepNumber(bundleId: number, stepNumber: number, storeUrl: string): Promise<BundleBuilderStep | null> {
        const step: BundleBuilderStep | null = await db.bundleBuilderStep.findFirst({
            where: {
                bundleBuilder: {
                    id: bundleId,
                    shop: storeUrl,
                },
                stepNumber: stepNumber,
            },
        });

        return step;
    }

    public async addNewEmptyStep(bundleId: number, stepType: StepType, stepDescription: string, stepNumber: number, newStepTitle: string): Promise<BundleBuilderStep> {
        const newStep: BundleBuilderStep = await db.bundleBuilderStep.create({
            data: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
                stepType: stepType,
                title: newStepTitle,
                description: stepDescription,
            },
        });

        if (!newStep) throw new Error("Failed to create new step");

        return newStep;
    }

    public async deleteStepByBundleBuilderIdAndStepNumber(bundleId: number, stepNumber: number): Promise<void> {
        const [deletedSteps, updatedSteps] = await db.$transaction([
            db.bundleBuilderStep.deleteMany({
                where: {
                    bundleBuilderId: bundleId,
                    stepNumber: stepNumber,
                },
            }),
            db.bundleBuilderStep.updateMany({
                where: {
                    bundleBuilderId: bundleId,
                    stepNumber: {
                        gt: stepNumber,
                    },
                },
                data: {
                    stepNumber: {
                        decrement: 1,
                    },
                },
            }),
        ]);
    }
}

export const bundleBuilderStepRepository = new BundleBuilderStepRepository();
