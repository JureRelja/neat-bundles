import { BundleStep, StepType } from "@prisma/client";
import { BundleStepContent, BundleStepProduct } from "~/adminBackend/service/dto/BundleStep";

import db from "~/db.server";

export class BundleBuilderStepRepository {
    public async getStepById(stepId: number): Promise<BundleStep | BundleStepProduct | BundleStepContent | null> {
        const step: BundleStep | null = await db.bundleStep.findFirst({
            where: {
                id: stepId,
            },
        });

        return step;
    }

    public async getAllStepsForBundleId(bundleId: number): Promise<BundleStep[]> {
        const steps: BundleStep[] = await db.bundleStep.findMany({
            where: {
                bundleBuilderId: bundleId,
            },
        });

        return steps;
    }

    public async getNumberOfSteps(bundleId: number): Promise<number> {
        const steps: number = await db.bundleStep.count({
            where: {
                bundleBuilderId: bundleId,
            },
        });

        return steps;
    }

    public async getStepByBundleIdAndStepNumber(bundleId: number, stepNumber: number, storeUrl: string): Promise<BundleStep | null> {
        const step: BundleStep | null = await db.bundleStep.findFirst({
            where: {
                bundleBuilder: {
                    id: bundleId,
                    storeUrl: storeUrl,
                },
                stepNumber: stepNumber,
            },
        });

        return step;
    }

    public async addNewEmptyStep(bundleId: number, stepType: StepType, stepDescription: string, stepNumber: number, newStepTitle: string): Promise<BundleStep> {
        const newStep: BundleStep = await db.bundleStep.create({
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
            db.bundleStep.deleteMany({
                where: {
                    bundleBuilderId: bundleId,
                    stepNumber: stepNumber,
                },
            }),
            db.bundleStep.updateMany({
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
