import { Prisma } from "@prisma/client";

//Defining basic bundle resources
export const bundleFullStepsFull = {
  steps: {
    include: {
      productInput: {
        include: {
          products: true,
        },
      },
      contentInputs: true,
    },
  },
} satisfies Prisma.BundleSelect;

export type BundleFullAndStepsFullDto = Prisma.BundleGetPayload<{
  include: typeof bundleFullStepsFull;
}>;
