import { Prisma, Bundle } from "@prisma/client";
import { bundleSettingsInclude } from "./BundleSettings";
import { bundleStepBasic } from "./BundleStep";

//Defining bundle payload
export const bundleSelect = {
  id: true,
  title: true,
  published: true,
  createdAt: true,
  bundleSettings: {
    select: bundleSettingsInclude,
  },
  steps: {
    select: bundleStepBasic,
  },
} satisfies Prisma.BundleSelect;

export type BundlePayload = Prisma.BundleGetPayload<{
  select: typeof bundleSelect;
}>;

//Bundle payload with string data
type BundlePayloadWithoutDate = Omit<BundlePayload, "createdAt">;

export type BundlePayloadDataString = BundlePayloadWithoutDate & {
  createdAt: string;
};

//Basic bundle with string data
type BundleWithoutDate = Omit<Bundle, "createdAt">;

export type BundleWithStringDate = BundleWithoutDate & {
  createdAt: string;
};

// export const bundleCreatePayload = {
//   ...bundleSelect,
//   bundleSttings: {
//     select: {
//       id: true,
//     },
//   },
// } satisfies Prisma.BundleSelect;
