import { Prisma, BundleBuilder } from '@prisma/client';
import { bundleStepBasic } from './BundleStep';
import { settingsIncludeAll, SettingsWithAllResources } from './BundleSettings';

//Defining basic bundle resources
export const bundleAndSteps = {
    id: true,
    title: true,
    published: true,
    createdAt: true,
    pricing: true,
    priceAmount: true,
    steps: {
        select: {
            title: true,
            stepNumber: true,
            stepType: true,
        },
    },
} satisfies Prisma.BundleBuilderSelect;

// On the server, date is a Date object
export type BundleAndStepsBasicServer = Prisma.BundleBuilderGetPayload<{
    select: typeof bundleAndSteps;
}>;

/////////////////

//Bundle payload with steps
export const inclBundleFullStepsBasic = {
    steps: {
        select: bundleStepBasic,
    },
} satisfies Prisma.BundleBuilderSelect;

// On the server, date is a Date object
export type BundleFullStepBasicServer = Prisma.BundleBuilderGetPayload<{
    include: typeof inclBundleFullStepsBasic;
}>;

type BundleFullStepBasic_noDate = Omit<BundleFullStepBasicServer, 'createdAt'>;

// On the client, Date object is converted to a string
export type BundleFullStepBasicClient = BundleFullStepBasic_noDate & {
    createdAt: string;
};

/////////////////

//Bundle payload without 'cratedAt'
type BundleAndStepsBasic_noDate = Omit<BundleAndStepsBasicServer, 'createdAt'>;

// On the client, Date object is converted to a string
export type BundleAndStepsBasicClient = BundleAndStepsBasic_noDate & {
    createdAt: string;
};

/////////////////

//Basic bundle without 'createdAt'
type BundleBasic_temp = Omit<BundleBuilder, 'createdAt'>;

//Basic bundle with string 'createdAt' date attribute
export type BundleBasic = BundleBasic_temp & {
    createdAt: string;
};

//////////////////

//Bundle payload with all resources (used for duplicating bundles)
export const bundleAllResources = {
    bundleSettings: {
        include: {
            bundleColors: true,
            bundleLabels: true,
        },
    },
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
} satisfies Prisma.BundleBuilderSelect;

export type BundleAllResources = Prisma.BundleBuilderGetPayload<{
    include: typeof bundleAllResources;
}>;

export const bundleBasicAndSettings = {
    ...bundleAndSteps,
    bundleSettings: {
        include: settingsIncludeAll,
    },
} satisfies Prisma.BundleBuilderSelect;

export type BundleBasicAndSettings = Prisma.BundleBuilderGetPayload<{
    select: typeof bundleBasicAndSettings;
}>;
