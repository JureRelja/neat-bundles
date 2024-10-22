import { User } from '@prisma/client';
import bundleBuilderStepRepository from '../repository/impl/BundleBuilderStepRepository';

class BundleBuilderStepService {
    public async checkIfCanAddNewStep(bundleId: number) {
        const numOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(bundleId);

        if (numOfSteps >= 5) {
            return false;
        }

        return true;
    }

    public async checkIfBillingPlanAllowsMoreSteps(bundleId: number, user: User) {
        const numOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(bundleId);

        // Ceck if the user has reached the limit of steps for the basic plan
        if (user.activeBillingPlan === 'BASIC') {
            if (numOfSteps >= 2) {
                return false;
            }
        }

        return true;
    }
}

const bundleBuilderStepService = new BundleBuilderStepService();

export default bundleBuilderStepService;
