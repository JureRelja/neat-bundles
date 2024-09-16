import { Prisma } from "@prisma/client";

export const settingsIncludeAll = {
  bundleColors: true,
  bundleLabels: true,
};

export type SettingsWithAllResources = Prisma.BundleSettingsGetPayload<{
  include: typeof settingsIncludeAll;
}>;
