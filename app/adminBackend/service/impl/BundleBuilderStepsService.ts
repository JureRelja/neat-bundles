import { User } from "@prisma/client";
import { bundleBuilderStepRepository } from "~/adminBackend/repository/impl/bundleBuilderStep/BundleBuilderStepRepository";
import { JsonData } from "../dto/jsonData";
import db from "~/db.server";

class BundleBuilderStepsService {
    public async canAddMoreSteps(bundleId: number, user: User) {
        const canAddMoreSteps = await this.checkIfCanAddNewStep(bundleId);

        if (!canAddMoreSteps) {
            return canAddMoreSteps;
        }

        const billingPlanAllowsMoreSteps = await this.checkIfBillingPlanAllowsMoreSteps(bundleId, user);

        // Ceck if the user has reached the limit of steps for the basic plan
        if (!billingPlanAllowsMoreSteps) {
            return billingPlanAllowsMoreSteps;
        }

        return new JsonData(true, "success", "You can add a new step");
    }

    private async checkIfCanAddNewStep(bundleId: number) {
        const numOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(bundleId);

        if (numOfSteps >= 5) {
            new JsonData(false, "error", "There was an error with your request", [
                {
                    fieldId: "stepsLength",
                    field: "Number of total stepss",
                    message: "You can't have more than 5 steps",
                },
            ]);
        }

        return new JsonData(true, "success", "You can add a new step");
    }

    private async checkIfBillingPlanAllowsMoreSteps(bundleId: number, user: User) {
        const numOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(bundleId);

        // Ceck if the user has reached the limit of steps for the basic plan
        if (user.activeBillingPlan === "BASIC") {
            if (numOfSteps >= 2) {
                return new JsonData(false, "error", "You have reached the limit of 2 steps for one bundle for the basic plan.");
            }
        }

        return new JsonData(true, "success", "You can add a new step");
    }

    public async incrementStepNumberForStepsGreater(bundleId: number, stepNumber: number): Promise<void> {
        //Incrementing the step number for all steps with stepNumber greater than the duplicated step
        db.bundleStep.updateMany({
            where: {
                bundleBuilderId: bundleId,
                stepNumber: {
                    gt: stepNumber,
                },
            },
            data: {
                stepNumber: {
                    increment: 1,
                },
            },
        });
    }
}

export const bundleBuilderStepsService = new BundleBuilderStepsService();
