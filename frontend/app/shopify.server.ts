import "@shopify/shopify-app-remix/adapters/node";
import { ApiVersion, AppDistribution, BillingInterval, BillingReplacementBehavior, DeliveryMethod, shopifyApp } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import { BillingPlanIdentifiers } from "./constants";
import prisma from "./db.server";

import { createClient } from "redis";

const storage = new PrismaSessionStorage(prisma);

const shopify = shopifyApp({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    apiVersion: ApiVersion.October24,
    scopes: process.env.SCOPES?.split(","),
    appUrl: process.env.SHOPIFY_APP_URL || "",
    authPathPrefix: "/auth",
    sessionStorage: storage,
    distribution: AppDistribution.AppStore,
    restResources,
    billing: {
        //Basic billing plans
        [BillingPlanIdentifiers.BASIC_MONTHLY]: {
            replacementBehavior: BillingReplacementBehavior.ApplyOnNextBillingCycle,
            trialDays: 30,
            lineItems: [
                {
                    amount: 6.99,
                    currencyCode: "USD",
                    interval: BillingInterval.Every30Days,
                },
            ],
        },
        [BillingPlanIdentifiers.BASIC_YEARLY]: {
            replacementBehavior: BillingReplacementBehavior.ApplyOnNextBillingCycle,
            trialDays: 30,
            lineItems: [
                {
                    amount: 69.99,
                    currencyCode: "USD",
                    interval: BillingInterval.Annual,
                },
            ],
        },
        //Pro billing plans
        [BillingPlanIdentifiers.PRO_MONTHLY]: {
            replacementBehavior: BillingReplacementBehavior.ApplyOnNextBillingCycle,
            trialDays: 30,
            lineItems: [
                {
                    amount: 9.99,
                    currencyCode: "USD",
                    interval: BillingInterval.Every30Days,
                },
            ],
        },
        [BillingPlanIdentifiers.PRO_YEARLY]: {
            replacementBehavior: BillingReplacementBehavior.ApplyOnNextBillingCycle,
            trialDays: 30,
            lineItems: [
                {
                    amount: 99.99,
                    currencyCode: "USD",
                    interval: BillingInterval.Annual,
                },
            ],
        },
    },
    webhooks: {
        APP_UNINSTALLED: {
            deliveryMethod: DeliveryMethod.Http,
            callbackUrl: "/webhooks",
        },
    },
    hooks: {
        afterAuth: async ({ session }) => {
            shopify.registerWebhooks({ session });
        },
    },
    future: {
        unstable_newEmbeddedAuthStrategy: true,
    },
    ...(process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;

// //Redis client for caching
export const redisClient = await createClient({ url: process.env.REDIS_URL })
    .on("error", (err) => console.error("Redis Client Error", err))
    .connect();
