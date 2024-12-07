import type { StepNavigationType } from "./StepNavigationTypeClient";

export type GlobalSettingsClient = {
    id: number;
    storeUrl: string;
    stepNavigationTypeDesktop: StepNavigationType;
    stepNavigationTypeMobile: StepNavigationType;
};
