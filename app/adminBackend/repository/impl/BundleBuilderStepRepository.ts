import { BundleStep, InputType, StepType } from "@prisma/client";
import db from "~/db.server";

class BundleBuilderStepRepository {
    public async getNumberOfSteps(bundleId: number): Promise<number> {
        const numOfSteps = await db.bundleStep.aggregate({
            _max: {
                stepNumber: true,
            },
            where: {
                bundleBuilderId: bundleId,
            },
        });

        if (!numOfSteps._max.stepNumber) return 0;

        return numOfSteps._max.stepNumber;
    }

    public async createEmptyProductStep(bundleId: number, stepNumber: number, newStepTitle: string): Promise<BundleStep> {
        const newStep: BundleStep = await db.bundleStep.create({
            data: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
                stepType: StepType.PRODUCT,
                title: newStepTitle,
                description: "This is the default description for this step. Feel free to change it.",
            },
        });

        if (!newStep) throw new Error("Failed to create new step");

        return newStep;
    }

    public async createEmptyContentStep(bundleId: number, stepNumber: number, newStepTitle: string): Promise<BundleStep> {
        const newStep: BundleStep = await db.bundleStep.create({
            data: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
                stepType: StepType.CONTENT,
                title: newStepTitle,
                description: "This is the default description for this step. Feel free to change it.",
            },
        });

        if (!newStep) throw new Error("Failed to create new step");

        return newStep;
    }

    public async createProductStep(
        bundleId: number,
        stepDescription: string,
        stepNumber: number,
        newStepTitle: string,
        minProducts: number,
        maxProducts: number,
    ): Promise<BundleStep> {
        const newStep: BundleStep = await db.bundleStep.create({
            data: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
                stepType: StepType.PRODUCT,
                title: newStepTitle,
                description: stepDescription,
                productInput: {
                    create: {
                        minProductsOnStep: minProducts,
                        maxProductsOnStep: maxProducts,
                        allowProductDuplicates: false,
                        showProductPrice: true,
                    },
                },
            },
        });

        if (!newStep) throw new Error("Failed to create new step");

        return newStep;
    }

    public async createContentStep(
        bundleId: number,
        stepDescription: string,
        stepNumber: number,
        newStepTitle: string,
        inputLabel: string,
        inputType: InputType,
    ): Promise<BundleStep> {
        const newStep: BundleStep = await db.bundleStep.create({
            data: {
                bundleBuilderId: bundleId,
                stepNumber: stepNumber,
                stepType: StepType.CONTENT,
                title: newStepTitle,
                description: stepDescription,
                contentInputs: {
                    create: {
                        inputLabel: inputLabel,
                        inputType: inputType,
                        maxChars: 50,
                        required: true,
                    },
                },
            },
        });

        if (!newStep) throw new Error("Failed to create new step");

        return newStep;
    }
}

const bundleBuilderStepRepository = new BundleBuilderStepRepository();

export default bundleBuilderStepRepository;
