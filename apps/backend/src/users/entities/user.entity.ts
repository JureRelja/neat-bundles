import { PricingPlan, User } from "@prisma/client";

export class UserEntity implements User {
    id: number;

    ownerName: string;

    email: string;

    shop: string;

    storeName: string;

    primaryDomain: string;

    hasAppInstalled: boolean = true;

    activeBillingPlan: PricingPlan = PricingPlan.NONE;

    completedInstallation: boolean;

    showTutorialBanner: boolean = true;

    completedOnboarding: boolean;

    isDevelopmentStore: boolean;

    storefrontAccessToken: string | null;
}
