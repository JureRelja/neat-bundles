import { BundleStep, StepType } from "@prisma/client";
import { BundleBuilderStepTypeRepository } from "./BundleBuilderStepTypeRepository";
import db from "~/db.server";
import { BundleStepContent, selectBundleStepContent } from "~/adminBackend/service/dto/BundleStep";
import { ContentStepDataDto } from "~/adminBackend/service/dto/ContentStepDataDto";

class BundleBuilderContentStepRepository extends BundleBuilderStepTypeRepository {
    public async getStepById(stepId: number): Promise<BundleStepContent | null> {
        const step: BundleStepContent | null = await db.bundleStep.findFirst({
            where: {
                id: stepId,
            },
            include: {
                contentInputs: true,
            },
        });

        return step;
    }

    public async addNewStep(bundleId: number, stepData: ContentStepDataDto): Promise<BundleStepContent> {
        const newStep: BundleStepContent = await db.bundleStep.create({
            data: {
                bundleBuilderId: bundleId,
                stepNumber: stepData.stepNumber,
                stepType: StepType.CONTENT,
                title: stepData.title,
                description: stepData.description,
                contentInputs: {
                    create: stepData.contentInputs,
                },
            },
            include: {
                contentInputs: true,
            },
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
            include: {
                contentInputs: true,
            },
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
            include: {
                contentInputs: true,
            },
        });

        return updatedStep;
    }
}

const bundleBuilderContentStepRepository = new BundleBuilderContentStepRepository();

export default bundleBuilderContentStepRepository;
