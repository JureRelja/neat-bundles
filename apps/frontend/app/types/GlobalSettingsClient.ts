import type { StepNavigationTypeClient } from "./StepNavigationTypeClient";

export type GlobalSettingsClient = {
    id: number;
    shop: string;
    stepNavigationTypeDesktop: StepNavigationTypeClient;
    stepNavigationTypeMobile: StepNavigationTypeClient;
};
