import { BundleStep, StepType } from "@prisma/client";
import { BundleBuilderStepTypeRepository } from "./BundleBuilderStepTypeRepository";
import db from "~/db.server";
import { BundleStepContent, selectBundleStepContent } from "~/adminBackend/service/dto/BundleStep";

class BundleBuilderContentStepRepository extends BundleBuilderStepTypeRepository {
    public async getStepById(stepId: number): Promise<BundleStepContent | null> {
        const step: BundleStepContent | null = await db.bundleStep.findFirst({
            where: {
                id: stepId,
            },
            include: selectBundleStepContent,
        });

        return step;
    }

    public async addNewStep(bundleId: number, stepDescription: string, stepNumber: number, newStepTitle: string): Promise<BundleStepContent> {
        const newStep: BundleStepContent = await db.bundleStep.create({
            data: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
                stepType: StepType.CONTENT,
                title: newStepTitle,
                description: stepDescription,
            },
            include: selectBundleStepContent,
        });

        if (!newStep) throw new Error("Failed to create new step");

        return newStep;
    }

    public async getStepByBundleIdAndStepNumber(bundleId: number, stepNumber: number): Promise<BundleStepContent | null> {
        const step: BundleStepContent | null = await db.bundleStep.findFirst({
            where: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
            },
            include: selectBundleStepContent,
        });

        return step;
    }

    public async updateStep(stepData: BundleStepContent): Promise<BundleStepContent> {
        const updatedStep: BundleStepContent = await db.bundleStep.update({
            where: {
                id: stepData.id,
            },
            data: {
                title: stepData.title,
                description: stepData.description,
            },
            include: selectBundleStepContent,
        });

        return updatedStep;
    }
}

const bundleBuilderContentStepRepository = new BundleBuilderContentStepRepository();

export default bundleBuilderContentStepRepository;
