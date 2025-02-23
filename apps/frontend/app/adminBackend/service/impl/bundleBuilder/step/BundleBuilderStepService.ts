import { BundleBuilderStep } from "@prisma/client";
import { error } from "../../../dto/jsonData";
import { BundleStepContent, BundleStepProduct } from "~/adminBackend/service/dto/BundleStep";

class BundleBuilderDefaultStepService {
    public checkIfErrorsInStepData(stepData: BundleBuilderStep | BundleStepProduct | BundleStepContent): error[] {
        const errors: error[] = [];

        if (!stepData.title) {
            errors.push({
                fieldId: "stepTitle",
                field: "Step title",
                message: "Step title needs to be entered.",
            });
        } else if (!stepData.description) {
            errors.push({
                fieldId: "stepDESC",
                field: "Step description",
                message: "Step description needs to be entered.",
            });
        }

        return errors;
    }
}

export const bundleBuilderStepService = new BundleBuilderDefaultStepService();
