import { Prisma, BundleBuilder } from "@prisma/client";
import { bundleStepBasic } from "@adminBackend/service/dto/BundleStep";

//Defining basic bundle resources
export const bundleAndSteps = {
    id: true,
    title: true,
    published: true,
    createdAt: true,
    pricing: true,
    priceAmount: true,
    bundleBuilderPageUrl: true,
    bundleBuilderSteps: {
        select: {
            title: true,
            stepNumber: true,
            stepType: true,
        },
    },
} satisfies Prisma.BundleBuilderSelect;

// On the server, date is a Date object
export type BundleBuilderDto = Prisma.BundleBuilderGetPayload<{
    select: typeof bundleAndSteps;
}>;

// On the server, date is a Date object
export type BundleAndStepsBasicServer = Prisma.BundleBuilderGetPayload<{
    select: typeof bundleAndSteps;
}> & { bundleBuilderPageUrl: string };

/////////////////

//Bundle payload with steps
export const inclBundleFullStepsBasic = {
    bundleBuilderSteps: {
        select: bundleStepBasic,
    },
} satisfies Prisma.BundleBuilderSelect;

// On the server, date is a Date object
export type BundleFullStepBasicServer = Prisma.BundleBuilderGetPayload<{
    include: typeof inclBundleFullStepsBasic;
}> & { bundleBuilderPageUrl: string };

type BundleFullStepBasic_noDate = Omit<BundleFullStepBasicServer, "createdAt">;

// On the client, Date object is converted to a string
export type BundleFullStepBasicClient = BundleFullStepBasic_noDate & {
    createdAt: string;
};

/////////////////

//Bundle payload without 'cratedAt'
type BundleAndStepsBasic_noDate = Omit<BundleAndStepsBasicServer, "createdAt">;

// On the client, Date object is converted to a string
export type BundleAndStepsBasicClient = BundleAndStepsBasic_noDate & {
    createdAt: string;
};

/////////////////

//Basic bundle without 'createdAt'
type BundleBasic_temp = Omit<BundleBuilder, "createdAt">;

//Basic bundle with string 'createdAt' date attribute
export type BundleBasic = BundleBasic_temp & {
    createdAt: string;
};

//////////////////

//Bundle payload with all resources (used for duplicating bundles)
export const bundleAllResources = {
    bundleBuilderConfig: {
        include: {},
    },
    bundleBuilderSteps: {
        include: {
            productInput: {
                include: {
                    products: true,
                },
            },
            contentInput: true,
        },
    },
} satisfies Prisma.BundleBuilderSelect;

export type BundleAllResources = Prisma.BundleBuilderGetPayload<{
    include: typeof bundleAllResources;
}>;

export const bundleBasicAndSettings = {
    ...bundleAndSteps,
    bundleBuilderConfig: {
        include: {},
    },
} satisfies Prisma.BundleBuilderSelect;

export type BundleBasicAndSettings = Prisma.BundleBuilderGetPayload<{
    select: typeof bundleBasicAndSettings;
}>;
