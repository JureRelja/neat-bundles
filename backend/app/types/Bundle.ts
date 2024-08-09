import { Prisma, Bundle } from "@prisma/client";
import { bundleSettingsInclude } from "./BundleSettings";
import { bundleStepInclude } from "./BundleStep";

//Defining bundle type
export const bundleSelect = {
  id: true,
  title: true,
  bundleSettings: {
    select: bundleSettingsInclude,
  },
  steps: {
    select: {
      id: true,
      stepNumber: true,
      title: true,
      stepType: true,
    },
  },
} satisfies Prisma.BundleSelect;

export type BundlePayload = Prisma.BundleGetPayload<{
  select: typeof bundleSelect;
}>;

type BundleWithoutDate = Omit<Bundle, "createdAt">;

export type BundleWithStringDate = BundleWithoutDate & {
  createdAt: string;
};
