import { Prisma, Bundle } from "@prisma/client";
import { bundleStepBasic } from "./BundleStep";

//Defining bundle payload
export const bundleAndSteps = {
  id: true,
  title: true,
  published: true,
  createdAt: true,
  steps: {
    select: bundleStepBasic,
  },
} satisfies Prisma.BundleSelect;

// On the server, date is a Date object
export type BundleAndStepsBasicServer = Prisma.BundleGetPayload<{
  select: typeof bundleAndSteps;
}>;

//Bundle payload without 'cratedAt'
type BundleAndStepsBasic_noDate = Omit<BundleAndStepsBasicServer, "createdAt">;

// On the client, Date object is converted to a string
export type BundleAndStepsBasicClient = BundleAndStepsBasic_noDate & {
  createdAt: string;
};

//Basic bundle with string 'createdAt' date attribute
type BundleBasic_temp = Omit<Bundle, "createdAt">;

export type BundleBasic = BundleBasic_temp & {
  createdAt: string;
};
