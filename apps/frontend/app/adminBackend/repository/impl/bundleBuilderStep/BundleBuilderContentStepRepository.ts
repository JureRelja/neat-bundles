import db, { BundleBuilderStep, StepType } from "@db/server";
import { BundleBuilderStepTypeRepository } from "./BundleBuilderStepTypeRepository";
import { BundleStepContent, selectBundleStepContent } from "~/adminBackend/service/dto/BundleStep";
import { ContentStepDataDto } from "~/adminBackend/service/dto/ContentStepDataDto";

class BundleBuilderContentStepRepository extends BundleBuilderStepTypeRepository {
    public async getStepById(stepId: number): Promise<BundleStepContent | null> {
        const step: BundleStepContent | null = await db.bundleBuilderStep.findFirst({
            where: {
                id: stepId,
            },
            include: {
                contentInput: true,
            },
        });

        return step;
    }

    public async addNewStep(bundleId: number, stepData: ContentStepDataDto): Promise<BundleStepContent> {
        const newStep: BundleStepContent = await db.bundleBuilderStep.create({
            data: {
                bundleBuilderId: bundleId,
                stepNumber: stepData.stepNumber,
                stepType: StepType.CONTENT,
                title: stepData.title,
                description: stepData.description,
                contentInput: {
                    create: stepData.contentInputs,
                },
            },
            include: {
                contentInput: true,
            },
        });

        if (!newStep) throw new Error("Failed to create new step");

        return newStep;
    }

    public async getStepByBundleIdAndStepNumber(bundleId: number, stepNumber: number): Promise<BundleStepContent | null> {
        const step: BundleStepContent | null = await db.bundleBuilderStep.findFirst({
            where: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
            },
            include: {
                contentInput: true,
            },
        });

        return step;
    }

    public async updateStep(stepData: BundleStepContent): Promise<BundleStepContent> {
        const updatedStep: BundleStepContent = await db.bundleBuilderStep.update({
            where: {
                id: stepData.id,
            },
            data: {
                title: stepData.title,
                description: stepData.description,
                contentInput: {
                    deleteMany: {
                        id: {
                            notIn: stepData.contentInput.map((input) => input.id),
                        },
                    },
                    upsert: stepData.contentInput.map((input) => ({
                        where: {
                            id: input.id,
                        },
                        create: {
                            inputLabel: input.inputLabel,
                            inputType: input.inputType,
                            maxChars: input.maxChars,
                            required: input.required,
                        },
                        update: {
                            inputLabel: input.inputLabel,
                            inputType: input.inputType,
                            maxChars: input.maxChars,
                            required: input.required,
                        },
                    })),
                },
            },
            include: {
                contentInput: true,
            },
        });

        return updatedStep;
    }
}

const bundleBuilderContentStepRepository = new BundleBuilderContentStepRepository();

export default bundleBuilderContentStepRepository;
