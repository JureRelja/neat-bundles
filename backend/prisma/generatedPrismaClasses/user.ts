import { BundleBuilder } from "./bundle_builder";
import { CreatedBundle } from "./created_bundle";
import { Settings } from "./settings";
import { PricingPlan } from "@prisma/client";

export class User {
    id: number;

    ownerName: string;

    email: string;

    shop: string;

    storeName: string;

    primaryDomain: string;

    hasAppInstalled: boolean = true;

    onlineStorePublicationId: string;

    activeBillingPlan: PricingPlan = PricingPlan.NONE;

    completedInstallation: boolean;

    showTutorialBanner: boolean = true;

    completedOnboarding: boolean;

    isDevelopmentStore: boolean;

    storefrontAccessToken?: string;

    bundleBuilders: BundleBuilder[];

    createdBundles: CreatedBundle[];

    settings?: Settings;
}
