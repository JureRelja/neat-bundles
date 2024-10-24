import { BundleStep, ContentInput } from "@prisma/client";
import { BundleBuilderStepTypeService } from "./BundleBuilderStepTypeService";
import { BundleStepProduct, BundleStepContent } from "../../../dto/BundleStep";
import { error } from "../../../dto/jsonData";
import bundleBuilderContentStepRepository from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderContentStepRepository";
import { bundleBuilderProductStepRepository } from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderProductStepRepository";
import { bundleBuilderStepsService } from "../../BundleBuilderStepsService";
import { ContentStepDataDto } from "~/adminBackend/service/dto/ContentStepDataDto";

class BundleBuilderContentStepService extends BundleBuilderStepTypeService {
    public checkIfErrorsInStepData(stepData: BundleStepContent): error[] {
        const errors: error[] = [];

        stepData.contentInputs.forEach((contentInput: ContentInput) => {
            if (!contentInput.inputLabel) {
                errors.push({
                    fieldId: `inputLabel${contentInput.id}`,
                    field: "Input label",
                    message: "Input label needs to be entered.",
                });
            } else if (contentInput.inputType != "IMAGE" && (!contentInput.maxChars || contentInput.maxChars < 1)) {
                errors.push({
                    fieldId: `maxChars${contentInput.id}`,
                    field: "Max characters",
                    message: "Please enter the maximum number of characters.",
                });
            }
        });

        return errors;
    }

    public async updateStep(stepData: BundleStepContent): Promise<BundleStepContent> {
        console.log("stepData", stepData);
        const updatedStep: BundleStepContent = await bundleBuilderContentStepRepository.updateStep(stepData);

        return updatedStep;
    }

    public async addNewStep(bundleId: number, stepData: ContentStepDataDto): Promise<BundleStepContent> {
        const newStep: BundleStepContent = await bundleBuilderContentStepRepository.addNewStep(bundleId, stepData);

        return newStep;
    }
    public async duplicateStep(bundleId: number, stepNumber: number): Promise<BundleStepContent> {
        const stepToDuplicate: BundleStepContent | null = await bundleBuilderContentStepRepository.getStepByBundleIdAndStepNumber(bundleId, stepNumber);

        if (!stepToDuplicate) {
            throw new Error("Step not found");
        }

        const contentStepDto: ContentStepDataDto = {
            description: stepToDuplicate.description,
            title: stepToDuplicate.title + " (Copy)",
            stepNumber: stepNumber + 1,
            stepType: stepToDuplicate.stepType,
            contentInputs: stepToDuplicate.contentInputs.map((contentInput: ContentInput) => ({
                inputLabel: contentInput.inputLabel,
                inputType: contentInput.inputType,
                maxChars: contentInput.maxChars,
                required: contentInput.required,
            })),
        };

        await bundleBuilderStepsService.incrementStepNumberForStepsGreater(bundleId, stepToDuplicate.stepNumber);

        const newStep: BundleStepContent = await bundleBuilderContentStepRepository.addNewStep(bundleId, contentStepDto);

        return newStep;
    }
}

export const bundleBuilderContentStepService = new BundleBuilderContentStepService();
