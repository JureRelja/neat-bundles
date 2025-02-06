import { BundleColors } from "./bundle_colors";
import { BundleLabels } from "./bundle_labels";
import { User } from "./user";
import { StepNavigationType } from "@prisma/client";

export class Settings {
    id: number;

    shop: string;

    stepNavigationTypeDesktop: StepNavigationType = StepNavigationType.NORMAL;

    stepNavigationTypeMobile: StepNavigationType = StepNavigationType.STICKY;

    BundleColors?: BundleColors;

    BundleLabels?: BundleLabels;

    User: User;
}
