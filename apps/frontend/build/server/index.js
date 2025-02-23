import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useSubmit, useNavigation, useParams, useActionData, useLoaderData, Form, useFetcher, useNavigate, Link, useRouteError, isRouteErrorResponse, json as json$1, redirect as redirect$1 } from "@remix-run/react";
import { createReadableStreamFromReadable, json, redirect } from "@remix-run/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, ApiVersion, AppDistribution, BillingReplacementBehavior, BillingInterval, DeliveryMethod, LoginErrorType, boundary } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import { PrismaClient, StepType, BundlePricing } from "@prisma/client";
import { createClient } from "redis";
import { BlockStack, InlineStack, Text, Button, InlineGrid, Select, TextField, ChoiceList, SkeletonPage, Banner, Layout, Card, Divider, Box, ButtonGroup, InlineError, Page, Badge, FooterHelp, SkeletonBodyText, Tooltip, Icon, Spinner, DataTable, EmptyState, MediaCard, VideoThumbnail, AppProvider, FormLayout } from "@shopify/polaris";
import { useState, useEffect } from "react";
import { DeleteIcon, QuestionCircleIcon, EditIcon, ExternalIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon, PageAddIcon, SettingsIcon, RefreshIcon, DesktopIcon, MobileIcon, CheckIcon, XSmallIcon, CheckSmallIcon } from "@shopify/polaris-icons";
import { useAppBridge, Modal, TitleBar, SaveBar, NavMenu } from "@shopify/app-bridge-react";
import HmacSha256 from "crypto-js/hmac-sha256.js";
import Hex from "crypto-js/enc-hex.js";
import { Storage } from "@google-cloud/storage";
import { LoopsClient } from "loops";
import { AppProvider as AppProvider$1 } from "@shopify/shopify-app-remix/react";
const GapInsideSection = "300";
const GapBetweenSections = "300";
const LargeGapBetweenSections = "500";
const GapBetweenTitleAndContent = "200";
const HorizontalGap = "300";
const BigGapBetweenSections = "1200";
const bundleTagIndentifier = "ncb-neat-custom-bundle";
const bundlePageKey = "bundle_id_page";
const bundlePageType = "number_integer";
const bundlePageNamespace = "neat_bundles_app";
const bundlePagePreviewKey = "neatBundlePreview";
var BillingPlanIdentifiers = /* @__PURE__ */ ((BillingPlanIdentifiers2) => {
  BillingPlanIdentifiers2["FREE"] = "FREE";
  BillingPlanIdentifiers2["BASIC_MONTHLY"] = "Basic (monthly subscription)";
  BillingPlanIdentifiers2["BASIC_YEARLY"] = "Basic (yearly subscription)";
  BillingPlanIdentifiers2["PRO_YEARLY"] = "Pro (yearly subscription)";
  BillingPlanIdentifiers2["PRO_MONTHLY"] = "Pro (monthly subscription)";
  return BillingPlanIdentifiers2;
})(BillingPlanIdentifiers || {});
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}
const storage$1 = new PrismaSessionStorage(prisma);
const shopify$1 = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: storage$1,
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
          interval: BillingInterval.Every30Days
        }
      ]
    },
    [BillingPlanIdentifiers.BASIC_YEARLY]: {
      replacementBehavior: BillingReplacementBehavior.ApplyOnNextBillingCycle,
      trialDays: 30,
      lineItems: [
        {
          amount: 69.99,
          currencyCode: "USD",
          interval: BillingInterval.Annual
        }
      ]
    },
    //Pro billing plans
    [BillingPlanIdentifiers.PRO_MONTHLY]: {
      replacementBehavior: BillingReplacementBehavior.ApplyOnNextBillingCycle,
      trialDays: 30,
      lineItems: [
        {
          amount: 9.99,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days
        }
      ]
    },
    [BillingPlanIdentifiers.PRO_YEARLY]: {
      replacementBehavior: BillingReplacementBehavior.ApplyOnNextBillingCycle,
      trialDays: 30,
      lineItems: [
        {
          amount: 99.99,
          currencyCode: "USD",
          interval: BillingInterval.Annual
        }
      ]
    }
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks"
    }
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify$1.registerWebhooks({ session });
    }
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true
  },
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
ApiVersion.October24;
const addDocumentResponseHeaders = shopify$1.addDocumentResponseHeaders;
const authenticate = shopify$1.authenticate;
const unauthenticated = shopify$1.unauthenticated;
const login = shopify$1.login;
shopify$1.registerWebhooks;
shopify$1.sessionStorage;
const redisClient = await createClient({ url: process.env.REDIS_URL }).on("error", (err) => console.error("Redis Client Error", err)).connect();
const ABORT_DELAY = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url, abortDelay: ABORT_DELAY }), {
      [callbackName]: () => {
        const body = new PassThrough();
        const stream = createReadableStreamFromReadable(body);
        responseHeaders.set("Content-Type", "text/html");
        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode
          })
        );
        pipe(body);
      },
      onShellError(error) {
        reject(error);
      },
      onError(error) {
        responseStatusCode = 500;
        console.error(error);
      }
    });
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function App$2() {
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://cdn.shopify.com/" }),
      /* @__PURE__ */ jsx("link", { rel: "stylesheet", href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$2
}, Symbol.toStringTag, { value: "Module" }));
function useNavigateSubmit() {
  const submit = useSubmit();
  return (action2, url, id) => {
    const formData = new FormData();
    formData.append("action", action2);
    if (id) {
      formData.append("id", id.toString());
    }
    submit(formData, {
      method: "POST",
      navigate: true,
      action: url
    });
  };
}
class JsonData {
  fromCache;
  ok;
  status;
  message;
  errors;
  data;
  constructor(ok, status, message, errors, data, fromCache) {
    this.ok = status === "success";
    this.status = status;
    this.message = message;
    this.errors = errors;
    if (data)
      this.data = data;
    else
      this.data = {};
    if (fromCache)
      this.fromCache = fromCache;
    else
      this.fromCache = false;
  }
}
function Index$t({
  contentInput,
  errors,
  inputId,
  index: index2,
  single,
  updateContentInput,
  updateFieldErrorHandler,
  removeContentInputField
}) {
  console.log(errors);
  return /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
    !single && /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
      /* @__PURE__ */ jsxs(Text, { as: "p", variant: "headingMd", children: [
        "Input field #",
        index2
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "primary", tone: "critical", size: "micro", icon: DeleteIcon, onClick: () => removeContentInputField(inputId) })
    ] }),
    /* @__PURE__ */ jsxs(InlineGrid, { gap: HorizontalGap, columns: 2, children: [
      /* @__PURE__ */ jsx(
        Select,
        {
          label: "Input field type",
          options: [
            { label: "None", value: "NONE" },
            { label: "Text", value: "TEXT" },
            { label: "Number", value: "NUMBER" },
            { label: "Image", value: "IMAGE" }
          ],
          onChange: (newContentType) => {
            updateContentInput({
              ...contentInput,
              inputType: newContentType
            });
          },
          value: contentInput.inputType,
          helpText: "The right input type is important for correct data entry.",
          name: `inputType`
        }
      ),
      /* @__PURE__ */ jsx(
        TextField,
        {
          label: "Input label",
          name: `inputLabel${inputId}`,
          helpText: "The label will be visible above the input field.",
          value: contentInput.inputLabel,
          disabled: contentInput.inputType === "NONE",
          error: errors?.find((err) => err.fieldId === `inputLabel${inputId}`)?.message,
          onChange: (newLabel) => {
            updateContentInput({
              ...contentInput,
              inputLabel: newLabel
            });
            updateFieldErrorHandler(`inputLabel${inputId}`);
          },
          autoComplete: "off"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(InlineGrid, { gap: HorizontalGap, columns: 2, alignItems: "center", children: [
      /* @__PURE__ */ jsx(
        TextField,
        {
          label: "Max length (in characters)",
          helpText: "It lets you limit the number of characters that customers can enter.",
          type: "number",
          name: `maxChars${inputId}`,
          inputMode: "numeric",
          min: 1,
          disabled: contentInput.inputType === "NONE" || contentInput.inputType === "IMAGE",
          error: errors?.find((err) => err.fieldId === `maxChars${inputId}`)?.message,
          value: contentInput.maxChars.toString(),
          onChange: (newMaxLength) => {
            updateContentInput({
              ...contentInput,
              maxChars: parseInt(newMaxLength)
            });
            updateFieldErrorHandler(`maxChars${inputId}`);
          },
          autoComplete: "off"
        }
      ),
      /* @__PURE__ */ jsx(
        ChoiceList,
        {
          allowMultiple: true,
          title: "Input field required",
          name: `required`,
          titleHidden: true,
          choices: [
            {
              label: "Field is required",
              value: "true"
            }
          ],
          disabled: contentInput.inputType === "NONE" || contentInput.inputType === "IMAGE",
          selected: [contentInput.required ? "true" : ""],
          onChange: (selected) => {
            updateContentInput({
              ...contentInput,
              required: selected.includes("true")
            });
          }
        }
      )
    ] })
  ] });
}
class UserRepository {
  async getUserByStoreUrl(storeUrl) {
    const user = await prisma.user.findUnique({
      where: {
        storeUrl
      }
    });
    return user;
  }
  async createUser(storeUrl, storeEmail, storeName, primaryDomain, onlineStorePublicationId, ownerName) {
    const user = await prisma.user.create({
      data: {
        ownerName,
        storeUrl,
        email: storeEmail,
        storeName,
        primaryDomain,
        onlineStorePublicationId,
        globalSettings: {
          create: {
            bundleColors: {
              create: {
                addToBundleBtn: "#000000",
                addToBundleText: "#000000",
                removeProductsBtn: "#000000",
                removeProductsBtnText: "#000000",
                stepsIcon: "#000000",
                nextStepBtn: "#000000",
                nextStepBtnText: "#000000",
                titleAndDESC: "#000000",
                prevStepBtnText: "#000000",
                viewProductBtn: "#000000",
                viewProductBtnText: "#000000",
                prevStepBtn: "#000000"
              }
            },
            bundleLabels: {
              create: {
                addToBundleBtn: "Add to bundle",
                prevStepBtn: "Previous step",
                nextStepBtn: "Next step",
                viewProductBtn: "View product"
              }
            }
          }
        }
      }
    });
    if (!user) {
      throw new Error(`Could not create user with store url ${storeUrl}`);
    }
    return user;
  }
  async updateUser(newUser) {
    const updatedUser = await prisma.user.update({
      where: {
        id: newUser.id
      },
      data: newUser
    });
    if (!updatedUser) {
      return false;
    }
    return true;
  }
}
const userRepository = new UserRepository();
class BundleBuilderStepTypeRepository {
}
class BundleBuilderContentStepRepository extends BundleBuilderStepTypeRepository {
  async getStepById(stepId) {
    const step = await prisma.bundleStep.findFirst({
      where: {
        id: stepId
      },
      include: {
        contentInputs: true
      }
    });
    return step;
  }
  async addNewStep(bundleId, stepData) {
    const newStep = await prisma.bundleStep.create({
      data: {
        bundleBuilderId: bundleId,
        stepNumber: stepData.stepNumber,
        stepType: StepType.CONTENT,
        title: stepData.title,
        description: stepData.description,
        contentInputs: {
          create: stepData.contentInputs
        }
      },
      include: {
        contentInputs: true
      }
    });
    if (!newStep)
      throw new Error("Failed to create new step");
    return newStep;
  }
  async getStepByBundleIdAndStepNumber(bundleId, stepNumber) {
    const step = await prisma.bundleStep.findFirst({
      where: {
        bundleBuilderId: bundleId,
        stepNumber
      },
      include: {
        contentInputs: true
      }
    });
    return step;
  }
  async updateStep(stepData) {
    const updatedStep = await prisma.bundleStep.update({
      where: {
        id: stepData.id
      },
      data: {
        title: stepData.title,
        description: stepData.description,
        contentInputs: {
          deleteMany: {
            id: {
              notIn: stepData.contentInputs.map((input2) => input2.id)
            }
          },
          upsert: stepData.contentInputs.map((input2) => ({
            where: {
              id: input2.id
            },
            create: {
              inputLabel: input2.inputLabel,
              inputType: input2.inputType,
              maxChars: input2.maxChars,
              required: input2.required
            },
            update: {
              inputLabel: input2.inputLabel,
              inputType: input2.inputType,
              maxChars: input2.maxChars,
              required: input2.required
            }
          }))
        }
      },
      include: {
        contentInputs: true
      }
    });
    return updatedStep;
  }
}
const bundleBuilderContentStepRepository = new BundleBuilderContentStepRepository();
class BundleBuilderStepTypeService {
}
class BundleBuilderStepRepository {
  async getStepById(stepId) {
    const step = await prisma.bundleStep.findFirst({
      where: {
        id: stepId
      }
    });
    return step;
  }
  async getAllStepsForBundleId(bundleId) {
    const steps = await prisma.bundleStep.findMany({
      where: {
        bundleBuilderId: bundleId
      }
    });
    return steps;
  }
  async getNumberOfSteps(bundleId) {
    const steps = await prisma.bundleStep.count({
      where: {
        bundleBuilderId: bundleId
      }
    });
    return steps;
  }
  async getStepByBundleIdAndStepNumber(bundleId, stepNumber, storeUrl) {
    const step = await prisma.bundleStep.findFirst({
      where: {
        bundleBuilder: {
          id: bundleId,
          storeUrl
        },
        stepNumber
      }
    });
    return step;
  }
  async addNewEmptyStep(bundleId, stepType, stepDescription, stepNumber, newStepTitle) {
    const newStep = await prisma.bundleStep.create({
      data: {
        bundleBuilderId: bundleId,
        stepNumber,
        stepType,
        title: newStepTitle,
        description: stepDescription
      }
    });
    if (!newStep)
      throw new Error("Failed to create new step");
    return newStep;
  }
  async deleteStepByBundleBuilderIdAndStepNumber(bundleId, stepNumber) {
    await prisma.$transaction([
      prisma.bundleStep.deleteMany({
        where: {
          bundleBuilderId: bundleId,
          stepNumber
        }
      }),
      prisma.bundleStep.updateMany({
        where: {
          bundleBuilderId: bundleId,
          stepNumber: {
            gt: stepNumber
          }
        },
        data: {
          stepNumber: {
            decrement: 1
          }
        }
      })
    ]);
  }
}
const bundleBuilderStepRepository = new BundleBuilderStepRepository();
class BundleBuilderStepsService {
  async canAddMoreSteps(bundleId, user) {
    const canAddMoreSteps = await this.checkIfCanAddNewStep(bundleId);
    if (!canAddMoreSteps.ok) {
      return canAddMoreSteps;
    }
    const billingPlanAllowsMoreSteps = await this.checkIfBillingPlanAllowsMoreSteps(bundleId, user);
    if (!billingPlanAllowsMoreSteps.ok) {
      return billingPlanAllowsMoreSteps;
    }
    return new JsonData(true, "success", "You can add a new step");
  }
  async checkIfCanAddNewStep(bundleId) {
    await bundleBuilderStepRepository.getNumberOfSteps(bundleId);
    return new JsonData(true, "success", "You can add a new step");
  }
  async checkIfBillingPlanAllowsMoreSteps(bundleId, user) {
    const numOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(bundleId);
    if (user.isDevelopmentStore) {
      return new JsonData(true, "success", "You can add a new step");
    } else if (user.activeBillingPlan === "BASIC") {
      if (numOfSteps >= 2) {
        return new JsonData(false, "error", "You have reached the limit of 2 steps for one bundle for the basic plan.");
      }
    }
    return new JsonData(true, "success", "You can add a new step");
  }
  async incrementStepNumberForStepsGreater(bundleId, stepNumber) {
    const res = await prisma.bundleStep.updateMany({
      where: {
        bundleBuilderId: bundleId,
        stepNumber: {
          gt: stepNumber
        }
      },
      data: {
        stepNumber: {
          increment: 1
        }
      }
    });
    console.log(res);
  }
}
const bundleBuilderStepsService = new BundleBuilderStepsService();
class BundleBuilderContentStepService extends BundleBuilderStepTypeService {
  checkIfErrorsInStepData(stepData) {
    const errors = [];
    stepData.contentInputs.forEach((contentInput) => {
      if (!contentInput.inputLabel) {
        errors.push({
          fieldId: `inputLabel${contentInput.id}`,
          field: "Input label",
          message: "Input label needs to be entered."
        });
      } else if (contentInput.inputType != "IMAGE" && (!contentInput.maxChars || contentInput.maxChars < 1)) {
        errors.push({
          fieldId: `maxChars${contentInput.id}`,
          field: "Max characters",
          message: "Please enter the maximum number of characters."
        });
      }
    });
    return errors;
  }
  async updateStep(stepData) {
    console.log("stepData", stepData);
    const updatedStep = await bundleBuilderContentStepRepository.updateStep(stepData);
    return updatedStep;
  }
  async addNewStep(bundleId, stepData) {
    const numberOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(bundleId);
    stepData.stepNumber = numberOfSteps + 1;
    const newStep = await bundleBuilderContentStepRepository.addNewStep(bundleId, stepData);
    return newStep;
  }
  async duplicateStep(bundleId, stepId) {
    const stepToDuplicate = await bundleBuilderContentStepRepository.getStepById(stepId);
    if (!stepToDuplicate) {
      throw new Error("Step not found");
    }
    const contentStepDto = {
      description: stepToDuplicate.description,
      title: stepToDuplicate.title + " (Copy)",
      stepNumber: stepToDuplicate.stepNumber + 1,
      stepType: stepToDuplicate.stepType,
      contentInputs: stepToDuplicate.contentInputs.map((contentInput) => ({
        inputLabel: contentInput.inputLabel,
        inputType: contentInput.inputType,
        maxChars: contentInput.maxChars,
        required: contentInput.required
      }))
    };
    await bundleBuilderStepsService.incrementStepNumberForStepsGreater(bundleId, stepToDuplicate.stepNumber);
    const newStep = await bundleBuilderContentStepRepository.addNewStep(bundleId, contentStepDto);
    return newStep;
  }
}
const bundleBuilderContentStepService = new BundleBuilderContentStepService();
class BundleBuilderDefaultStepService {
  checkIfErrorsInStepData(stepData) {
    const errors = [];
    if (!stepData.title) {
      errors.push({
        fieldId: "stepTitle",
        field: "Step title",
        message: "Step title needs to be entered."
      });
    } else if (!stepData.description) {
      errors.push({
        fieldId: "stepDESC",
        field: "Step description",
        message: "Step description needs to be entered."
      });
    }
    return errors;
  }
}
const bundleBuilderStepService = new BundleBuilderDefaultStepService();
class ApiCacheKeyService {
  key = null;
  shop;
  constructor(shop) {
    this.shop = shop;
  }
  getKey() {
    return this.key;
  }
  getBundleDataKey(bundleBuilderId) {
    if (bundleBuilderId === null) {
      return "";
    }
    return `api-${this.shop}-${"bundleData"}-${bundleBuilderId}`;
  }
  getBundleSettingsKey(bundleBuilderId) {
    if (bundleBuilderId === null) {
      return "";
    }
    return `api-${this.shop}-${"bundleData/settings"}-${bundleBuilderId}`;
  }
  getStepKey(stepNum, bundleBuilderId) {
    if (stepNum === null) {
      return "";
    }
    return `api-${this.shop}-${"bundleData/step"}-${bundleBuilderId}-${stepNum}`;
  }
  async getAllStepsKeys(bundleBuilderId) {
    if (bundleBuilderId === null) {
      return [];
    }
    const numOfSteps = await prisma.bundleStep.aggregate({
      _count: {
        stepNumber: true
      },
      where: {
        bundleBuilderId: Number(bundleBuilderId)
      }
    });
    if (numOfSteps === null) {
      return [];
    }
    const keys = [];
    for (let i = 1; i <= numOfSteps._count.stepNumber; i++) {
      const key = this.getStepKey(String(i), bundleBuilderId);
      keys.push(key);
    }
    return keys;
  }
  async getAllBundleKeys(bundleBuilderId) {
    if (bundleBuilderId === null) {
      return [];
    }
    const keys = [];
    keys.push(this.getBundleDataKey(bundleBuilderId));
    keys.push(this.getBundleSettingsKey(bundleBuilderId));
    keys.push(...await this.getAllStepsKeys(bundleBuilderId));
    return keys;
  }
  getGlobalSettingsKey() {
    return `api-${this.shop}-${"globalSettings"}`;
  }
}
class ApiCacheService {
  key;
  constructor(key) {
    this.key = key;
  }
  async readCache() {
    const data = await redisClient.get(this.key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }
  async writeCache(data) {
    const dataForCache = JSON.stringify(data);
    await redisClient.set(this.key, dataForCache);
    redisClient.expire(this.key, 60 * 60 * 24);
  }
  static async singleKeyDelete(key) {
    await redisClient.del(key);
  }
  static async multiKeyDelete(keys) {
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
}
const bundleBuilderAndBundleSteps = {
  steps: true
};
class BundleBuilderRepository {
  static async createNewBundleBuilder(shop, bundleTitle, bundleProductId, bundlePageId, bundleBuilderPageHandle) {
    const bundle = await prisma.bundleBuilder.create({
      data: {
        user: {
          connect: {
            storeUrl: shop
          }
        },
        title: bundleTitle,
        published: true,
        shopifyProductId: bundleProductId,
        shopifyPageId: bundlePageId,
        pricing: "CALCULATED",
        discountType: "PERCENTAGE",
        discountValue: 10,
        bundleSettings: {
          create: {
            skipTheCart: false,
            allowBackNavigation: true,
            showOutOfStockProducts: false
          }
        },
        bundleBuilderPageHandle,
        steps: {
          create: [
            {
              stepNumber: 1,
              title: "Step 1",
              stepType: "PRODUCT",
              description: "This is a description for Step 1",
              productInput: {
                create: {
                  minProductsOnStep: 1,
                  maxProductsOnStep: 3,
                  allowProductDuplicates: false,
                  showProductPrice: true
                }
              },
              contentInputs: {
                create: [
                  {
                    inputType: "TEXT",
                    inputLabel: "Enter text",
                    maxChars: 50,
                    required: true
                  },
                  {
                    inputLabel: "",
                    maxChars: 0,
                    required: false,
                    inputType: "NONE"
                  }
                ]
              }
            },
            {
              stepNumber: 2,
              title: "Step 2",
              description: "This is a description for Step 2",
              stepType: "PRODUCT",
              productInput: {
                create: {
                  minProductsOnStep: 1,
                  maxProductsOnStep: 3,
                  allowProductDuplicates: false,
                  showProductPrice: true
                }
              },
              contentInputs: {
                create: [
                  {
                    inputType: "TEXT",
                    inputLabel: "Enter text",
                    maxChars: 50,
                    required: true
                  },
                  {
                    inputLabel: "",
                    maxChars: 0,
                    required: false,
                    inputType: "NONE"
                  }
                ]
              }
            },
            {
              stepNumber: 3,
              title: "Step 3",
              description: "This is a description for Step 3",
              stepType: "PRODUCT",
              productInput: {
                create: {
                  minProductsOnStep: 1,
                  maxProductsOnStep: 3,
                  allowProductDuplicates: false,
                  showProductPrice: true
                }
              },
              contentInputs: {
                create: [
                  {
                    inputType: "TEXT",
                    inputLabel: "Enter text",
                    maxChars: 50,
                    required: true
                  },
                  {
                    inputLabel: "",
                    maxChars: 0,
                    required: false,
                    inputType: "NONE"
                  }
                ]
              }
            }
          ]
        }
      }
    });
    return bundle;
  }
  static async createNewEmptyBundleBuilder(shop, bundleTitle, bundleProductId, bundlePageId, bundleBuilderPageHandle) {
    const bundleBuilder = await prisma.bundleBuilder.create({
      data: {
        user: {
          connect: {
            storeUrl: shop
          }
        },
        title: bundleTitle,
        published: true,
        shopifyProductId: bundleProductId,
        shopifyPageId: bundlePageId,
        bundleBuilderPageHandle,
        pricing: "CALCULATED",
        discountType: "PERCENTAGE",
        discountValue: 10,
        bundleSettings: {
          create: {
            skipTheCart: false,
            allowBackNavigation: true,
            showOutOfStockProducts: false
          }
        }
      }
    });
    return bundleBuilder;
  }
  async getAllActiveBundleBuilders(storeUrl) {
    return prisma.bundleBuilder.findMany({
      where: {
        storeUrl,
        deleted: false
      }
    });
  }
  async getFirstActiveBundleBuilder(storeUrl) {
    return prisma.bundleBuilder.findFirst({
      where: {
        storeUrl,
        deleted: false
      }
    });
  }
  static async getBundleBuilderById(bundleBuilderId) {
    return prisma.bundleBuilder.findUnique({
      where: {
        id: bundleBuilderId
      }
    });
  }
  static async updateBundleBuilderProductId(bundleBuilderId, productId) {
    await prisma.bundleBuilder.update({
      where: {
        id: bundleBuilderId
      },
      data: {
        shopifyProductId: productId
      }
    });
  }
  static async updateBundleBuilderPage(bundleBuilderId, newPage) {
    await prisma.bundleBuilder.update({
      where: {
        id: bundleBuilderId
      },
      data: {
        shopifyPageId: newPage.id,
        bundleBuilderPageHandle: newPage.handle
      }
    });
  }
  static async getMaxBundleBuilderId(shop) {
    const { _max } = await prisma.bundleBuilder.aggregate({
      _max: {
        id: true
      },
      where: {
        storeUrl: shop
      }
    });
    return _max.id;
  }
  async getBundleBuilderCountByStoreUrl(storeUrl) {
    return prisma.bundleBuilder.count({
      where: {
        storeUrl,
        deleted: false
      }
    });
  }
  async getBundleBuilderByIdAndStoreUrl(id, storeUrl) {
    return prisma.bundleBuilder.findUnique({
      where: {
        id,
        storeUrl,
        deleted: false
      }
    });
  }
  async getAllBundleBuilderAndBundleSteps(storeUrl) {
    const bundleBuilders = await prisma.bundleBuilder.findMany({
      where: {
        user: {
          storeUrl
        },
        deleted: false
      },
      include: bundleBuilderAndBundleSteps,
      orderBy: {
        createdAt: "desc"
      }
    });
    return bundleBuilders;
  }
  async getAllBundleBuilderAndBundleStepsAsc(storeUrl) {
    const bundleBuilders = await prisma.bundleBuilder.findMany({
      where: {
        user: {
          storeUrl
        },
        deleted: false
      },
      include: bundleBuilderAndBundleSteps,
      orderBy: {
        createdAt: "asc"
      }
    });
    return bundleBuilders;
  }
  async deleteBundleBuilderById(id) {
    await prisma.bundleBuilder.update({
      where: {
        id
      },
      data: {
        deleted: true
      }
    });
  }
  async deleteBundles(bundlesForDeleting) {
    await prisma.bundleBuilder.updateMany({
      where: {
        id: {
          in: bundlesForDeleting
        }
      },
      data: {
        deleted: true
      }
    });
  }
}
const bundleBuilderRepository = new BundleBuilderRepository();
async function AuthorizationCheck(storeUrl, bundleId) {
  try {
    const bundleBuilder = await bundleBuilderRepository.getBundleBuilderByIdAndStoreUrl(bundleId, storeUrl);
    if (!bundleBuilder) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
  return true;
}
const loader$w = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  console.log("I'm on stepnum.content loader");
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const stepData = await bundleBuilderContentStepRepository.getStepByBundleIdAndStepNumber(Number(params.bundleid), Number(params.stepnum));
  if (!stepData) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  return json({
    ...new JsonData(true, "success", "Step data was loaded", [], stepData)
  });
};
const action$q = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect("/app");
  const formData = await request.formData();
  const action2 = formData.get("action");
  console.log("I'm on stepnum.content", action2);
  switch (action2) {
    case "updateStep": {
      const stepData = JSON.parse(formData.get("stepData"));
      const errors = [];
      const basicErrors = bundleBuilderStepService.checkIfErrorsInStepData(stepData);
      errors.push(...basicErrors);
      const stepSpecificErrors = bundleBuilderContentStepService.checkIfErrorsInStepData(stepData);
      errors.push(...stepSpecificErrors);
      if (errors.length > 0) {
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request", errors, stepData)
          },
          { status: 400 }
        );
      }
      try {
        await bundleBuilderContentStepService.updateStep(stepData);
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await Promise.all([
          ApiCacheService.singleKeyDelete(cacheKeyService.getStepKey(stepData.stepNumber.toString(), params.bundleid)),
          ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid))
        ]);
        return json(
          {
            ...new JsonData(true, "success", "Step succesfully updated", errors, stepData)
          },
          { status: 400 }
        );
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request")
          },
          { status: 400 }
        );
      }
    }
    default:
      return json(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything")
        },
        { status: 200 }
      );
  }
};
function Index$s() {
  const nav = useNavigation();
  const isLoading = nav.state === "loading";
  const isSubmitting = nav.state === "submitting";
  const navigateSubmit = useNavigateSubmit();
  const params = useParams();
  const actionData = useActionData();
  const submittedStepData = actionData?.data;
  const errors = actionData?.errors;
  const loaderData = useLoaderData().data;
  const serverStepData = loaderData;
  const [stepData, setStepData] = useState(errors?.length === 0 || !errors ? serverStepData : submittedStepData);
  const updateContentInput = (contentInput) => {
    setStepData((stepData2) => {
      return {
        ...stepData2,
        contentInputs: stepData2.contentInputs.map((input2) => {
          if (input2.id === contentInput.id) {
            return contentInput;
          }
          return input2;
        })
      };
    });
  };
  useEffect(() => {
    if (errors && errors.length === 0) {
      window.scrollTo(0, 0);
      return;
    }
    errors?.forEach((err) => {
      if (err.fieldId) {
        document.getElementById(err.fieldId)?.scrollIntoView();
        return;
      }
    });
  }, [errors, isLoading]);
  const updateFieldErrorHandler = (fieldId) => {
    errors?.forEach((err) => {
      if (err.fieldId === fieldId) {
        err.message = "";
      }
    });
  };
  const addContentInputFieldHandler = () => {
    setStepData((stepData2) => {
      return {
        ...stepData2,
        contentInputs: [
          ...stepData2.contentInputs,
          {
            id: stepData2.contentInputs.length + 1,
            bundleStepId: stepData2.id,
            inputType: "TEXT",
            inputLabel: "Enter your name",
            required: true,
            maxChars: 100
          }
        ]
      };
    });
  };
  const removeContentInputFieldHandler = (inputId) => {
    setStepData((stepData2) => {
      return {
        ...stepData2,
        contentInputs: stepData2.contentInputs.filter((input2) => input2.id !== inputId)
      };
    });
  };
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading || isSubmitting ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, fullWidth: true }) : /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
    errors && errors.length === 0 ? /* @__PURE__ */ jsx(Banner, { title: "Step updated!", tone: "success", onDismiss: () => {
    }, children: /* @__PURE__ */ jsx(BlockStack, { gap: GapInsideSection, children: /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "You succesfuly updated this step." }) }) }) : null,
    /* @__PURE__ */ jsxs(Form, { method: "POST", "data-discard-confirmation": true, "data-save-bar": true, children: [
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "action", defaultValue: "updateStep" }),
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "stepData", value: JSON.stringify(stepData) }),
      /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
        /* @__PURE__ */ jsxs(Layout, { children: [
          /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(BlockStack, { gap: LargeGapBetweenSections, children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
            /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
              /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingLg", children: "Content step configuration" }),
              /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", tone: "subdued", children: "On content steps, customers will need to enter content (text, numbers, or images) into the input fields." })
            ] }),
            /* @__PURE__ */ jsx(BlockStack, { gap: GapBetweenSections, children: stepData.contentInputs.length > 0 ? /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
              stepData.contentInputs.map((contentInput, index2) => /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  Index$t,
                  {
                    removeContentInputField: removeContentInputFieldHandler,
                    contentInput,
                    errors,
                    inputId: contentInput.id,
                    index: index2 + 1,
                    updateFieldErrorHandler,
                    updateContentInput
                  },
                  contentInput.id
                ),
                stepData.contentInputs.indexOf(contentInput) !== stepData.contentInputs.length - 1 && /* @__PURE__ */ jsx(Divider, {})
              ] })),
              stepData.contentInputs.length < 2 && /* @__PURE__ */ jsx(Button, { variant: "primary", fullWidth: true, onClick: addContentInputFieldHandler, children: "Add another input field" })
            ] }) : /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
              /* @__PURE__ */ jsx(Text, { as: "p", children: "There are no content inputs on this step." }),
              /* @__PURE__ */ jsx(Button, { onClick: addContentInputFieldHandler, variant: "primary", fullWidth: true, children: "Add first input field" })
            ] }) })
          ] }) }) }) }),
          /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsx(BlockStack, { gap: GapBetweenSections, children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
            /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Step details" }),
            /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Step title",
                error: errors?.find((err) => err.fieldId === "stepTitle")?.message,
                type: "text",
                name: `stepTitle`,
                value: stepData.title,
                helpText: "Customers will see this title when they build a bundle.",
                onChange: (newTitle) => {
                  setStepData((stepData2) => {
                    return {
                      ...stepData2,
                      title: newTitle
                    };
                  });
                  updateFieldErrorHandler("stepTitle");
                },
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Step description",
                value: stepData.description,
                type: "text",
                name: `stepDescription`,
                helpText: "This description will be displayed to the customer.",
                onChange: (newDesc) => {
                  setStepData((stepData2) => {
                    return {
                      ...stepData2,
                      description: newDesc
                    };
                  });
                  updateFieldErrorHandler("stepDESC");
                },
                error: errors?.find((err) => err.fieldId === "stepDESC")?.message,
                autoComplete: "off"
              }
            )
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsx(Box, { width: "full", children: /* @__PURE__ */ jsx(BlockStack, { inlineAlign: "end", children: /* @__PURE__ */ jsxs(ButtonGroup, { children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "primary",
              tone: "critical",
              onClick: async () => {
                await shopify.saveBar.leaveConfirmation();
                navigateSubmit("deleteStep", `${params.stepnum}?redirect=true`);
              },
              children: "Delete"
            }
          ),
          /* @__PURE__ */ jsx(Button, { variant: "primary", submit: true, children: "Save step" })
        ] }) }) })
      ] })
    ] })
  ] }) });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$q,
  default: Index$s,
  loader: loader$w
}, Symbol.toStringTag, { value: "Module" }));
function Index$r({
  updateSelectedProducts,
  selectedProducts,
  stepId,
  onBoarding
}) {
  const shopify2 = useAppBridge();
  const submit = useSubmit();
  const showModalPicker = async () => {
    const selectedResourcesIds = selectedProducts?.map((product) => {
      return { id: product.shopifyProductId };
    }) || [];
    const newSelectedResources = await shopify2.resourcePicker({
      type: "product",
      multiple: true,
      action: "select",
      filter: {
        variants: false,
        draft: false,
        archived: false,
        multiple: 2,
        query: `-tag:${bundleTagIndentifier}`
      },
      selectionIds: selectedResourcesIds
    });
    if (!newSelectedResources)
      return;
    const newSelectedProducts = newSelectedResources.map((selectedResource) => {
      return {
        shopifyProductId: selectedResource.id,
        shopifyProductHandle: selectedResource.handle
      };
    });
    if (!onBoarding) {
      if (!stepId) {
        throw new Error("Step id is required");
      }
      const form2 = new FormData();
      form2.append("action", "updateSelectedProducts");
      form2.append("selectedProducts", JSON.stringify({ stepId, selectedProducts: newSelectedProducts }));
      submit(form2, { method: "POST", navigate: true });
    } else {
      updateSelectedProducts(newSelectedProducts);
    }
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Button, { onClick: showModalPicker, fullWidth: true, variant: selectedProducts?.length > 0 ? "secondary" : "primary", children: selectedProducts.length === 0 ? "Select products" : `${selectedProducts?.length} products selected` }) });
}
class BundleBuilderProductInputRepository {
  async updateSelectedProducts(bundleStepId, selectedProducts) {
    const updatedProductInput = await prisma.productInput.update({
      where: {
        bundleStepId
      },
      data: {
        products: {
          set: [],
          connectOrCreate: selectedProducts.map((product) => {
            return {
              where: {
                shopifyProductId: product.shopifyProductId
              },
              create: {
                shopifyProductId: product.shopifyProductId,
                shopifyProductHandle: product.shopifyProductHandle
              }
            };
          })
        }
      }
    });
    return updatedProductInput;
  }
  // public async updateProductInput(bundleStepId: number, selectedProducts: Product[]): Promise<ProductInput> {
  //     const updatedProductInput: ProductInput = await db.productInput.update({
  //         where: {
  //             bundleStepId: bundleStepId,
  //         },
  //         data: {
  // minProductsOnStep: stepData.productInput?.minProductsOnStep,
  // maxProductsOnStep: stepData.productInput?.maxProductsOnStep,
  // allowProductDuplicates: stepData.productInput?.allowProductDuplicates,
  // showProductPrice: stepData.productInput?.showProductPrice,
  //             products: {
  //                 set: [],
  //                 connectOrCreate: selectedProducts.map((product: Product) => {
  //                     return {
  //                         where: {
  //                             shopifyProductId: product.shopifyProductId,
  //                         },
  //                         create: {
  //                             shopifyProductId: product.shopifyProductId,
  //                             shopifyProductHandle: product.shopifyProductHandle,
  //                         },
  //                     };
  //                 }),
  //             },
  //         },
  //     });
  //     return updatedProductInput;
  // }
}
const bundleBuilderProductInputRepository = new BundleBuilderProductInputRepository();
class BundleBuilderProductStepRepository extends BundleBuilderStepTypeRepository {
  async getStepById(stepId) {
    const step = await prisma.bundleStep.findFirst({
      where: {
        id: stepId
      },
      include: {
        productInput: {
          include: {
            products: true
          }
        }
      }
    });
    return step;
  }
  async getStepByBundleIdAndStepNumber(bundleId, stepNumber) {
    const step = await prisma.bundleStep.findFirst({
      where: {
        bundleBuilderId: bundleId,
        stepNumber
      },
      include: {
        productInput: {
          include: {
            products: true
          }
        }
      }
    });
    return step;
  }
  async addNewStep(bundleId, stepData) {
    const newStep = await prisma.bundleStep.create({
      data: {
        bundleBuilderId: bundleId,
        stepNumber: stepData.stepNumber,
        stepType: StepType.PRODUCT,
        title: stepData.title,
        description: stepData.description,
        productInput: {
          create: {
            minProductsOnStep: stepData.productInput?.minProductsOnStep || 1,
            maxProductsOnStep: stepData.productInput?.maxProductsOnStep || 3,
            allowProductDuplicates: false,
            showProductPrice: true
          }
        }
      },
      include: {
        productInput: {
          include: {
            products: true
          }
        }
      }
    });
    await bundleBuilderProductInputRepository.updateSelectedProducts(newStep.id, stepData.productInput?.products || []);
    if (!newStep)
      throw new Error("Failed to create new step");
    return newStep;
  }
  async updateStep(stepData) {
    const updatedStep = await prisma.bundleStep.update({
      where: {
        id: stepData.id
      },
      data: {
        title: stepData.title,
        description: stepData.description,
        productInput: {
          update: {
            minProductsOnStep: stepData.productInput?.minProductsOnStep,
            maxProductsOnStep: stepData.productInput?.maxProductsOnStep,
            allowProductDuplicates: stepData.productInput?.allowProductDuplicates,
            showProductPrice: stepData.productInput?.showProductPrice
          }
        }
      },
      include: {
        productInput: {
          include: {
            products: true
          }
        }
      }
    });
    await bundleBuilderProductInputRepository.updateSelectedProducts(updatedStep.id, stepData.productInput?.products || []);
    return updatedStep;
  }
}
const bundleBuilderProductStepRepository = new BundleBuilderProductStepRepository();
class BundleBuilderProductStepService extends BundleBuilderStepTypeService {
  checkIfErrorsInStepData(stepData) {
    const errors = [];
    if (!stepData.productInput?.minProductsOnStep) {
      errors.push({
        fieldId: "minProducts",
        field: "Minimum products on step",
        message: "Please enter the minimum number of products (1 or more) that the customer can select on this step."
      });
    } else if (!stepData.productInput?.maxProductsOnStep) {
      errors.push({
        fieldId: "maxProducts",
        field: "Maximum products on step",
        message: "Please enter the maximum number of products (1 or more) that the customer can select on this step."
      });
    } else if (stepData.productInput?.minProductsOnStep > stepData.productInput?.maxProductsOnStep) {
      errors.push({
        fieldId: "minProducts",
        field: "Minimum products on step",
        message: "Minimum number of products can not be greater than the maximum number of products."
      });
    } else if (stepData.productInput?.products.length < stepData.productInput.minProductsOnStep) {
      errors.push({
        fieldId: "products",
        field: "Products",
        message: `Please select at least ${stepData.productInput.minProductsOnStep} products.`
      });
    }
    return errors;
  }
  async updateStep(stepData) {
    const updatedStep = await bundleBuilderProductStepRepository.updateStep(stepData);
    return updatedStep;
  }
  async addNewStep(bundleId, stepData) {
    const numberOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(bundleId);
    stepData.stepNumber = numberOfSteps + 1;
    console.log("stepData", stepData);
    const newStep = await bundleBuilderProductStepRepository.addNewStep(bundleId, stepData);
    return newStep;
  }
  async duplicateStep(bundleId, stepId) {
    const stepToDuplicate = await bundleBuilderProductStepRepository.getStepById(stepId);
    if (!stepToDuplicate) {
      throw new Error("Step not found");
    }
    const stepData = {
      description: stepToDuplicate.description,
      title: stepToDuplicate.title + " (Copy)",
      stepNumber: stepToDuplicate.stepNumber + 1,
      stepType: stepToDuplicate.stepType,
      productInput: {
        minProductsOnStep: stepToDuplicate.productInput?.minProductsOnStep || 1,
        maxProductsOnStep: stepToDuplicate.productInput?.maxProductsOnStep || 1,
        allowProductDuplicates: stepToDuplicate.productInput?.allowProductDuplicates || false,
        showProductPrice: stepToDuplicate.productInput?.showProductPrice || true,
        products: stepToDuplicate.productInput?.products || []
      }
    };
    await bundleBuilderStepsService.incrementStepNumberForStepsGreater(bundleId, stepToDuplicate.stepNumber);
    const newStep = await bundleBuilderProductStepRepository.addNewStep(bundleId, stepData);
    return newStep;
  }
}
const bundleBuilderProductStepService = new BundleBuilderProductStepService();
const loader$v = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  console.log("I'm on stepNum.product loader");
  const stepData = await bundleBuilderProductStepRepository.getStepByBundleIdAndStepNumber(Number(params.bundleid), Number(params.stepnum));
  if (!stepData) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  return json({
    ...new JsonData(true, "success", "Step data was loaded", [], stepData)
  });
};
const action$p = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  const formData = await request.formData();
  const action2 = formData.get("action");
  console.log("I'm on stepNum.product", action2);
  const bundleId = params.bundleid;
  if (!bundleId) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle id and step number are required"
    });
  }
  switch (action2) {
    case "updateSelectedProducts": {
      const selectedProducts = JSON.parse(formData.get("selectedProducts"));
      await bundleBuilderProductInputRepository.updateSelectedProducts(selectedProducts.stepId, selectedProducts.selectedProducts);
      const cacheKeyService = new ApiCacheKeyService(session.shop);
      ApiCacheService.singleKeyDelete(cacheKeyService.getStepKey(params.stepnum, params.bundleid));
      return json(new JsonData(true, "success", "Selected products were updated"));
    }
    case "updateStep": {
      const stepData = JSON.parse(formData.get("stepData"));
      const errors = [];
      const basicErrors = bundleBuilderStepService.checkIfErrorsInStepData(stepData);
      errors.push(...basicErrors);
      const stepSpecificErrors = bundleBuilderProductStepService.checkIfErrorsInStepData(stepData);
      errors.push(...stepSpecificErrors);
      if (errors.length > 0) {
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request", errors, stepData)
          },
          { status: 400 }
        );
      }
      try {
        await bundleBuilderProductStepService.updateStep(stepData);
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await Promise.all([
          ApiCacheService.singleKeyDelete(cacheKeyService.getStepKey(stepData.stepNumber.toString(), params.bundleid)),
          ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid))
        ]);
        return json(
          {
            ...new JsonData(true, "success", "Step succesfully updated", errors, stepData)
          },
          { status: 400 }
        );
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request")
          },
          { status: 400 }
        );
      }
    }
    default:
      return json(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything")
        },
        { status: 200 }
      );
  }
};
function Index$q() {
  const nav = useNavigation();
  const isLoading = nav.state != "idle";
  const navigateSubmit = useNavigateSubmit();
  const fetcher = useFetcher();
  const params = useParams();
  const actionData = useActionData();
  const submittedStepData = actionData?.data;
  const errors = actionData?.errors;
  const serverStepData = {
    ...useLoaderData().data,
    stepType: useLoaderData().data.stepType
  };
  const [stepData, setStepData] = useState(errors?.length === 0 || !errors ? serverStepData : submittedStepData);
  const updateSelectedProducts = (products) => {
    setStepData((stepData2) => {
      if (!stepData2.productInput)
        return stepData2;
      return {
        ...stepData2,
        productInput: {
          ...stepData2.productInput,
          products
        }
      };
    });
    updateFieldErrorHandler("products");
  };
  useEffect(() => {
    if (errors && errors.length === 0) {
      window.scrollTo(0, 0);
      return;
    }
    errors?.forEach((err) => {
      if (err.fieldId) {
        document.getElementById(err.fieldId)?.scrollIntoView();
        return;
      }
    });
  }, [isLoading, errors]);
  const updateFieldErrorHandler = (fieldId) => {
    errors?.forEach((err) => {
      if (err.fieldId === fieldId) {
        err.message = "";
      }
    });
  };
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading || fetcher.state !== "idle" ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, fullWidth: true }) : /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
    errors && errors.length === 0 ? /* @__PURE__ */ jsx(Banner, { title: "Step updated!", tone: "success", onDismiss: () => {
    }, children: /* @__PURE__ */ jsx(BlockStack, { gap: GapInsideSection, children: /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "You succesfuly updated this step." }) }) }) : null,
    /* @__PURE__ */ jsxs(Form, { method: "POST", "data-discard-confirmation": true, "data-save-bar": true, children: [
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "action", defaultValue: "updateStep" }),
      /* @__PURE__ */ jsx("input", { type: "hidden", name: "stepData", value: JSON.stringify(stepData) }),
      /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
        /* @__PURE__ */ jsxs(Layout, { children: [
          /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: LargeGapBetweenSections, children: [
            /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
              /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingLg", children: "Product step configuration" }),
              /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", tone: "subdued", children: "On product steps, customers can choose products to add to their bundle." })
            ] }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
              /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Available products for customers to select" }),
              /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    name: "products[]",
                    type: "hidden",
                    value: stepData.productInput?.products.map((product) => product.shopifyProductId).join(",")
                  }
                ),
                /* @__PURE__ */ jsx(
                  Index$r,
                  {
                    stepId: stepData.id,
                    selectedProducts: stepData.productInput?.products || [],
                    updateSelectedProducts
                  }
                ),
                /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", tone: "subdued", children: "This will be the list of products that customers can choose from." }),
                /* @__PURE__ */ jsx(InlineError, { message: errors?.find((err) => err.fieldId === "products")?.message || "", fieldID: "products" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
              /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Product rules" }),
              /* @__PURE__ */ jsxs(BlockStack, { gap: LargeGapBetweenSections, children: [
                /* @__PURE__ */ jsxs(InlineGrid, { columns: 2, gap: HorizontalGap, children: [
                  /* @__PURE__ */ jsx(Box, { id: "minProducts", children: /* @__PURE__ */ jsx(
                    TextField,
                    {
                      label: "Minimum products to select",
                      type: "number",
                      helpText: "Customers must select at least this number of products on this step.",
                      autoComplete: "off",
                      inputMode: "numeric",
                      name: `minProductsToSelect`,
                      min: 1,
                      value: stepData.productInput?.minProductsOnStep.toString(),
                      onChange: (value) => {
                        setStepData((stepData2) => {
                          if (!stepData2.productInput)
                            return {
                              ...stepData2
                            };
                          return {
                            ...stepData2,
                            productInput: {
                              ...stepData2.productInput,
                              minProductsOnStep: Number(value)
                            }
                          };
                        });
                        updateFieldErrorHandler("minProducts");
                      },
                      error: errors?.find((err) => err.fieldId === "minProducts")?.message
                    }
                  ) }),
                  /* @__PURE__ */ jsx(Box, { id: "maxProducts", children: /* @__PURE__ */ jsx(
                    TextField,
                    {
                      label: "Maximum products to select",
                      helpText: "Customers can select up to this number of products on this step.",
                      type: "number",
                      autoComplete: "off",
                      inputMode: "numeric",
                      name: `maxProductsToSelect`,
                      min: stepData.productInput?.minProductsOnStep || 1,
                      value: stepData.productInput?.maxProductsOnStep.toString(),
                      onChange: (value) => {
                        setStepData((stepData2) => {
                          if (!stepData2.productInput)
                            return stepData2;
                          return {
                            ...stepData2,
                            productInput: {
                              ...stepData2.productInput,
                              maxProductsOnStep: Number(value)
                            }
                          };
                        });
                        updateFieldErrorHandler("maxProducts");
                      },
                      error: errors?.find((err) => err.fieldId === "maxProducts")?.message
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsx(
                  ChoiceList,
                  {
                    title: "Display products",
                    allowMultiple: true,
                    name: `displayProducts`,
                    choices: [
                      {
                        label: "Allow customers to select one product more than once",
                        value: "allowProductDuplicates"
                      },
                      {
                        label: "Show the price under each product",
                        value: "showProductPrice"
                      }
                    ],
                    selected: [
                      stepData.productInput?.allowProductDuplicates ? "allowProductDuplicates" : "",
                      stepData.productInput?.showProductPrice ? "showProductPrice" : ""
                    ],
                    onChange: (selectedValues) => {
                      setStepData((stepData2) => {
                        if (!stepData2.productInput)
                          return stepData2;
                        return {
                          ...stepData2,
                          productInput: {
                            ...stepData2.productInput,
                            allowProductDuplicates: selectedValues.includes("allowProductDuplicates"),
                            showProductPrice: selectedValues.includes("showProductPrice")
                          }
                        };
                      });
                    }
                  }
                )
              ] })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsx(BlockStack, { gap: GapBetweenSections, children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
            /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Step details" }),
            /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Step title",
                error: errors?.find((err) => err.fieldId === "stepTitle")?.message,
                type: "text",
                name: `stepTitle`,
                value: stepData.title,
                helpText: "Customers will see this title when they build a bundle.",
                onChange: (newTitle) => {
                  setStepData((stepData2) => {
                    return {
                      ...stepData2,
                      title: newTitle
                    };
                  });
                  updateFieldErrorHandler("stepTitle");
                },
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Step description",
                value: stepData.description,
                type: "text",
                name: `stepDescription`,
                helpText: "Customers will see this description on this step.",
                onChange: (newDesc) => {
                  setStepData((stepData2) => {
                    return {
                      ...stepData2,
                      description: newDesc
                    };
                  });
                  updateFieldErrorHandler("stepDESC");
                },
                error: errors?.find((err) => err.fieldId === "stepDESC")?.message,
                autoComplete: "off"
              }
            )
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsx(Box, { width: "full", children: /* @__PURE__ */ jsx(BlockStack, { inlineAlign: "end", children: /* @__PURE__ */ jsxs(ButtonGroup, { children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "primary",
              tone: "critical",
              onClick: async () => {
                await shopify.saveBar.leaveConfirmation();
                navigateSubmit("deleteStep", `/app/edit-bundle-builder/${params.bundleid}/steps/${params.stepnum}?redirect=true`);
              },
              children: "Delete"
            }
          ),
          /* @__PURE__ */ jsx(Button, { variant: "primary", submit: true, children: "Save step" })
        ] }) }) })
      ] })
    ] })
  ] }) });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$p,
  default: Index$q,
  loader: loader$v
}, Symbol.toStringTag, { value: "Module" }));
const tableWrapper$a = "_tableWrapper_1tdlw_1";
const loadingTable$a = "_loadingTable_1tdlw_5";
const hide$a = "_hide_1tdlw_18";
const styles$f = {
  tableWrapper: tableWrapper$a,
  loadingTable: loadingTable$a,
  hide: hide$a
};
function Index$p({ onClick, url }) {
  return /* @__PURE__ */ jsx("div", { style: { width: "200px" }, children: /* @__PURE__ */ jsx(
    Button,
    {
      fullWidth: true,
      variant: "primary",
      url,
      onClick: () => {
        onClick();
      },
      children: "Next"
    }
  ) });
}
const loader$u = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Founasdfasdfd"
    });
  }
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  if (!params.bundleid) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle id is required"
    });
  }
  const bundleBuilder = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));
  if (!bundleBuilder) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle with this id not found"
    });
  }
  return json(new JsonData(true, "success", "Loader response", [], bundleBuilder), { status: 200 });
};
const action$o = async ({ request, params }) => {
  return json(
    {
      ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
    },
    { status: 200 }
  );
};
function Index$o() {
  const submit = useSubmit();
  const params = useParams();
  const [errors, setErrors] = useState([]);
  const handleNextBtnHandler = () => {
    if (!stepTitle) {
      return;
    }
    if (contentInput.inputLabel.length === 0) {
      setErrors((errors2) => {
        if (!errors2) {
          return [
            {
              fieldId: `inputLabel${contentInput.id}`,
              field: "Input label",
              message: "Input label is required"
            }
          ];
        }
        return [
          ...errors2,
          {
            fieldId: `inputLabel${contentInput.id}`,
            field: "Input label",
            message: "Input label is required"
          }
        ];
      });
      return;
    } else if (contentInput.inputType != "IMAGE" && (!contentInput.maxChars || contentInput.maxChars < 1)) {
      setErrors((errors2) => {
        if (!errors2) {
          return [
            {
              fieldId: `maxChars${contentInput.id}`,
              field: "Max length",
              message: "Max length is required and must be greater than 0"
            }
          ];
        }
        return [
          ...errors2,
          {
            fieldId: `maxChars${contentInput.id}`,
            field: "Max length",
            message: "Max length is required and must be greater than 0"
          }
        ];
      });
      return;
    }
    const form2 = new FormData();
    const stepData = {
      title: stepTitle,
      description: "",
      stepType: "CONTENT",
      stepNumber: 1,
      contentInputs: [{ inputLabel: contentInput.inputLabel, required: contentInput.required, maxChars: contentInput.maxChars, inputType: contentInput.inputType }]
    };
    form2.append("stepData", JSON.stringify(stepData));
    form2.append("action", "addContentStep");
    submit(form2, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps?onboarding=true&stepNumber=4` });
  };
  const [stepTitle, setStepTitle] = useState();
  const [contentInput, setContentInput] = useState({
    id: 1,
    inputType: "TEXT",
    inputLabel: "",
    required: true,
    maxChars: 50,
    bundleStepId: 1
  });
  const updateContentInput = (contentInput2) => {
    setContentInput(contentInput2);
  };
  const updateFieldErrorHandler = (fieldId) => {
    setErrors((errors2) => {
      const newErrors = errors2.filter((error) => error.fieldId === fieldId);
      return newErrors;
    });
  };
  const removeContentInputFieldHandler = (inputId) => {
    setContentInput((contentInput2) => {
      return {
        ...contentInput2,
        id: contentInput2.id - 1
      };
    });
  };
  return /* @__PURE__ */ jsx("div", { className: styles$f.fadeIn, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "1000", inlineAlign: "center", children: [
    /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
      /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", alignment: "center", children: "Enter the title for the second step" }),
      /* @__PURE__ */ jsx(
        TextField,
        {
          label: "Step title",
          labelHidden: true,
          error: stepTitle === "" ? "Step title is required" : "",
          type: "text",
          name: `stepTitle`,
          value: stepTitle,
          helpText: "Customers will see this title when they build a bundle.",
          onChange: (newTitle) => {
            setStepTitle(newTitle);
          },
          autoComplete: "off"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(BlockStack, { gap: "600", inlineAlign: "center", children: [
      /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", alignment: "center", children: "Configure the input fields for the second step" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", tone: "subdued", alignment: "center", children: "This is a content step, where customers will need to enter content (text, numbers or image) into the input fields." })
      ] }),
      /* @__PURE__ */ jsx(
        Index$t,
        {
          removeContentInputField: removeContentInputFieldHandler,
          contentInput,
          single: true,
          errors,
          inputId: contentInput.id,
          index: 1,
          updateFieldErrorHandler,
          updateContentInput
        },
        contentInput.id
      )
    ] }),
    /* @__PURE__ */ jsx(Index$p, { onClick: handleNextBtnHandler })
  ] }) });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$o,
  default: Index$o,
  loader: loader$u
}, Symbol.toStringTag, { value: "Module" }));
const tableWrapper$9 = "_tableWrapper_1tdlw_1";
const loadingTable$9 = "_loadingTable_1tdlw_5";
const hide$9 = "_hide_1tdlw_18";
const styles$e = {
  tableWrapper: tableWrapper$9,
  loadingTable: loadingTable$9,
  hide: hide$9
};
const loader$t = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  if (!params.bundleid) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle id is required"
    });
  }
  const bundleBuilder = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));
  if (!bundleBuilder) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle with this id not found"
    });
  }
  return json(new JsonData(true, "success", "Loader response", [], bundleBuilder), { status: 200 });
};
const action$n = async ({ request, params }) => {
  await authenticate.admin(request);
  return json(
    {
      ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
    },
    { status: 200 }
  );
};
function Index$n() {
  const params = useParams();
  const submit = useSubmit();
  const handleNextBtnHandler = () => {
    if (stepProducts.length === 0 || stepProducts.length < minProducts) {
      setProductSelectionActivated(true);
      return;
    }
    if (minProducts < 1 || maxProducts < minProducts) {
      setProductSelectionActivated(true);
      return;
    }
    if (!stepTitle) {
      setProductSelectionActivated(true);
      return;
    }
    const form2 = new FormData();
    const stepData = {
      title: stepTitle,
      description: "",
      stepType: "PRODUCT",
      stepNumber: 2,
      productInput: {
        minProductsOnStep: minProducts,
        maxProductsOnStep: maxProducts,
        products: stepProducts,
        allowProductDuplicates: false,
        showProductPrice: true
      }
    };
    form2.append("stepData", JSON.stringify(stepData));
    form2.append("action", "addProductStep");
    submit(form2, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps?stepNumber=4&onboarding=true`, navigate: true });
  };
  const [productSelectionActivated, setProductSelectionActivated] = useState(false);
  const [stepTitle, setStepTitle] = useState();
  const [stepProducts, setStepProducts] = useState([]);
  const [minProducts, setMinProducts] = useState(1);
  const [maxProducts, setMaxProducts] = useState(3);
  const updateSelectedProducts = (products) => {
    setProductSelectionActivated(true);
    setStepProducts(products);
  };
  return /* @__PURE__ */ jsx("div", { className: styles$e.fadeIn, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "1000", inlineAlign: "center", children: [
    /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
      /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", alignment: "center", children: "Enter the title for the second step" }),
      /* @__PURE__ */ jsx(
        TextField,
        {
          label: "Step title",
          labelHidden: true,
          error: stepTitle === "" ? "Step title is required" : "",
          type: "text",
          name: `stepTitle`,
          value: stepTitle,
          helpText: "Customers will see this title when they build a bundle.",
          onChange: (newTitle) => {
            setStepTitle(newTitle);
          },
          autoComplete: "off"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(BlockStack, { gap: "600", inlineAlign: "center", children: [
      /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", alignment: "center", children: "Select the products you want to display on this step" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", tone: "subdued", alignment: "center", children: "This is a product step, where customers can choose products to add to their bundle." })
      ] }),
      /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
        /* @__PURE__ */ jsx(Index$r, { onBoarding: true, stepId: void 0, selectedProducts: stepProducts, updateSelectedProducts }),
        /* @__PURE__ */ jsx(
          InlineError,
          {
            message: (stepProducts.length === 0 || stepProducts.length < minProducts) && productSelectionActivated ? `Please select at least ${minProducts} products.` : "",
            fieldID: "products"
          }
        ),
        /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Product rules" }),
          /* @__PURE__ */ jsxs(InlineGrid, { columns: 2, gap: HorizontalGap, children: [
            /* @__PURE__ */ jsx(Box, { id: "minProducts", children: /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Minimum products to select",
                type: "number",
                helpText: "Customers must select at least this number of products on this step.",
                autoComplete: "off",
                inputMode: "numeric",
                name: `minProducts`,
                min: 1,
                max: maxProducts,
                value: minProducts.toString(),
                onChange: (value) => {
                  setMinProducts(Number(value));
                },
                error: minProducts < 1 ? "Min products must be greater than 0" : ""
              }
            ) }),
            /* @__PURE__ */ jsx(Box, { id: "maxProducts", children: /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Maximum products to select",
                helpText: "Customers can select up to this number of products on this step.",
                type: "number",
                autoComplete: "off",
                inputMode: "numeric",
                name: `maxProducts`,
                min: minProducts > 0 ? minProducts : 1,
                value: maxProducts.toString(),
                onChange: (value) => {
                  setMaxProducts(Number(value));
                },
                error: maxProducts < minProducts ? "Max products must be greater than or equal to min products" : ""
              }
            ) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Index$p, { onClick: handleNextBtnHandler })
  ] }) });
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$n,
  default: Index$n,
  loader: loader$t
}, Symbol.toStringTag, { value: "Module" }));
const loader$s = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  console.log("I'm on stepNum.product loader");
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const stepData = await bundleBuilderStepRepository.getStepByBundleIdAndStepNumber(Number(params.bundleid), Number(params.stepnum), session.shop);
  if (!stepData) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  return json(new JsonData(true, "success", "Step data was loaded", [], stepData));
};
const action$m = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  const formData = await request.formData();
  const action2 = formData.get("action");
  const bundleId = params.bundleid;
  const stepNum = params.stepnum;
  console.log("I'm on stepnum", action2);
  if (!bundleId || !stepNum) {
    return json(
      {
        ...new JsonData(false, "error", "There was an error with your request", [
          {
            fieldId: "bundleId",
            field: "Bundle Id",
            message: "Bundle Id is missing."
          },
          {
            fieldId: "stepNum",
            field: "Step Number",
            message: "Step Number is missing."
          }
        ])
      },
      { status: 400 }
    );
  }
  switch (action2) {
    case "deleteStep": {
      try {
        const bundleStep = await bundleBuilderStepRepository.getStepByBundleIdAndStepNumber(Number(params.bundleid), Number(params.stepnum), session.shop);
        if (!bundleStep) {
          throw new Error("Step not found");
        }
        await bundleBuilderStepRepository.deleteStepByBundleBuilderIdAndStepNumber(Number(params.bundleid), Number(params.stepnum));
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(false, "error", "There was an error with trying to delete the step")
          },
          { status: 400 }
        );
      }
      const url = new URL(request.url);
      if (url.searchParams.has("redirect") && url.searchParams.get("redirect") === "true") {
        return redirect2(`/app/edit-bundle-builder/${params.bundleid}`);
      }
      const cacheKeyService = new ApiCacheKeyService(session.shop);
      await Promise.all([
        ApiCacheService.multiKeyDelete(await cacheKeyService.getAllStepsKeys(params.bundleid)),
        ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid))
      ]);
      return json({
        ...new JsonData(true, "success", "Step was deleted")
      });
    }
    case "duplicateStep": {
      const canAddMoreSteps = await bundleBuilderStepsService.canAddMoreSteps(Number(params.bundleid), user);
      if (!canAddMoreSteps.ok) {
        return json(canAddMoreSteps, { status: 400 });
      }
      try {
        let stepToDuplicate = await bundleBuilderStepRepository.getStepByBundleIdAndStepNumber(
          Number(params.bundleid),
          Number(params.stepnum),
          session.shop
        );
        if (!stepToDuplicate) {
          return json(
            {
              ...new JsonData(false, "error", "Thre was an error with your request", [
                {
                  fieldId: "stepId",
                  field: "Step Id",
                  message: "Bundle step with the entered 'stepId' doesn't exist."
                }
              ])
            },
            { status: 400 }
          );
        }
        if (stepToDuplicate.stepType === StepType.PRODUCT) {
          await bundleBuilderProductStepService.duplicateStep(Number(bundleId), stepToDuplicate.id);
        } else if (stepToDuplicate.stepType === StepType.CONTENT) {
          await bundleBuilderContentStepService.duplicateStep(Number(bundleId), stepToDuplicate.id);
        }
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await Promise.all([
          ApiCacheService.multiKeyDelete(await cacheKeyService.getAllStepsKeys(params.bundleid)),
          ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid))
        ]);
        return json({
          ...new JsonData(true, "success", "Step was duplicated")
        });
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(false, "error", "Error while duplicating a step")
          },
          { status: 400 }
        );
      }
    }
    case "updateStep": {
      const stepData = JSON.parse(formData.get("stepData"));
      const errors = [];
      const basicErrors = bundleBuilderStepService.checkIfErrorsInStepData(stepData);
      errors.push(...basicErrors);
      if (stepData.stepType === StepType.PRODUCT) {
        const stepSpecificErrors = bundleBuilderProductStepService.checkIfErrorsInStepData(stepData);
        errors.push(...stepSpecificErrors);
      } else if (stepData.stepType === StepType.CONTENT) {
        const stepSpecificErrors = bundleBuilderContentStepService.checkIfErrorsInStepData(stepData);
        errors.push(...stepSpecificErrors);
      }
      if (errors.length > 0) {
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request", errors, stepData)
          },
          { status: 400 }
        );
      }
      try {
        if (stepData.stepType === StepType.PRODUCT) {
          await bundleBuilderProductStepService.updateStep(stepData);
        } else if (stepData.stepType === StepType.CONTENT) {
          await bundleBuilderContentStepService.updateStep(stepData);
        }
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await Promise.all([
          ApiCacheService.singleKeyDelete(cacheKeyService.getStepKey(stepData.stepNumber.toString(), params.bundleid)),
          ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid))
        ]);
        return redirect2(`/app/edit-bundle-builder/${params.bundleid}/steps/${params.stepnum}/${stepData.stepType === StepType.PRODUCT ? "product" : "content"}`);
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request")
          },
          { status: 400 }
        );
      }
    }
    default:
      return json(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything")
        },
        { status: 200 }
      );
  }
};
function Index$m() {
  const nav = useNavigation();
  const isLoading = nav.state === "loading";
  const isSubmitting = nav.state === "submitting";
  const navigate = useNavigate();
  const params = useParams();
  const loaderData = useLoaderData();
  const stepData = loaderData.data;
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading || isSubmitting ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true }) : /* @__PURE__ */ jsx(
    Page,
    {
      titleMetadata: stepData.stepType === "PRODUCT" ? /* @__PURE__ */ jsx(Badge, { tone: "warning", children: "Product step" }) : /* @__PURE__ */ jsx(Badge, { tone: "magic", children: "Content step" }),
      backAction: {
        content: "Products",
        onAction: async () => {
          await shopify.saveBar.leaveConfirmation();
          navigate(`/app/edit-bundle-builder/${params.bundleid}/builder`);
        }
      },
      title: `Edit step: ${stepData.stepNumber}`,
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
        /* @__PURE__ */ jsx(Outlet, {}),
        /* @__PURE__ */ jsxs(FooterHelp, { children: [
          "Are you stuck? ",
          /* @__PURE__ */ jsx(Link, { to: "/app/help", children: "Get help" }),
          " from us, or ",
          /* @__PURE__ */ jsx(Link, { to: "/app/feature-request", children: "suggest new features" }),
          "."
        ] })
      ] })
    }
  ) });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$m,
  default: Index$m,
  loader: loader$s
}, Symbol.toStringTag, { value: "Module" }));
const loader$r = async ({ request, params }) => {
  await authenticate.admin(request);
  const bundleSettings = await prisma.bundleSettings.findUnique({
    where: {
      bundleBuilderId: Number(params.bundleid)
    }
  });
  if (!bundleSettings) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  return json(
    new JsonData(true, "success", "Bundle settings succesfuly retrieved", [], bundleSettings),
    { status: 200 }
  );
};
const action$l = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const formData = await request.formData();
  const bundleSettings = JSON.parse(formData.get("bundleSettings"));
  try {
    const result = await prisma.bundleSettings.update({
      where: {
        bundleBuilderId: Number(params.bundleid)
      },
      data: {
        skipTheCart: bundleSettings.skipTheCart,
        allowBackNavigation: bundleSettings.allowBackNavigation,
        showOutOfStockProducts: bundleSettings.showOutOfStockProducts
      }
    });
    if (!result) {
      throw new Error("Failed to update bundle settings");
    }
    const cacheKeyService = new ApiCacheKeyService(session.shop);
    await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid));
    const url = new URL(request.url);
    if (url.searchParams.has("redirect")) {
      return redirect2(url.searchParams.get("redirect"));
    }
    return redirect2(`/app`);
  } catch (error) {
    console.error(error);
    throw new Response(null, {
      status: 404,
      statusText: "Settings not found"
    });
  }
};
function Index$l() {
  const navigate = useNavigate();
  const nav = useNavigation();
  const shopify2 = useAppBridge();
  const isLoading = nav.state != "idle";
  const serverSettings = useLoaderData().data;
  const [settingsState, setSetttingsState] = useState(serverSettings);
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : (
    // Bundle settings page
    /* @__PURE__ */ jsx(
      Page,
      {
        title: `Bundle settings`,
        subtitle: "Edit settings only for this bundle.",
        backAction: {
          content: "Products",
          onAction: async () => {
            await shopify2.saveBar.leaveConfirmation();
            navigate(-1);
          }
        },
        children: /* @__PURE__ */ jsxs(Form, { method: "POST", "data-discard-confirmation": true, "data-save-bar": true, children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "bundleSettings", value: JSON.stringify(settingsState) }),
          /* @__PURE__ */ jsxs(BlockStack, { gap: BigGapBetweenSections, children: [
            /* @__PURE__ */ jsxs(InlineGrid, { columns: { xs: "1fr", md: "3fr 4fr" }, gap: "400", children: [
              /* @__PURE__ */ jsx(Box, { as: "section", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
                /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Navigation" }),
                /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", children: "Navigation consists of navigating between individual bundle steps, and navigating after the customer finishes building their bundle." })
              ] }) }),
              /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
                /* @__PURE__ */ jsx(
                  ChoiceList,
                  {
                    title: "Navigation",
                    name: `allowBackNavigation`,
                    allowMultiple: true,
                    choices: [
                      {
                        label: /* @__PURE__ */ jsxs(InlineStack, { children: [
                          /* @__PURE__ */ jsx(Text, { as: "p", children: "Allow customers to go back on steps" }),
                          /* @__PURE__ */ jsx(
                            Tooltip,
                            {
                              width: "wide",
                              content: "If this is not selected, customers won't be able to use the 'back' button to go back on steps.",
                              children: /* @__PURE__ */ jsx(Icon, { source: QuestionCircleIcon })
                            }
                          )
                        ] }),
                        value: "true"
                      }
                    ],
                    selected: settingsState.allowBackNavigation ? ["true"] : [],
                    onChange: (value) => {
                      setSetttingsState((prevSettings) => {
                        return {
                          ...prevSettings,
                          allowBackNavigation: value[0] === "true"
                        };
                      });
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  ChoiceList,
                  {
                    title: "Cart",
                    allowMultiple: true,
                    name: `skipTheCart`,
                    choices: [
                      {
                        label: /* @__PURE__ */ jsxs(InlineStack, { children: [
                          /* @__PURE__ */ jsx(Text, { as: "p", children: "Skip the cart and go to checkout directly" }),
                          /* @__PURE__ */ jsx(
                            Tooltip,
                            {
                              width: "wide",
                              content: "Without this option selected, all the customer will be redirected to the cart page after they finish building their bundle.",
                              children: /* @__PURE__ */ jsx(Icon, { source: QuestionCircleIcon })
                            }
                          )
                        ] }),
                        value: "true"
                      }
                    ],
                    selected: settingsState.skipTheCart ? ["true"] : [],
                    onChange: (value) => {
                      setSetttingsState((prevSettings) => {
                        return {
                          ...prevSettings,
                          skipTheCart: value[0] === "true"
                        };
                      });
                    }
                  }
                )
              ] }) })
            ] }),
            /* @__PURE__ */ jsx(Divider, {}),
            /* @__PURE__ */ jsxs(InlineGrid, { columns: { xs: "1fr", md: "3fr 4fr" }, gap: "400", children: [
              /* @__PURE__ */ jsx(Box, { as: "section", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
                /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Products" }),
                /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", children: "Change settings on how products are displayed and used." })
              ] }) }),
              /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(BlockStack, { gap: GapBetweenSections, children: /* @__PURE__ */ jsx(
                ChoiceList,
                {
                  title: "Products",
                  allowMultiple: true,
                  name: `showOutOfStockProducts`,
                  choices: [
                    {
                      label: /* @__PURE__ */ jsxs(InlineStack, { children: [
                        /* @__PURE__ */ jsx(Text, { as: "p", children: "Show “out of stock” and unavailable products" }),
                        /* @__PURE__ */ jsx(
                          Tooltip,
                          {
                            width: "wide",
                            content: "By default, only products that have at least one variant that's in stock at the time of purchase will be displayed. If this is selected, all 'out of stock' products will be visible, but customers won't be able to add them to their bundles.",
                            children: /* @__PURE__ */ jsx(Icon, { source: QuestionCircleIcon })
                          }
                        )
                      ] }),
                      value: "true"
                    }
                  ],
                  selected: settingsState.showOutOfStockProducts ? ["true"] : [],
                  onChange: (value) => {
                    setSetttingsState((prevSettings) => {
                      return {
                        ...prevSettings,
                        showOutOfStockProducts: value[0] === "true"
                      };
                    });
                  }
                }
              ) }) })
            ] }),
            /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
              /* @__PURE__ */ jsx(BlockStack, { inlineAlign: "end", children: /* @__PURE__ */ jsx(Button, { variant: "primary", submit: true, children: "Save" }) }),
              /* @__PURE__ */ jsxs(FooterHelp, { children: [
                "This settings only apply to this bundle. Edit ",
                /* @__PURE__ */ jsx(Link, { to: "/app/global-settings", children: "global settings" }),
                " to apply changes to all bundles."
              ] })
            ] })
          ] })
        ] })
      }
    )
  ) });
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$l,
  default: Index$l,
  loader: loader$r
}, Symbol.toStringTag, { value: "Module" }));
const tableWrapper$8 = "_tableWrapper_59idc_1";
const loadingTable$8 = "_loadingTable_59idc_5";
const hide$8 = "_hide_59idc_18";
const fadeIn$3 = "_fadeIn_59idc_22";
const animateright$3 = "_animateright_59idc_1";
const styles$d = {
  tableWrapper: tableWrapper$8,
  loadingTable: loadingTable$8,
  hide: hide$8,
  fadeIn: fadeIn$3,
  animateright: animateright$3
};
const loader$q = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  if (!params.bundleid) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle id is required"
    });
  }
  const bundleBuilder = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));
  if (!bundleBuilder) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle with this id not found"
    });
  }
  return json(new JsonData(true, "success", "Loader response", [], bundleBuilder), { status: 200 });
};
const action$k = async ({ request, params }) => {
  return json(
    {
      ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
    },
    { status: 200 }
  );
};
function Index$k() {
  const navigate = useNavigate();
  const params = useParams();
  const [activeBtnOption, setActiveBtnOption] = useState("multiStep");
  const handleNextBtnHandler = () => {
    navigate(`/app/create-bundle-builder/${params.bundleid}/step-2?onboarding=true&stepIndex=2&stepNumber=1&multiStep=${activeBtnOption === "multiStep" ? "true" : "false"}`);
  };
  return /* @__PURE__ */ jsx("div", { className: styles$d.fadeIn, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "1200", inlineAlign: "center", children: [
    /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", alignment: "center", children: "How many steps do you want your bundle builder to have?" }),
    /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, inlineAlign: "center", children: [
      /* @__PURE__ */ jsxs(ButtonGroup, { variant: "segmented", children: [
        /* @__PURE__ */ jsx(Button, { pressed: activeBtnOption === "singleStep", size: "large", onClick: () => setActiveBtnOption("singleStep"), children: "One step" }),
        /* @__PURE__ */ jsx(Button, { pressed: activeBtnOption === "multiStep", size: "large", onClick: () => setActiveBtnOption("multiStep"), children: "Multiple steps" })
      ] }),
      /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", children: "On each step, your customers can select products or input their content." })
    ] }),
    /* @__PURE__ */ jsx(Index$p, { onClick: handleNextBtnHandler })
  ] }) });
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$k,
  default: Index$k,
  loader: loader$q
}, Symbol.toStringTag, { value: "Module" }));
const tableWrapper$7 = "_tableWrapper_1tdlw_1";
const loadingTable$7 = "_loadingTable_1tdlw_5";
const hide$7 = "_hide_1tdlw_18";
const styles$c = {
  tableWrapper: tableWrapper$7,
  loadingTable: loadingTable$7,
  hide: hide$7
};
const loader$p = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  if (!params.bundleid) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle id is required"
    });
  }
  const bundleBuilder = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));
  if (!bundleBuilder) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle with this id not found"
    });
  }
  const url = new URL(request.url);
  const multiStep = url.searchParams.get("multiStep") === "true";
  return json(new JsonData(true, "success", "Loader response", [], { bundleBuilder, multiStep }), { status: 200 });
};
const action$j = async ({ request, params }) => {
  return json(
    {
      ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
    },
    { status: 200 }
  );
};
function Index$j() {
  const submit = useSubmit();
  const params = useParams();
  const loaderData = useLoaderData();
  const handleNextBtnHandler = () => {
    if (stepProducts.length === 0 || stepProducts.length < minProducts) {
      setProductSelectionActivated(true);
      return;
    }
    if (minProducts < 1 || maxProducts < minProducts) {
      setProductSelectionActivated(true);
      return;
    }
    if (!stepTitle) {
      setProductSelectionActivated(true);
      return;
    }
    const form2 = new FormData();
    const stepData = {
      title: stepTitle,
      description: "",
      stepNumber: 1,
      stepType: "PRODUCT",
      productInput: {
        allowProductDuplicates: false,
        showProductPrice: true,
        minProductsOnStep: minProducts,
        maxProductsOnStep: maxProducts,
        products: stepProducts
      }
    };
    form2.append("stepData", JSON.stringify(stepData));
    form2.append("action", "addProductStep");
    submit(form2, {
      method: "POST",
      action: `/app/edit-bundle-builder/${params.bundleid}/steps?stepNumber=2&onboarding=true&multiStep=${loaderData.data.multiStep}`,
      navigate: true
    });
  };
  const [productSelectionActivated, setProductSelectionActivated] = useState(false);
  const [stepTitle, setStepTitle] = useState();
  const [stepProducts, setStepProducts] = useState([]);
  const [minProducts, setMinProducts] = useState(1);
  const [maxProducts, setMaxProducts] = useState(3);
  const updateSelectedProducts = (products) => {
    setProductSelectionActivated(true);
    setStepProducts(products);
  };
  return /* @__PURE__ */ jsx("div", { className: styles$c.fadeIn, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "1000", inlineAlign: "center", children: [
    /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
      loaderData.data.multiStep ? /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", alignment: "center", children: "Enter the title for the first step" }) : /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", alignment: "center", children: "Enter the title for this step" }),
      /* @__PURE__ */ jsx(
        TextField,
        {
          label: "Step title",
          labelHidden: true,
          error: stepTitle === "" ? "Step title is required" : "",
          type: "text",
          name: `stepTitle`,
          value: stepTitle,
          helpText: "Customers will see this title when they build a bundle.",
          onChange: (newTitle) => {
            setStepTitle(newTitle);
          },
          autoComplete: "off"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(BlockStack, { gap: "600", inlineAlign: "center", children: [
      /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", alignment: "center", children: "Select the products you want to display on this step" }),
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", tone: "subdued", alignment: "center", children: "This is a product step, where customers can choose products to add to their bundle." })
      ] }),
      /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
        /* @__PURE__ */ jsx(Index$r, { onBoarding: true, stepId: void 0, selectedProducts: stepProducts, updateSelectedProducts }),
        /* @__PURE__ */ jsx(
          InlineError,
          {
            message: (stepProducts.length === 0 || stepProducts.length < minProducts) && productSelectionActivated ? `Please select at least ${minProducts} products.` : "",
            fieldID: "products"
          }
        ),
        /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Product rules" }),
          /* @__PURE__ */ jsxs(InlineGrid, { columns: 2, gap: HorizontalGap, children: [
            /* @__PURE__ */ jsx(Box, { id: "minProducts", children: /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Minimum products to select",
                type: "number",
                helpText: "Customers must select at least this number of products on this step.",
                autoComplete: "off",
                inputMode: "numeric",
                name: `minProducts`,
                min: 1,
                max: maxProducts,
                value: minProducts.toString(),
                onChange: (value) => {
                  setMinProducts(Number(value));
                },
                error: minProducts < 1 ? "Min products must be greater than 0" : ""
              }
            ) }),
            /* @__PURE__ */ jsx(Box, { id: "maxProducts", children: /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Maximum products to select",
                helpText: "Customers can select up to this number of products on this step.",
                type: "number",
                autoComplete: "off",
                inputMode: "numeric",
                name: `maxProducts`,
                min: minProducts > 0 ? minProducts : 1,
                value: maxProducts.toString(),
                onChange: (value) => {
                  setMaxProducts(Number(value));
                },
                error: maxProducts < minProducts ? "Max products must be greater than or equal to min products" : ""
              }
            ) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Index$p, { onClick: handleNextBtnHandler })
  ] }) });
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$j,
  default: Index$j,
  loader: loader$p
}, Symbol.toStringTag, { value: "Module" }));
const tableWrapper$6 = "_tableWrapper_59idc_1";
const loadingTable$6 = "_loadingTable_59idc_5";
const hide$6 = "_hide_59idc_18";
const fadeIn$2 = "_fadeIn_59idc_22";
const animateright$2 = "_animateright_59idc_1";
const styles$b = {
  tableWrapper: tableWrapper$6,
  loadingTable: loadingTable$6,
  hide: hide$6,
  fadeIn: fadeIn$2,
  animateright: animateright$2
};
const loader$o = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  if (!params.bundleid) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle id is required"
    });
  }
  const bundleBuilder = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));
  if (!bundleBuilder) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle with this id not found"
    });
  }
  const url = new URL(request.url);
  const multiStep = url.searchParams.get("multiStep") === "true";
  return json(new JsonData(true, "success", "Loader response", [], { bundleBuilder, multiStep }), { status: 200 });
};
const action$i = async ({ request, params }) => {
  await authenticate.admin(request);
  return json(
    {
      ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
    },
    { status: 200 }
  );
};
function Index$i() {
  const params = useParams();
  const [activeBtnOption, setActiveBtnOption] = useState("PRODUCT");
  return /* @__PURE__ */ jsx("div", { className: styles$b.fadeIn, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "1000", inlineAlign: "center", children: [
    /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", alignment: "center", children: "Select the type of the second step" }),
    /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, inlineAlign: "center", children: [
      /* @__PURE__ */ jsxs(ButtonGroup, { variant: "segmented", children: [
        /* @__PURE__ */ jsx(Button, { pressed: activeBtnOption === "PRODUCT", size: "large", onClick: () => setActiveBtnOption("PRODUCT"), children: "Product step" }),
        /* @__PURE__ */ jsx(Button, { pressed: activeBtnOption === "CONTENT", size: "large", onClick: () => setActiveBtnOption("CONTENT"), children: "Content step" })
      ] }),
      /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", children: activeBtnOption === "PRODUCT" ? "Customers will be able to select products on this step." : "Customers will be able to enter content (text, image, etc) on this step." })
    ] }),
    /* @__PURE__ */ jsx(
      Index$p,
      {
        onClick: () => {
        },
        url: `/app/create-bundle-builder/${params.bundleid}/step-4-${activeBtnOption === "CONTENT" ? "content" : "product"}?stepNumber=3&stepIndex=4&onboarding=true`
      }
    )
  ] }) });
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$i,
  default: Index$i,
  loader: loader$o
}, Symbol.toStringTag, { value: "Module" }));
const tableWrapper$5 = "_tableWrapper_59idc_1";
const loadingTable$5 = "_loadingTable_59idc_5";
const hide$5 = "_hide_59idc_18";
const fadeIn$1 = "_fadeIn_59idc_22";
const animateright$1 = "_animateright_59idc_1";
const styles$a = {
  tableWrapper: tableWrapper$5,
  loadingTable: loadingTable$5,
  hide: hide$5,
  fadeIn: fadeIn$1,
  animateright: animateright$1
};
var BundleDiscountTypeClient = /* @__PURE__ */ ((BundleDiscountTypeClient2) => {
  BundleDiscountTypeClient2["FIXED"] = "FIXED";
  BundleDiscountTypeClient2["PERCENTAGE"] = "PERCENTAGE";
  BundleDiscountTypeClient2["NO_DISCOUNT"] = "NO_DISCOUNT";
  return BundleDiscountTypeClient2;
})(BundleDiscountTypeClient || {});
const loader$n = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  if (!params.bundleid) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle id is required"
    });
  }
  const bundleBuilder = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));
  if (!bundleBuilder) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle with this id not found"
    });
  }
  return json(new JsonData(true, "success", "Loader response", [], bundleBuilder), { status: 200 });
};
const action$h = async ({ request, params }) => {
  return json(
    {
      ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
    },
    { status: 200 }
  );
};
function Index$h() {
  const submit = useSubmit();
  const params = useParams();
  const loaderData = useLoaderData();
  const [discountType, setDiscountType] = useState(loaderData.data.discountType);
  const [discountValue, setDiscountValue] = useState(loaderData.data.discountValue);
  const [errors, setErrors] = useState([]);
  const handleNextBtnHandler = () => {
    if (discountValue <= 0 || discountValue >= 100) {
      setErrors([
        {
          fieldId: "discountValue",
          field: "discountValue",
          message: "Discount value should be between 0 and 100"
        }
      ]);
      return;
    }
    const form2 = new FormData();
    form2.append("action", "updateDiscount");
    form2.append("discountType", discountType);
    form2.append("discountValue", discountValue.toString());
    submit(form2, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/builder?stepNumber=5&onboarding=true` });
  };
  return /* @__PURE__ */ jsx("div", { className: styles$a.fadeIn, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "1000", inlineAlign: "center", children: [
    /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
      /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingLg", alignment: "center", children: "Enter bundle discount" }),
      /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", tone: "subdued", alignment: "center", children: "Customers are more likely to buy a bundle if they know they are getting a discount." })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { width: "300px" }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: LargeGapBetweenSections, children: [
      /* @__PURE__ */ jsx(
        Select,
        {
          label: "Discount Type",
          name: "bundleDiscountType",
          options: [
            {
              label: "Percentage (e.g. 25% off)",
              value: BundleDiscountTypeClient.PERCENTAGE
            },
            {
              label: "Fixed (e.g. 10$ off)",
              value: BundleDiscountTypeClient.FIXED
            },
            {
              label: "No discount",
              value: BundleDiscountTypeClient.NO_DISCOUNT
            }
          ],
          value: discountType,
          onChange: (newDiscountType) => {
            setDiscountType(newDiscountType);
          }
        }
      ),
      /* @__PURE__ */ jsx(
        TextField,
        {
          label: "Discount amount",
          type: "number",
          autoComplete: "off",
          inputMode: "numeric",
          disabled: discountType === "NO_DISCOUNT",
          name: `discountValue`,
          prefix: discountType === BundleDiscountTypeClient.PERCENTAGE ? "%" : "$",
          min: 0,
          max: 100,
          value: discountValue.toString(),
          error: errors?.find((err) => err.fieldId === "discountValue")?.message,
          onChange: (newDiscountValue) => {
            setDiscountValue(Number(newDiscountValue));
          }
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(Index$p, { onClick: handleNextBtnHandler })
  ] }) });
}
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$h,
  default: Index$h,
  loader: loader$n
}, Symbol.toStringTag, { value: "Module" }));
const tableWrapper$4 = "_tableWrapper_59idc_1";
const loadingTable$4 = "_loadingTable_59idc_5";
const hide$4 = "_hide_59idc_18";
const fadeIn = "_fadeIn_59idc_22";
const animateright = "_animateright_59idc_1";
const styles$9 = {
  tableWrapper: tableWrapper$4,
  loadingTable: loadingTable$4,
  hide: hide$4,
  fadeIn,
  animateright
};
const loader$m = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  if (!params.bundleid) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle id is required"
    });
  }
  const bundleBuilder = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));
  if (!bundleBuilder) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle with this id not found"
    });
  }
  const bundleBuilderPageUrl = `${user.primaryDomain}/pages/${bundleBuilder.bundleBuilderPageHandle}`;
  return json(new JsonData(true, "success", "Loader response", [], { bundleBuilder, bundleBuilderPageUrl }), { status: 200 });
};
const action$g = async ({ request, params }) => {
  return json(
    {
      ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
    },
    { status: 200 }
  );
};
function Index$g() {
  const params = useParams();
  const loaderData = useLoaderData();
  return /* @__PURE__ */ jsx("div", { className: styles$9.fadeIn, children: /* @__PURE__ */ jsx(BlockStack, { gap: "1000", inlineAlign: "center", children: /* @__PURE__ */ jsx(Banner, { title: "Congratulations! You have successfully created your first bundle.", tone: "success", onDismiss: () => {
  }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
    /* @__PURE__ */ jsx(Divider, { borderColor: "transparent", borderWidth: "100" }),
    /* @__PURE__ */ jsxs(BlockStack, { gap: LargeGapBetweenSections, children: [
      /* @__PURE__ */ jsx(Text, { as: "p", children: "Continue editing your bundle or check it out live on your store." }),
      /* @__PURE__ */ jsxs(InlineGrid, { gap: GapBetweenSections, columns: 2, children: [
        /* @__PURE__ */ jsx(Button, { url: `/app/edit-bundle-builder/${params.bundleid}/builder`, icon: EditIcon, children: "Edit bundle" }),
        /* @__PURE__ */ jsx(Button, { variant: "primary", icon: ExternalIcon, url: `${loaderData.data.bundleBuilderPageUrl}`, target: "_blank", children: "See live on your store" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Divider, { borderColor: "transparent", borderWidth: "100" })
  ] }) }) }) });
}
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$g,
  default: Index$g,
  loader: loader$m
}, Symbol.toStringTag, { value: "Module" }));
var BundlePricingClient = /* @__PURE__ */ ((BundlePricingClient2) => {
  BundlePricingClient2["FIXED"] = "FIXED";
  BundlePricingClient2["CALCULATED"] = "CALCULATED";
  return BundlePricingClient2;
})(BundlePricingClient || {});
const sticky$2 = "_sticky_hjc71_1";
const tableWrapper$3 = "_tableWrapper_hjc71_1";
const loadingTable$3 = "_loadingTable_hjc71_13";
const hide$3 = "_hide_hjc71_26";
const dummyIconPlaceholder$1 = "_dummyIconPlaceholder_hjc71_30";
const tooltipContent$2 = "_tooltipContent_hjc71_37";
const stepTitleContainer$1 = "_stepTitleContainer_hjc71_43";
const styles$8 = {
  sticky: sticky$2,
  tableWrapper: tableWrapper$3,
  loadingTable: loadingTable$3,
  hide: hide$3,
  dummyIconPlaceholder: dummyIconPlaceholder$1,
  tooltipContent: tooltipContent$2,
  stepTitleContainer: stepTitleContainer$1
};
function Index$f({ user, bundleBuilderSteps }) {
  const navigate = useNavigate();
  const nav = useNavigation();
  const shopify2 = useAppBridge();
  const isLoading = nav.state != "idle";
  const params = useParams();
  const fetcher = useFetcher();
  const submit = useSubmit();
  const sortedBundleBuilderSteps = bundleBuilderSteps.sort((a, b) => a.stepNumber - b.stepNumber);
  const checkStepCount = () => {
    if (bundleBuilderSteps.length >= 5) {
      shopify2.modal.show("no-more-steps-modal");
      return false;
    }
    if (user.isDevelopmentStore) {
      return true;
    }
    if (user.activeBillingPlan === "BASIC" && bundleBuilderSteps.length >= 2) {
      shopify2.modal.show("step-limit-modal");
      return false;
    }
    return true;
  };
  const [newStepTitle, setNewStepTitle] = useState();
  const [activeBtnOption, setActiveBtnOption] = useState("PRODUCT");
  const addStep = async () => {
    if (!checkStepCount())
      return;
    shopify2.modal.show("new-step-modal");
  };
  const addStepHandler = () => {
    if (!newStepTitle)
      return;
    const form2 = new FormData();
    if (activeBtnOption === "PRODUCT") {
      const stepData = {
        title: newStepTitle,
        description: "",
        stepNumber: bundleBuilderSteps.length + 1,
        stepType: "PRODUCT",
        productInput: {
          minProducts: 0,
          maxProducts: 0
        }
      };
      form2.append("stepData", JSON.stringify(stepData));
      form2.append("action", "addProductStep");
    } else {
      const stepData = {
        title: newStepTitle,
        description: "",
        stepNumber: bundleBuilderSteps.length + 1,
        stepType: "CONTENT"
      };
      form2.append("stepData", JSON.stringify(stepData));
      form2.append("action", "addContentStep");
    }
    submit(form2, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps` });
    shopify2.modal.hide("new-step-modal");
  };
  const duplicateStep = async (stepNumber) => {
    if (!checkStepCount())
      return;
    const form2 = new FormData();
    form2.append("action", "duplicateStep");
    fetcher.submit(form2, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps/${stepNumber}` });
  };
  const handeleStepDelete = async (stepNumber) => {
    const form2 = new FormData();
    form2.append("action", "deleteStep");
    fetcher.submit(form2, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps/${stepNumber}` });
  };
  const handleStepRearange = async (stepId, direction) => {
    const form2 = new FormData();
    form2.append("action", direction);
    form2.append("stepId", stepId.toString());
    fetcher.submit(form2, { method: "POST", action: `/app/edit-bundle-builder/${params.bundleid}/steps` });
  };
  const handleNavigationOnUnsavedChanges = async (navPath) => {
    await shopify2.saveBar.leaveConfirmation();
    navigate(navPath);
  };
  useEffect(() => {
  }, [fetcher.state]);
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Modal, { id: "step-limit-modal", children: [
      /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
        /* @__PURE__ */ jsx(Text, { as: "p", children: "You are on the 'Basic' plan which only allows you to create up to 2 steps for each bundle." }),
        /* @__PURE__ */ jsxs(Text, { as: "p", variant: "headingSm", children: [
          "If you want to create more steps, go to ",
          /* @__PURE__ */ jsx(Link, { to: "/app/billing", children: "billing" }),
          " and upgrade to paid plan."
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TitleBar, { title: "Maximum steps reached", children: /* @__PURE__ */ jsx("button", { variant: "primary", type: "button", onClick: () => shopify2.modal.hide("step-limit-modal"), children: "Close" }) })
    ] }),
    /* @__PURE__ */ jsxs(Modal, { id: "no-more-steps-modal", children: [
      /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsx(Text, { as: "p", children: "You can't add more than 5 steps for one bundle." }) }),
      /* @__PURE__ */ jsx(TitleBar, { title: "Maximum steps reached", children: /* @__PURE__ */ jsx("button", { variant: "primary", type: "button", onClick: () => shopify2.modal.hide("no-more-steps-modal"), children: "Close" }) })
    ] }),
    /* @__PURE__ */ jsxs(Modal, { id: "new-step-modal", children: [
      /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
        /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
          /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingSm", children: "Enter the title of your new step" }),
          /* @__PURE__ */ jsx(
            TextField,
            {
              label: "Title",
              labelHidden: true,
              autoComplete: "off",
              inputMode: "text",
              name: "bundleTitle",
              helpText: "Customers will see this title when they build a bundle.",
              value: newStepTitle,
              error: newStepTitle === "" ? "Please enter a title" : void 0,
              onChange: (newTitile) => {
                setNewStepTitle(newTitile);
              },
              type: "text"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, align: "center", inlineAlign: "center", children: [
          /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingSm", children: "Select the type of step you want to create." }),
          /* @__PURE__ */ jsxs(ButtonGroup, { variant: "segmented", children: [
            /* @__PURE__ */ jsx(Button, { pressed: activeBtnOption === "PRODUCT", size: "large", onClick: () => setActiveBtnOption("PRODUCT"), children: "Product step" }),
            /* @__PURE__ */ jsx(Button, { pressed: activeBtnOption === "CONTENT", size: "large", onClick: () => setActiveBtnOption("CONTENT"), children: "Content step" })
          ] }),
          /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", children: activeBtnOption === "PRODUCT" ? "Customers will be able to select products on this step." : "Customers will be able to enter content (text, image, etc) on this step." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TitleBar, { title: "New step", children: /* @__PURE__ */ jsx("button", { variant: "primary", type: "button", onClick: addStepHandler, disabled: isLoading, children: "Create" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { id: styles$8.tableWrapper, children: [
      /* @__PURE__ */ jsx("div", { className: fetcher.state !== "idle" ? styles$8.loadingTable : styles$8.hide, children: /* @__PURE__ */ jsx(Spinner, { accessibilityLabel: "Spinner example", size: "large" }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { children: [
        /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "Bundle steps" }),
          /* @__PURE__ */ jsx(Button, { icon: PlusIcon, size: "slim", variant: "primary", onClick: addStep, children: "Add step" })
        ] }),
        sortedBundleBuilderSteps.length > 0 ? /* @__PURE__ */ jsx(
          DataTable,
          {
            hoverable: true,
            columnContentTypes: ["text", "text", "text", "text", "text"],
            headings: ["Step", "Title", "Type", "Rearange", "Actions"],
            rows: sortedBundleBuilderSteps.map((step) => {
              return [
                step.stepNumber,
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    onClick: handleNavigationOnUnsavedChanges.bind(
                      null,
                      `/app/edit-bundle-builder/${params.bundleid}/steps/${step.stepNumber}/${step.stepType === "PRODUCT" ? "product" : "content"}`
                    ),
                    to: "#",
                    children: /* @__PURE__ */ jsx("div", { className: styles$8.stepTitleContainer, children: /* @__PURE__ */ jsx(Text, { as: "p", tone: "base", children: step.title }) })
                  }
                ),
                step.stepType === "PRODUCT" ? /* @__PURE__ */ jsx(Badge, { tone: "warning", children: "Product step" }) : /* @__PURE__ */ jsx(Badge, { tone: "magic", children: "Content step" }),
                /* @__PURE__ */ jsx(ButtonGroup, { children: /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", blockAlign: "stretch", children: [
                  step.stepNumber !== sortedBundleBuilderSteps.length ? /* @__PURE__ */ jsx(
                    Button,
                    {
                      icon: ArrowDownIcon,
                      size: "slim",
                      variant: "plain",
                      onClick: handleStepRearange.bind(null, step.id, "moveStepDown")
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: styles$8.dummyIconPlaceholder, children: " " }),
                  step.stepNumber !== 1 && /* @__PURE__ */ jsx(Button, { icon: ArrowUpIcon, size: "slim", variant: "plain", onClick: handleStepRearange.bind(null, step.id, "moveStepUp") })
                ] }) }),
                /* @__PURE__ */ jsxs(ButtonGroup, { children: [
                  /* @__PURE__ */ jsx(Button, { icon: DeleteIcon, variant: "secondary", tone: "critical", onClick: handeleStepDelete.bind(null, step.stepNumber) }),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      icon: PageAddIcon,
                      variant: "secondary",
                      onClick: () => {
                        duplicateStep(step.stepNumber);
                      },
                      children: "Duplicate"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      icon: EditIcon,
                      variant: "primary",
                      onClick: handleNavigationOnUnsavedChanges.bind(
                        null,
                        `/app/edit-bundle-builder/${params.bundleid}/steps/${step.stepNumber}/${step.stepType === "PRODUCT" ? "product" : "content"}`
                      ),
                      children: "Edit"
                    }
                  )
                ] })
              ];
            })
          }
        ) : /* @__PURE__ */ jsx(
          EmptyState,
          {
            heading: "Let’s create the first step for your customers to take!",
            action: {
              content: "Create step",
              icon: PlusIcon,
              onAction: addStep
            },
            fullWidth: true,
            image: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png",
            children: /* @__PURE__ */ jsx("p", { children: "Your customers will be able to select products or add content (like text or images) at each step to their bundle." })
          }
        )
      ] }) })
    ] })
  ] }) });
}
class ShopifyBundleBuilderProductRepository {
  async createBundleProduct(admin, productTitle, storeUrl) {
    const response = await admin.graphql(
      `#graphql
              mutation createBundleBuilderProduct($productInput: ProductInput!) {
                productCreate(input: $productInput) {
                  product {
                    id
                    handle
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }`,
      {
        variables: {
          productInput: {
            title: productTitle,
            published: true,
            productType: "Neat Bundle",
            vendor: "Neat Bundles",
            status: "ACTIVE",
            tags: [bundleTagIndentifier],
            descriptionHtml: `<p>This is a dummy product generated by <b>Neat bundles</b> app and must not be deleted or altered.</p>
<p>Neat bundles app creates a dummy product for every bundle you configure in the app. These dummy products are used to make selling bundles easier for you and your customers.</p>`
          }
        }
      }
    );
    const data = await response.json();
    const product = data.data.productCreate;
    if (product.userErrors && product.userErrors.length > 0 || !product.product || !product.product.id) {
      console.log(product.userErrors);
      throw new Error("Failed to create the bundle product.");
    }
    return product.product?.id;
  }
  async deleteBundleBuilderProduct(admin, bundleBuilderProductId) {
    const response = await admin.graphql(
      `#graphql
           mutation deleteProduct($productDeleteInput: ProductDeleteInput!) {
                productDelete(input: $productDeleteInput) {
                    deletedProductId
                }
            }`,
      {
        variables: {
          productDeleteInput: {
            id: bundleBuilderProductId
          }
        }
      }
    );
    const data = await response.json();
    const deletedProduct = data.data.productDelete;
    if (deletedProduct.userErrors && deletedProduct.userErrors.length > 0 || !deletedProduct.deletedProductId) {
      return false;
    }
    return true;
  }
  async updateBundleProductTitle(admin, bundleProductId, newBundleProductTitle) {
    const response = await admin.graphql(
      `#graphql
          mutation updateProductTitle($productInput: ProductUpdateInput!) {
            productUpdate(product: $productInput) {
              product{
                id
              }
              userErrors {
                  field
                  message
                }
            }
          }`,
      {
        variables: {
          productInput: {
            id: bundleProductId,
            title: newBundleProductTitle
          }
        }
      }
    );
    const data = await response.json();
    const product = data.data.productUpdate;
    if (product.userErrors && product.userErrors.length > 0 || !product.product || !product.product.id) {
      return false;
    }
    return true;
  }
  async checkIfProductExists(admin, shopifyProductId) {
    const doesBundleBuilderProductExistResponse = await admin.graphql(
      `#graphql
        query getBundleBuilderProduct($id: ID!) {
            product(id: $id) {
                id
                status
            }
        }`,
      {
        variables: {
          id: shopifyProductId
        }
      }
    );
    const productData = await doesBundleBuilderProductExistResponse.json();
    const doesBundleBuilderProductExist = productData.data.product !== null && productData.data.product.status !== "ARCHIVED";
    return doesBundleBuilderProductExist;
  }
  async getNumberOfProductVariants(admin, shopifyProductId) {
    const response = await admin.graphql(
      `#graphql
        query getProductVariants($id: ID!) {
            product(id: $id) {
                variants(first: 100) {
                    edges {
                        node {
                            id
                        }
                    }
                }
            }
        }`,
      {
        variables: {
          id: shopifyProductId
        }
      }
    );
    const data = await response.json();
    const variants = data.data.product.variants.edges;
    return variants.length;
  }
}
const shopifyBundleBuilderProductRepository = new ShopifyBundleBuilderProductRepository();
const bundleStepBasic = {
  id: true,
  stepNumber: true,
  description: true,
  title: true,
  stepType: true
};
const bundleStepFull = {
  productInput: {
    include: {
      products: true
    }
  },
  contentInputs: true
};
({
  ...bundleStepBasic,
  productInput: {
    include: {
      products: true
    }
  }
});
({
  ...bundleStepBasic,
  contentInputs: true
});
const bundleAndSteps = {
  id: true,
  title: true,
  published: true,
  createdAt: true,
  pricing: true,
  priceAmount: true,
  bundleBuilderPageHandle: true,
  steps: {
    select: {
      title: true,
      stepNumber: true,
      stepType: true
    }
  }
};
const inclBundleFullStepsBasic = {
  steps: {
    select: bundleStepBasic
  }
};
({
  ...bundleAndSteps,
  bundleSettings: {
    include: {}
  }
});
class ShopifyBundleBuilderPageGraphql {
  constructor() {
  }
  async createPage(admin, session, pageTitle) {
    const pageResponse = await admin.graphql(
      `#graphql 
            mutation pageCreate($page: PageCreateInput!) {
                pageCreate(page: $page) {
                    page {
                    # Page fields
                        id
                        handle
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`,
      {
        variables: {
          page: {
            title: pageTitle,
            body: `<div style="display: block"></div>
                        <p style="display: none;">This is a page for displaying the bundle created by Neat bundles app. 
                        Neat bundles creates a page for every bundle you configure in the app. These pages are used to display the bundle to your customers. 
                        You can delete this text or customize this page like every other page using Shopify admin.</p>
        `
          }
        }
      }
    );
    const pageData = (await pageResponse.json()).data;
    const pageCreatePayload = pageData.pageCreate;
    if (pageCreatePayload.userErrors.length > 0) {
      console.log(pageCreatePayload.userErrors);
      throw new Error("Failed to create the bundle builder page");
    }
    const bundleBuilderPage = pageData.pageCreate.page;
    return bundleBuilderPage;
  }
  async createPageWithMetafields(admin, session, pageTitle, bundleBuilderId) {
    const pageResponse = await admin.graphql(
      `#graphql 
            mutation pageCreate($page: PageCreateInput!) {
                pageCreate(page: $page) {
                    page {
                    # Page fields
                        id
                        handle
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`,
      {
        variables: {
          page: {
            title: pageTitle,
            metafields: [
              {
                key: bundlePageKey,
                value: bundleBuilderId.toString(),
                type: bundlePageType,
                namespace: bundlePageNamespace
              }
            ],
            body: `<div style="display: block"></div>
                       <p style="display: none;">This is a page for displaying the bundle created by Neat bundles app. 
                       Neat bundles creates a page for every bundle you configure in the app. These pages are used to display the bundle to your customers. 
                       You can delete this text or customize this page like every other page using Shopify admin.</p>
        `
          }
        }
      }
    );
    const pageData = (await pageResponse.json()).data;
    if (pageData.pageCreate.userErrors.length > 0) {
      console.log(pageData.pageCreate.userErrors);
      throw new Error("Failed to create the bundle builder page");
    }
    const bundleBuilderPage = pageData.pageCreate.page;
    return bundleBuilderPage;
  }
  async deletePage(admin, session, pageId) {
    await admin.graphql(
      `#graphql
            mutation deletePage($id: ID!) {
                pageDelete(id: $id) {
                    deletedPageId

                    userErrors {
                        field
                        message
                    }
                }
            }`,
      {
        variables: {
          id: pageId
        }
      }
    );
  }
  async setPageMetafields(bundleBuilderId, pageId, session, admin) {
    const pageMetafieldsUpdateResponse = await admin.graphql(
      `#graphql
            mutation updatePageMetafields($id: ID!, $page: PageUpdateInput!) {
                pageUpdate(id: $id, page: $page) {
                    page {
                        # Page fields
                        id
                    }
                    userErrors {
                        field
                        message
                    }
                }
                }`,
      {
        variables: {
          id: pageId,
          page: {
            metafields: [
              {
                key: bundlePageKey,
                value: bundleBuilderId.toString(),
                type: bundlePageType,
                namespace: bundlePageNamespace
              }
            ]
          }
        }
      }
    );
    const pageMetafieldsUpdateData = (await pageMetafieldsUpdateResponse.json()).data;
    if (pageMetafieldsUpdateData.pageUpdate.userErrors.length > 0) {
      console.log(pageMetafieldsUpdateData.pageUpdate.userErrors);
      throw new Error("Failed to update the bundle builder page metafields");
    }
  }
  async updateBundleBuilderPageTitle(admin, session, shopifyPageId, newBundleBuilderPageTitle) {
    const updatePageTitleResponse = await admin.graphql(
      `#graphql
            mutation updatePageTitle($id: ID!, $page: PageUpdateInput!) {
                pageUpdate(id: $id, page: $page) {
                    page {
                        title
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }`,
      {
        variables: {
          id: shopifyPageId,
          page: {
            title: newBundleBuilderPageTitle
          }
        }
      }
    );
    const updatePageTitleData = (await updatePageTitleResponse.json()).data;
    if (updatePageTitleData.pageUpdate.userErrors.length > 0) {
      console.log(updatePageTitleData.pageUpdate.userErrors);
      return false;
    }
    return true;
  }
  async checkIfPageExists(admin, shopifyPageId) {
    const checkPageResponse = await admin.graphql(
      `#graphql
            query checkIfPageExists($id: ID!) {
                page(id: $id) {
                    id
                }
            }`,
      {
        variables: {
          id: shopifyPageId
        }
      }
    );
    const checkPageData = (await checkPageResponse.json()).data;
    const doesPageExist = checkPageData.page !== null;
    console.log(doesPageExist);
    return doesPageExist;
  }
}
const shopifyBundleBuilderPageRepository = new ShopifyBundleBuilderPageGraphql();
const tooltipContent$1 = "_tooltipContent_i3ne1_1";
const stepTitleContainer = "_stepTitleContainer_i3ne1_7";
const styles$7 = {
  tooltipContent: tooltipContent$1,
  stepTitleContainer
};
const loader$l = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  console.log("I'm on bundleId.builder, loader");
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  console.log("isAuthorized", isAuthorized);
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  const bundleBuilder = await bundleBuilderRepository.getBundleBuilderByIdAndStoreUrl(Number(params.bundleid), session.shop);
  if (!bundleBuilder) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const bundleBuilderPageUrl = `${user.primaryDomain}/pages/${bundleBuilder.bundleBuilderPageHandle}`;
  let allBundleSteps = await bundleBuilderStepRepository.getAllStepsForBundleId(Number(params.bundleid));
  return json(new JsonData(true, "success", "Bundle succesfuly retrieved", [], { bundleBuilderPageUrl, bundleBuilder, allBundleSteps, user }), { status: 200 });
};
const action$f = async ({ request, params }) => {
  const { admin, session, redirect: redirect2 } = await authenticate.admin(request);
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  const formData = await request.formData();
  const action2 = formData.get("action");
  switch (action2) {
    case "deleteBundle": {
      try {
        const bundleBuilderToDelete = await prisma.bundleBuilder.update({
          where: {
            id: Number(params.bundleid)
          },
          data: {
            deleted: true
          },
          select: {
            shopifyProductId: true,
            shopifyPageId: true
          }
        });
        if (!bundleBuilderToDelete)
          return json(
            {
              ...new JsonData(false, "error", "There was an error with your request", [
                {
                  fieldId: "bundleId",
                  field: "Bundle ID",
                  message: "Bundle with the provided id doesn't exist."
                }
              ])
            },
            { status: 400 }
          );
        const shopifyBundleBuilderPage2 = shopifyBundleBuilderPageRepository;
        await Promise.all([
          //Deleting a associated bundle page
          shopifyBundleBuilderPage2.deletePage(admin, session, bundleBuilderToDelete.shopifyPageId),
          //Deleting a associated bundle product
          shopifyBundleBuilderProductRepository.deleteBundleBuilderProduct(admin, bundleBuilderToDelete.shopifyProductId)
        ]);
      } catch (error) {
        console.log(error, "Either the bundle product or the bundle page was already deleted.");
      } finally {
        const url = new URL(request.url);
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await ApiCacheService.multiKeyDelete(await cacheKeyService.getAllBundleKeys(params.bundleid));
        if (url.searchParams.get("redirect") === "true") {
          return redirect2("/app");
        }
        return json({ ...new JsonData(true, "success", "Bundle deleted") }, { status: 200 });
      }
    }
    case "updateDiscount": {
      const url = new URL(request.url);
      const discountType = formData.get("discountType");
      const discountValue = formData.get("discountValue");
      if (!discountType || !discountValue) {
        throw Error("Discount type and value are required");
      }
      await prisma.bundleBuilder.update({
        where: {
          id: Number(params.bundleid),
          storeUrl: session.shop
        },
        data: {
          discountValue: Number(discountValue),
          discountType
        }
      });
      await userRepository.updateUser({ ...user, completedOnboarding: true });
      try {
        if (url.searchParams.get("onboarding") === "true" && url.searchParams.get("stepNumber") === "5") {
          return redirect2(`/app/create-bundle-builder/${params.bundleid}/step-6?stepIndex=6`);
        }
      } catch (error) {
        console.log(error);
      }
    }
    case "updateBundle":
      const bundleData = JSON.parse(formData.get("bundle"));
      const errors = [];
      if (!bundleData.title) {
        errors.push({
          fieldId: "bundleTitle",
          field: "Bundle title",
          message: "Please enter a bundle title."
        });
      } else if (bundleData.pricing === BundlePricing.FIXED && (!bundleData.priceAmount || bundleData.priceAmount < 0)) {
        errors.push({
          fieldId: "priceAmount",
          field: "Price amount",
          message: "Please enter a valid price for Fixed bundle."
        });
      } else if (bundleData.discountType != "NO_DISCOUNT" && bundleData.discountValue <= 0) {
        errors.push({
          fieldId: "discountValue",
          field: "Discount value",
          message: "Please enter a desired discount."
        });
      } else if (bundleData.discountType === "FIXED" && bundleData.pricing === "FIXED" && bundleData.discountValue > (bundleData.priceAmount || 0)) {
        errors.push({
          fieldId: "discountValue",
          field: "Discount value",
          message: "Discount amount can't be heigher that the bundle price."
        });
      }
      if (errors.length > 0)
        return json({
          ...new JsonData(false, "error", "There was an error while trying to update the bundle.", errors, bundleData)
        });
      const shopifyBundleBuilderPage = shopifyBundleBuilderPageRepository;
      try {
        await Promise.all([
          prisma.bundleBuilder.update({
            where: {
              id: Number(bundleData.id)
            },
            data: {
              title: bundleData.title,
              published: bundleData.published,
              priceAmount: bundleData.priceAmount,
              pricing: bundleData.pricing,
              discountType: bundleData.discountType,
              discountValue: bundleData.discountValue
            }
          }),
          shopifyBundleBuilderProductRepository.updateBundleProductTitle(admin, bundleData.shopifyProductId, bundleData.title),
          shopifyBundleBuilderPage.updateBundleBuilderPageTitle(admin, session, bundleData.shopifyPageId, bundleData.title)
        ]);
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid));
        const saveBtn = formData.get("submitBtn");
        if (saveBtn === "saveAndExitBtn") {
          return redirect2("/app");
        }
        return json({ ...new JsonData(true, "success", "Bundle updated", [], bundleData) }, { status: 200 });
      } catch (error) {
        console.log(error);
        return json({
          ...new JsonData(false, "error", "There was an error while trying to update the bundle.", [
            {
              fieldId: "Bundle",
              field: "Bundle",
              message: "Error updating the bundle"
            }
          ])
        });
      }
    case "recreateBundleBuilder": {
      const shopifyBundleBuilderPage2 = shopifyBundleBuilderPageRepository;
      const bundleBuilder = await prisma.bundleBuilder.findUnique({
        where: {
          id: Number(params.bundleid)
        },
        include: inclBundleFullStepsBasic
      });
      if (!bundleBuilder) {
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request", [
              {
                fieldId: "bundleId",
                field: "Bundle ID",
                message: "Bundle with the provided id doesn't exist."
              }
            ])
          },
          { status: 400 }
        );
      }
      await Promise.all([
        new Promise(async (res, rej) => {
          const doesBundleBuilderProductExist = await shopifyBundleBuilderProductRepository.checkIfProductExists(admin, bundleBuilder.shopifyProductId);
          if (!doesBundleBuilderProductExist) {
            const newBundleBuilderProductId = await shopifyBundleBuilderProductRepository.createBundleProduct(admin, bundleBuilder.title, session.shop);
            await BundleBuilderRepository.updateBundleBuilderProductId(Number(params.bundleid), newBundleBuilderProductId);
          }
          res(null);
        }),
        new Promise(async (res, rej) => {
          const doesBundleBuilderPageExist = await shopifyBundleBuilderPage2.checkIfPageExists(admin, bundleBuilder.shopifyPageId);
          if (!doesBundleBuilderPageExist) {
            const newBundleBuilderPage = await shopifyBundleBuilderPage2.createPageWithMetafields(admin, session, bundleBuilder.title, Number(params.bundleid));
            await BundleBuilderRepository.updateBundleBuilderPage(Number(params.bundleid), newBundleBuilderPage);
          }
          res(null);
        })
      ]);
      return json({ ...new JsonData(true, "success", "Bundle builder refreshed") }, { status: 200 });
    }
    default: {
      return json(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
};
function Index$e() {
  const nav = useNavigation();
  const navigate = useNavigate();
  const shopify2 = useAppBridge();
  const isLoading = nav.state === "loading";
  const isSubmitting = nav.state === "submitting";
  const params = useParams();
  const navigateSubmit = useNavigateSubmit();
  const actionData = useActionData();
  const loaderData = useLoaderData().data;
  const errors = actionData?.errors;
  console.log(errors);
  const submittedBundle = actionData?.data;
  const serverBundle = loaderData.bundleBuilder;
  const bundleBuilderPageUrl = loaderData.bundleBuilderPageUrl;
  const [bundleState, setBundleState] = useState(errors?.length === 0 || !errors ? serverBundle : submittedBundle);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteBundleHandler = async () => {
    await shopify2.saveBar.leaveConfirmation();
    setShowDeleteModal(true);
    navigateSubmit("deleteBundle", `/app/edit-bundle-builder/${params.bundleid}/builder?redirect=true`);
  };
  useEffect(() => {
    if (errors && errors.length === 0) {
      window.scrollTo(0, 0);
      return;
    }
    errors?.forEach((err) => {
      if (err.fieldId) {
        document.getElementById(err.fieldId)?.scrollIntoView();
        return;
      }
    });
  }, [isLoading, errors]);
  const updateFieldErrorHandler = (fieldId) => {
    errors?.forEach((err) => {
      if (err.fieldId === fieldId) {
        err.message = "";
      }
    });
  };
  const refreshBundleBuilderHandler = async () => {
    await shopify2.saveBar.leaveConfirmation();
    navigateSubmit("recreateBundleBuilder", `/app/edit-bundle-builder/${params.bundleid}/builder`);
  };
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading || isSubmitting ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(Modal, { id: "delete-confirm-modal", open: showDeleteModal, children: [
      /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsx(Text, { as: "p", children: "If you delete this bundle, everything will be lost forever." }) }),
      /* @__PURE__ */ jsxs(TitleBar, { title: "Are you sure you want to delete this bundle?", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowDeleteModal(false), children: "Close" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            variant: "primary",
            tone: "critical",
            onClick: () => {
              navigateSubmit("deleteBundle", `/app/edit-bundle-builder/${params.bundleid}/builder?redirect=true`);
              setShowDeleteModal(false);
            },
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Page,
      {
        secondaryActions: [
          {
            content: "Settings",
            url: `/app/edit-bundle-builder/${serverBundle.id}/settings/?redirect=/app/edit-bundle-builder/${serverBundle.id}/builder`,
            icon: SettingsIcon
          },
          {
            content: "See bundle page",
            accessibilityLabel: "Preview action label",
            icon: ExternalIcon,
            url: `${bundleBuilderPageUrl}`,
            target: "_blank"
          },
          {
            icon: RefreshIcon,
            onAction: refreshBundleBuilderHandler,
            content: "Recreate bundle",
            helpText: "If you accidentally deleted the page where this bundle is displayed or you deleted the dummy product associated with this bundle, click this button to recreate both of them."
          }
        ],
        titleMetadata: serverBundle.published ? /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Active" }) : /* @__PURE__ */ jsx(Badge, { tone: "info", children: "Draft" }),
        backAction: {
          content: "Products",
          onAction: async () => {
            await shopify2.saveBar.leaveConfirmation();
            navigate("/app");
          }
        },
        title: `${serverBundle.title}`,
        subtitle: "Edit bundle details and steps",
        compactTitle: true,
        children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
          errors && errors.length === 0 ? /* @__PURE__ */ jsx(Banner, { title: "Bundle updated!", tone: "success", onDismiss: () => {
          }, children: /* @__PURE__ */ jsx(BlockStack, { gap: GapInsideSection, children: /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "You succesfuly updated this bundle." }) }) }) : null,
          /* @__PURE__ */ jsx(Form, { method: "POST", "data-discard-confirmation": true, "data-save-bar": true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
            /* @__PURE__ */ jsxs(Layout, { children: [
              /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
                /* @__PURE__ */ jsx(Index$f, { user: loaderData.user, bundleBuilderSteps: loaderData.allBundleSteps }),
                /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
                  /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "Bundle page" }),
                  /* @__PURE__ */ jsx(BlockStack, { gap: GapInsideSection, children: /* @__PURE__ */ jsx(
                    TextField,
                    {
                      label: "Bundle page",
                      labelHidden: true,
                      autoComplete: "off",
                      readOnly: true,
                      name: "bundlePage",
                      helpText: "Send customers to this page to let them create their unique bundles.",
                      value: bundleBuilderPageUrl,
                      type: "url"
                    }
                  ) })
                ] }) }),
                /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { children: [
                  /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "Bundle Pricing" }),
                  /* @__PURE__ */ jsx(
                    ChoiceList,
                    {
                      title: "Bundle Pricing",
                      name: "bundlePricing",
                      titleHidden: true,
                      choices: [
                        {
                          label: "Calculated price ",
                          value: BundlePricingClient.CALCULATED,
                          helpText: /* @__PURE__ */ jsx(
                            Tooltip,
                            {
                              width: "wide",
                              activatorWrapper: "div",
                              content: `e.g. use case: you want to sell a shirt,
                                      pants, and a hat in a bundle with a 10%
                                      discount on the whole order, and you want the
                                      total price before discount to be the sum of
                                      the prices of individual products that the customer has selected.`,
                              children: /* @__PURE__ */ jsxs("div", { className: styles$7.tooltipContent, children: [
                                /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx("p", { children: "The final price will be the sum of the prices of all products that the customer has selected." }) }),
                                /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Icon, { source: QuestionCircleIcon }) })
                              ] })
                            }
                          )
                        },
                        {
                          label: "Fixed price",
                          value: BundlePricingClient.FIXED,
                          helpText: /* @__PURE__ */ jsx(
                            Tooltip,
                            {
                              width: "wide",
                              activatorWrapper: "div",
                              content: `e.g. use case: you want to sell 5 cookies
                                    in a bundle, always at the same price, but want
                                    your customers to be able to select which
                                    cookies they want.`,
                              children: /* @__PURE__ */ jsxs("div", { className: styles$7.tooltipContent, children: [
                                /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Text, { as: "p", children: "All bundles created will be priced the same." }) }),
                                /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Icon, { source: QuestionCircleIcon }) })
                              ] })
                            }
                          ),
                          renderChildren: (isSelected) => {
                            return isSelected ? /* @__PURE__ */ jsx(Box, { maxWidth: "50", id: "priceAmount", children: /* @__PURE__ */ jsx(
                              TextField,
                              {
                                label: "Price",
                                type: "number",
                                name: "priceAmount",
                                inputMode: "numeric",
                                autoComplete: "off",
                                min: 0,
                                error: errors?.find((err) => err.fieldId === "priceAmount")?.message,
                                value: bundleState.priceAmount?.toString(),
                                prefix: "$",
                                onChange: (newPrice) => {
                                  setBundleState((prevBundle) => {
                                    return {
                                      ...prevBundle,
                                      priceAmount: parseFloat(newPrice)
                                    };
                                  });
                                  updateFieldErrorHandler("priceAmount");
                                }
                              }
                            ) }) : null;
                          }
                        }
                      ],
                      selected: [bundleState.pricing],
                      onChange: (newPricing) => {
                        setBundleState((prevBundle) => {
                          return {
                            ...prevBundle,
                            pricing: newPricing[0]
                          };
                        });
                      }
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
                  /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "Bundle Discount" }),
                  /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
                    /* @__PURE__ */ jsx(
                      Select,
                      {
                        label: "Discount Type",
                        name: "bundleDiscountType",
                        options: [
                          {
                            label: "Percentage (e.g. 25% off)",
                            value: BundleDiscountTypeClient.PERCENTAGE
                          },
                          {
                            label: "Fixed (e.g. 10$ off)",
                            value: BundleDiscountTypeClient.FIXED
                          },
                          {
                            label: "No discount",
                            value: BundleDiscountTypeClient.NO_DISCOUNT
                          }
                        ],
                        value: bundleState.discountType,
                        onChange: (newDiscountType) => {
                          setBundleState((prevBundle) => {
                            return {
                              ...prevBundle,
                              discountType: newDiscountType
                            };
                          });
                        }
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TextField,
                      {
                        label: "Discount amount",
                        type: "number",
                        autoComplete: "off",
                        inputMode: "numeric",
                        disabled: bundleState.discountType === "NO_DISCOUNT",
                        name: `discountValue`,
                        prefix: bundleState.discountType === BundleDiscountTypeClient.PERCENTAGE ? "%" : "$",
                        min: 0,
                        max: 100,
                        value: bundleState.discountValue.toString(),
                        error: errors?.find((err) => err.fieldId === "discountValue")?.message,
                        onChange: (newDiscountValue) => {
                          setBundleState((prevBundle) => {
                            return {
                              ...prevBundle,
                              discountValue: parseInt(newDiscountValue)
                            };
                          });
                          updateFieldErrorHandler("discountValue");
                        }
                      }
                    )
                  ] })
                ] }) })
              ] }) }),
              /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
                /* @__PURE__ */ jsx("input", { type: "hidden", name: "action", defaultValue: "updateBundle" }),
                /* @__PURE__ */ jsx("input", { type: "hidden", name: "bundle", defaultValue: JSON.stringify(bundleState) }),
                /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
                  /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
                    /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "Bundle title" }),
                    /* @__PURE__ */ jsx(BlockStack, { gap: GapInsideSection, children: /* @__PURE__ */ jsx(
                      TextField,
                      {
                        label: "Title",
                        labelHidden: true,
                        autoComplete: "off",
                        inputMode: "text",
                        name: "bundleTitle",
                        helpText: "This title will be displayed to your customers on the bundle page, in checkout, and in the cart.",
                        error: errors?.find((err) => err.fieldId === "bundleTitle")?.message,
                        value: bundleState.title,
                        onChange: (newTitile) => {
                          setBundleState((prevBundle) => {
                            return { ...prevBundle, title: newTitile };
                          });
                          updateFieldErrorHandler("bundleTitle");
                        },
                        type: "text"
                      }
                    ) })
                  ] }) }),
                  /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, children: [
                    /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "Bundle status" }),
                    /* @__PURE__ */ jsx(
                      Select,
                      {
                        label: "Visibility",
                        name: "bundleVisibility",
                        labelHidden: true,
                        options: [
                          { label: "Active", value: "true" },
                          { label: "Draft", value: "false" }
                        ],
                        helpText: "Bundles set to 'ACTIVE' are visible to anyone browsing your store.",
                        value: bundleState.published ? "true" : "false",
                        onChange: (newSelection) => {
                          setBundleState((prevBundle) => {
                            return {
                              ...prevBundle,
                              published: newSelection === "true"
                            };
                          });
                        }
                      }
                    )
                  ] }) })
                ] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsx(Divider, { borderColor: "transparent" }),
            /* @__PURE__ */ jsx(Box, { width: "full", children: /* @__PURE__ */ jsx(BlockStack, { inlineAlign: "end", children: /* @__PURE__ */ jsxs(ButtonGroup, { children: [
              /* @__PURE__ */ jsx(Button, { variant: "primary", tone: "critical", onClick: deleteBundleHandler, children: "Delete" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "Polaris-Button Polaris-Button--pressable Polaris-Button--variantSecondary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter",
                  name: "submitBtn",
                  value: "saveBtn",
                  type: "submit",
                  children: /* @__PURE__ */ jsx("span", { className: "Polaris-Text--root Polaris-Text--bodySm Polaris-Text--medium", children: "Save" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "Polaris-Button Polaris-Button--pressable Polaris-Button--variantPrimary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter",
                  name: "submitBtn",
                  value: "saveAndExitBtn",
                  type: "submit",
                  children: /* @__PURE__ */ jsx("span", { className: "Polaris-Text--root Polaris-Text--bodySm Polaris-Text--medium", children: "Save and return" })
                }
              )
            ] }) }) }),
            /* @__PURE__ */ jsxs(FooterHelp, { children: [
              "Are you stuck? ",
              /* @__PURE__ */ jsx(Link, { to: "/app/help", children: "Get help" }),
              " from us, or ",
              /* @__PURE__ */ jsx(Link, { to: "/app/feature-request", children: "suggest new features" }),
              "."
            ] })
          ] }) })
        ] })
      }
    )
  ] }) });
}
function ErrorBoundary$1() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { children: [
        error.status,
        " ",
        error.statusText
      ] }),
      /* @__PURE__ */ jsx("p", { children: error.data })
    ] });
  } else if (error instanceof Error) {
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { children: "Error" }),
      /* @__PURE__ */ jsx("p", { children: error.message }),
      /* @__PURE__ */ jsx("p", { children: "The stack trace is:" }),
      /* @__PURE__ */ jsx("pre", { children: error.stack })
    ] });
  } else {
    return /* @__PURE__ */ jsx("h1", { children: "Unknown Error" });
  }
}
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary: ErrorBoundary$1,
  action: action$f,
  default: Index$e,
  loader: loader$l
}, Symbol.toStringTag, { value: "Module" }));
const loader$k = async ({ request, params }) => {
  const { redirect: redirect2, session } = await authenticate.admin(request);
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  console.log("I'm on steps loader");
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  let allBundleSteps = await bundleBuilderStepRepository.getAllStepsForBundleId(Number(params.bundleid));
  return json(new JsonData(true, "success", "Bundle step succesfuly retrieved", [], { user, allBundleSteps }), { status: 200 });
};
const action$e = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const formData = await request.formData();
  const action2 = formData.get("action");
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  console.log("I'm on steps", action2);
  switch (action2) {
    case "addProductStep": {
      const canAddMoreSteps = await bundleBuilderStepsService.canAddMoreSteps(Number(params.bundleid), user);
      if (!canAddMoreSteps.ok) {
        return json(canAddMoreSteps, { status: 400 });
      }
      try {
        const stepDataJson = formData.get("stepData");
        const productStepData = JSON.parse(stepDataJson);
        const newStep = await bundleBuilderProductStepService.addNewStep(Number(params.bundleid), productStepData);
        if (!newStep)
          throw new Error("New step couldn't be created.");
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid));
        const url = new URL(request.url);
        if (url.searchParams.get("onboarding") === "true") {
          if (url.searchParams.get("stepNumber") === "2" && url.searchParams.get("multiStep") === "true") {
            return redirect2(`/app/create-bundle-builder/${params.bundleid}/step-3`);
          } else if (url.searchParams.get("stepNumber") === "2" && url.searchParams.get("multiStep") === "false") {
            return redirect2(`/app/create-bundle-builder/${params.bundleid}/step-5`);
          } else if (url.searchParams.get("stepNumber") === "4") {
            return redirect2(`/app/create-bundle-builder/${params.bundleid}/step-5`);
          }
        }
        return redirect2(`/app/edit-bundle-builder/${params.bundleid}/steps/${newStep.stepNumber}/product`);
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request", [
              {
                fieldId: "bundleStep",
                field: "Bundle step",
                message: "New step could't be created."
              }
            ])
          },
          { status: 400 }
        );
      }
    }
    case "addContentStep": {
      const canAddMoreSteps = await bundleBuilderStepsService.canAddMoreSteps(Number(params.bundleid), user);
      if (!canAddMoreSteps.ok) {
        return json(canAddMoreSteps, { status: 400 });
      }
      try {
        const stepDataJson = formData.get("stepData");
        const contentStepData = JSON.parse(stepDataJson);
        const newStep = await bundleBuilderContentStepService.addNewStep(Number(params.bundleid), contentStepData);
        if (!newStep)
          throw new Error("New step couldn't be created.");
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid));
        const url = new URL(request.url);
        if (url.searchParams.get("onboarding") === "true") {
          if (url.searchParams.get("stepNumber") === "2" && url.searchParams.get("multiStep") === "true") {
            return redirect2(`/app/create-bundle-builder/${params.bundleid}/step-3?stepNumber=3&stepIndex=3`);
          } else if (url.searchParams.get("stepNumber") === "2" && url.searchParams.get("multiStep") === "false") {
            return redirect2(`/app/create-bundle-builder/${params.bundleid}/step-5?stepNumber=3&stepIndex=3`);
          } else if (url.searchParams.get("stepNumber") === "4") {
            return redirect2(`/app/create-bundle-builder/${params.bundleid}/step-5?stepNumber=3&stepIndex=3`);
          }
        }
        return redirect2(`/app/edit-bundle-builder/${params.bundleid}/steps/${newStep.stepNumber}/content`);
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request", [
              {
                fieldId: "bundleStep",
                field: "Bundle step",
                message: "New step could't be created."
              }
            ])
          },
          { status: 400 }
        );
      }
    }
    case "addEmptyStep": {
      const canAddMoreSteps = await bundleBuilderStepsService.canAddMoreSteps(Number(params.bundleid), user);
      if (!canAddMoreSteps.ok) {
        return json(canAddMoreSteps, { status: 400 });
      }
      const numOfSteps = await bundleBuilderStepRepository.getNumberOfSteps(Number(params.bundleid));
      try {
        const newStepType = formData.get("stepType");
        const newStepTitle = formData.get("stepTitle");
        let newStepDescription = formData.get("stepDescription") ? formData.get("stepDescription") : "This is the description for this step. Feel free to change it.";
        let newStep = null;
        if (newStepType === "PRODUCT") {
          newStep = await bundleBuilderStepRepository.addNewEmptyStep(Number(params.bundleid), StepType.PRODUCT, newStepDescription, numOfSteps + 1, newStepTitle);
        } else if (newStepType === "CONTENT") {
          newStep = await bundleBuilderStepRepository.addNewEmptyStep(Number(params.bundleid), StepType.CONTENT, newStepDescription, numOfSteps + 1, newStepTitle);
        }
        if (!newStep)
          throw new Error("New step couldn't be created.");
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid));
        const url = new URL(request.url);
        if (url.searchParams.get("onboarding") === "true") {
          if (url.searchParams.get("stepNumber") === "2" && url.searchParams.get("multiStep") === "true") {
            return redirect2(`/app/create-bundle-builder/${params.bundleid}/step-3`);
          } else if (url.searchParams.get("stepNumber") === "2" && url.searchParams.get("multiStep") === "false") {
            return redirect2(`/app/create-bundle-builder/${params.bundleid}/step-5`);
          } else if (url.searchParams.get("stepNumber") === "4") {
            return redirect2(`/app/create-bundle-builder/${params.bundleid}/step-5`);
          }
        }
        return redirect2(`${newStep.stepNumber}/${newStep.stepType === "CONTENT" ? "content" : "product"}`);
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request", [
              {
                fieldId: "bundleStep",
                field: "Bundle step",
                message: "New step could't be created."
              }
            ])
          },
          { status: 400 }
        );
      }
    }
    case "moveStepDown": {
      try {
        const stepId = formData.get("stepId");
        let step = await prisma.bundleStep.findUnique({
          where: {
            id: Number(stepId)
          }
        });
        if (!step)
          return json(
            {
              ...new JsonData(false, "error", "There was an error with your request", [
                {
                  fieldId: "stepId",
                  field: "Step Id",
                  message: "Step with the entered Id was not found."
                }
              ])
            },
            { status: 400 }
          );
        const StepThatWasDown = (await prisma.bundleStep.findMany({
          where: {
            stepNumber: step?.stepNumber + 1,
            bundleBuilderId: step.bundleBuilderId
          }
        }))[0];
        const maxStep = await prisma.bundleStep.aggregate({
          _max: {
            stepNumber: true
          },
          where: {
            bundleBuilderId: step.bundleBuilderId
          }
        });
        if (maxStep._max.stepNumber === null || step.stepNumber >= maxStep._max.stepNumber) {
          return json(
            {
              ...new JsonData(false, "error", "There was an error with your request", [
                {
                  fieldId: "stepNumber",
                  field: "Step number",
                  message: "This step is allready the last step in a bundle."
                }
              ])
            },
            { status: 400 }
          );
        }
        await prisma.$transaction([
          //Increment the step on which the operation was clicked
          prisma.bundleStep.update({
            where: {
              id: step.id
            },
            data: {
              stepNumber: {
                increment: 1
              }
            }
          }),
          prisma.bundleStep.update({
            where: {
              id: StepThatWasDown.id
            },
            data: {
              stepNumber: {
                decrement: 1
              }
            }
          })
        ]);
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await Promise.all([
          ApiCacheService.multiKeyDelete(await cacheKeyService.getAllStepsKeys(params.bundleid)),
          ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid))
        ]);
        return json({
          ...new JsonData(true, "success", "Step moved down")
        });
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request")
          },
          { status: 400 }
        );
      }
    }
    case "moveStepUp": {
      try {
        const stepId = formData.get("stepId");
        let step = await prisma.bundleStep.findUnique({
          where: {
            id: Number(stepId)
          }
        });
        if (!step)
          return json(
            {
              ...new JsonData(false, "error", "There was an error with your request", [
                {
                  fieldId: "stepId",
                  field: "Step Id",
                  message: "Step with the entered Id was not found."
                }
              ])
            },
            { status: 400 }
          );
        const stepThatWasUp = (await prisma.bundleStep.findMany({
          where: {
            stepNumber: step?.stepNumber - 1,
            bundleBuilderId: step.bundleBuilderId
          }
        }))[0];
        if (step.stepNumber <= 1) {
          return json(
            {
              ...new JsonData(false, "error", "There was an error with your request", [
                {
                  fieldId: "stepNumber",
                  field: "Step number",
                  message: "This step is allready the first step in a bundle."
                }
              ])
            },
            { status: 400 }
          );
        }
        await prisma.$transaction([
          //Update the step
          prisma.bundleStep.update({
            where: {
              id: Number(stepId)
            },
            data: {
              stepNumber: {
                decrement: 1
              }
            }
          }),
          //Update the step that was before this step
          prisma.bundleStep.update({
            where: {
              id: stepThatWasUp.id
            },
            data: {
              stepNumber: {
                increment: 1
              }
            }
          })
        ]);
        const cacheKeyService = new ApiCacheKeyService(session.shop);
        await Promise.all([
          ApiCacheService.multiKeyDelete(await cacheKeyService.getAllStepsKeys(params.bundleid)),
          ApiCacheService.singleKeyDelete(cacheKeyService.getBundleDataKey(params.bundleid))
        ]);
        return json({
          ...new JsonData(true, "success", "Step moved up")
        });
      } catch (error) {
        console.log(error);
        return json(
          {
            ...new JsonData(false, "error", "There was an error with your request")
          },
          { status: 400 }
        );
      }
    }
    default:
      return json(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything")
        },
        { status: 200 }
      );
  }
};
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$e,
  loader: loader$k
}, Symbol.toStringTag, { value: "Module" }));
const sticky$1 = "_sticky_ob61m_1";
const styles$6 = {
  sticky: sticky$1
};
const loader$j = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  console.log("I'm on bundleID loader");
  const isAuthorized = await AuthorizationCheck(session.shop, Number(params.bundleid));
  if (!isAuthorized) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  const bundleBuilder = await bundleBuilderRepository.getBundleBuilderByIdAndStoreUrl(Number(params.bundleid), session.shop);
  if (!bundleBuilder) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  return json(new JsonData(true, "success", "Bundle succesfuly retrieved", [], bundleBuilder), { status: 200 });
};
const action$d = async ({ request, params }) => {
  console.log("I'm on bundleID", action$d);
  switch (action$d) {
    default: {
      return json(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
};
function Index$d() {
  const nav = useNavigation();
  const isLoading = nav.state === "loading";
  const isSubmitting = nav.state === "submitting";
  const serverBundle = useLoaderData().data;
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading || isSubmitting ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: styles$6.sticky, children: /* @__PURE__ */ jsx(Card, { padding: "300", children: /* @__PURE__ */ jsxs(InlineStack, { gap: GapBetweenTitleAndContent, align: "center", children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h1", children: /* @__PURE__ */ jsxs(InlineStack, { gap: "100", align: "center", children: [
        /* @__PURE__ */ jsx(Text, { as: "p", children: /* @__PURE__ */ jsx("u", { children: "Editing: " }) }),
        /* @__PURE__ */ jsxs(Text, { as: "p", fontWeight: "bold", children: [
          serverBundle.title,
          " | Bundle ID: ",
          serverBundle.id
        ] })
      ] }) }),
      serverBundle.published ? /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Active" }) : /* @__PURE__ */ jsx(Badge, { tone: "info", children: "Draft" })
    ] }) }) }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] }) });
}
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$d,
  default: Index$d,
  loader: loader$j
}, Symbol.toStringTag, { value: "Module" }));
const tableWrapper$2 = "_tableWrapper_91o39_1";
const loadingTable$2 = "_loadingTable_91o39_5";
const hide$2 = "_hide_91o39_18";
const progressBar = "_progressBar_91o39_22";
const styles$5 = {
  tableWrapper: tableWrapper$2,
  loadingTable: loadingTable$2,
  hide: hide$2,
  progressBar
};
const loader$i = async ({ request, params }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  if (!params.bundleid) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle id is required"
    });
  }
  const bundleBuilder = await BundleBuilderRepository.getBundleBuilderById(Number(params.bundleid));
  if (!bundleBuilder) {
    throw new Response(null, {
      status: 404,
      statusText: "Bundle with this id not found"
    });
  }
  const url = new URL(request.url);
  const step = url.toString().split("/")[url.toString().split("/").length - 1];
  const stepNumber = step.split("-")[1].split("?")[0];
  return json(new JsonData(true, "success", "Loader response", [], { bundleBuilder, step: Number(stepNumber) }), { status: 200 });
};
const action$c = async ({ request, params }) => {
  return json(
    {
      ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
    },
    { status: 200 }
  );
};
function Index$c() {
  const nav = useNavigation();
  const isLoading = nav.state != "idle";
  const loaderData = useLoaderData();
  const bundleBuilder = loaderData.data.bundleBuilder;
  const step = loaderData.data.step;
  return /* @__PURE__ */ jsxs(Page, { title: bundleBuilder.title, children: [
    /* @__PURE__ */ jsx("div", { className: styles$5.cardWrapper, children: /* @__PURE__ */ jsx(Card, { padding: "600", children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
      /* @__PURE__ */ jsxs("div", { id: styles$5.tableWrapper, children: [
        /* @__PURE__ */ jsx("div", { className: isLoading ? styles$5.loadingTable : styles$5.hide, children: /* @__PURE__ */ jsx(Spinner, { accessibilityLabel: "Spinner example", size: "large" }) }),
        /* @__PURE__ */ jsx(Outlet, {})
      ] }),
      /* @__PURE__ */ jsx(Divider, { borderColor: "transparent" }),
      /* @__PURE__ */ jsx("div", { className: styles$5.progressBar, style: { width: `${100 / 6 * step}%` }, children: " " })
    ] }) }) }),
    /* @__PURE__ */ jsxs(FooterHelp, { children: [
      "Are you stuck? ",
      /* @__PURE__ */ jsx(Link, { to: "/app/help", children: "Get help" }),
      " from us, or ",
      /* @__PURE__ */ jsx(Link, { to: "/app/feature-request", children: "suggest new features" }),
      "."
    ] })
  ] });
}
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$c,
  default: Index$c,
  loader: loader$i
}, Symbol.toStringTag, { value: "Module" }));
const tableWrapper$1 = "_tableWrapper_1tdlw_1";
const loadingTable$1 = "_loadingTable_1tdlw_5";
const hide$1 = "_hide_1tdlw_18";
const styles$4 = {
  tableWrapper: tableWrapper$1,
  loadingTable: loadingTable$1,
  hide: hide$1
};
class ShopifyRedirectRepository {
  static async createProductToBundleRedirect(admin, pageHandle, productHandle) {
    const response = await admin.graphql(
      `#graphql
            mutation createProductToBundleRedirect($input: UrlRedirectInput!) {
              urlRedirectCreate(urlRedirect: $input) {
                urlRedirect {
                  id
                }
                userErrors {
                    field
                    message
                  }
              }
            }`,
      {
        variables: {
          input: {
            target: `/pages/${pageHandle}`,
            path: `/products/${productHandle}`
          }
        }
      }
    );
    const data = await response.json();
    const urlRedirect = data.data.urlRedirectCreate;
    if (urlRedirect.userErrors && urlRedirect.userErrors.length > 0) {
      return false;
    }
    return true;
  }
}
const loader$h = async ({ request }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  console.log("I'm on bundles loader");
  const [user, bundleBuildersWithoutPageUrl] = await Promise.all([
    userRepository.getUserByStoreUrl(session.shop),
    prisma.bundleBuilder.findMany({
      where: {
        user: {
          storeUrl: session.shop
        },
        deleted: false
      },
      select: bundleAndSteps,
      orderBy: {
        createdAt: "desc"
      }
    })
  ]);
  if (!user)
    return redirect2("/app");
  const bundleBuildersWithPageUrl = bundleBuildersWithoutPageUrl.map((bundleBuilder) => {
    return {
      ...bundleBuilder,
      bundleBuilderPageUrl: `${user.primaryDomain}/pages/${bundleBuilder.bundleBuilderPageHandle}`
      //Url of the bundle page
    };
  });
  return json$1(
    {
      ...new JsonData(true, "success", "Bundles succesfuly retrieved.", [], { bundleBuildersWithPageUrl, user })
    },
    { status: 200 }
  );
};
const action$b = async ({ request, params }) => {
  const { admin, session, redirect: redirect2 } = await authenticate.admin(request);
  const formData = await request.formData();
  const action2 = formData.get("action");
  console.log("I'm on bundles", action2);
  switch (action2) {
    case "createBundle": {
      try {
        const user = await userRepository.getUserByStoreUrl(session.shop);
        if (!user)
          return redirect2("/app");
        if (user.isDevelopmentStore) {
        } else if (user.activeBillingPlan === "BASIC") {
          const bundleBuilderCount = await bundleBuilderRepository.getBundleBuilderCountByStoreUrl(session.shop);
          if (bundleBuilderCount >= 2) {
            return json$1(new JsonData(false, "error", "You have reached the limit of 2 bundles for the basic plan."), { status: 400 });
          }
        }
        const url = new URL(request.url);
        const urlParams = url.searchParams;
        const isOnboarding = urlParams.get("onboarding") === "true";
        const shopifyBundleBuilderPageRepository$1 = shopifyBundleBuilderPageRepository;
        const bundleBuilderTitle = formData.get("bundleTitle");
        const [bundleProductId, bundlePage] = await Promise.all([
          shopifyBundleBuilderProductRepository.createBundleProduct(admin, bundleBuilderTitle, session.shop),
          shopifyBundleBuilderPageRepository$1.createPage(admin, session, bundleBuilderTitle)
        ]);
        if (!bundleProductId || !bundlePage) {
          return;
        }
        const [, bundleBuilder] = await Promise.all([
          //Create redirect
          ShopifyRedirectRepository.createProductToBundleRedirect(admin, bundlePage.handle, bundleProductId),
          //Create new bundle
          BundleBuilderRepository.createNewEmptyBundleBuilder(session.shop, bundleBuilderTitle, bundleProductId, bundlePage.id, bundlePage.handle)
        ]);
        await shopifyBundleBuilderPageRepository$1.setPageMetafields(bundleBuilder.id, bundlePage.id, session, admin);
        if (isOnboarding) {
          return redirect2(`/app/create-bundle-builder/${bundleBuilder.id}/step-1?stepIndex=1`);
        } else {
          return redirect2(`/app/edit-bundle-builder/${bundleBuilder.id}/builder`);
        }
      } catch (error) {
        console.log(error);
      }
    }
    default: {
      return json$1(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
};
function Index$b() {
  const nav = useNavigation();
  const isLoading = nav.state === "loading";
  const isSubmitting = nav.state === "submitting";
  const fetcher = useFetcher();
  const submit = useSubmit();
  const navigate = useNavigate();
  const loaderResponse = useLoaderData();
  const bundleBuilders = loaderResponse.data.bundleBuildersWithPageUrl;
  const user = loaderResponse.data.user;
  const canCreateNewBundle = () => {
    if (user.isDevelopmentStore) {
      return true;
    } else if (user.activeBillingPlan === "BASIC" && bundleBuilders.length >= 2) {
      shopify.modal.show("bundle-limit-modal");
      return false;
    }
    return true;
  };
  const [newBundleTitle, setNewBundleTitle] = useState();
  const createBundleBtnHandler = () => {
    shopify.modal.show("new-bundle-builder-modal");
  };
  const createBundle = () => {
    if (!canCreateNewBundle())
      return;
    if (!newBundleTitle) {
      setNewBundleTitle("");
      return;
    }
    const form2 = new FormData();
    form2.append("bundleTitle", newBundleTitle);
    form2.append("action", "createBundle");
    submit(form2, { method: "POST", action: `/app/users/${user.id}/bundles${!user.completedOnboarding ? "?onboarding=true" : ""}`, navigate: true });
  };
  const [bundleForDelete, setBundleForDelete] = useState(null);
  const [showBundleDeleteConfirmModal, setShowBundleDeleteConfirmModal] = useState(false);
  useEffect(() => {
    if (bundleForDelete)
      setShowBundleDeleteConfirmModal(true);
  }, [bundleForDelete]);
  const handleEditBundleBuilder = (bundleBuilderId) => {
    navigate(`/app/edit-bundle-builder/${bundleBuilderId}/builder`);
  };
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : isSubmitting ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(InlineStack, { blockAlign: "center", align: "center", gap: GapInsideSection, children: [
    /* @__PURE__ */ jsx(Text, { as: "p", fontWeight: "bold", variant: "headingLg", children: "Your new bundle is being created..." }),
    /* @__PURE__ */ jsx(Spinner, { accessibilityLabel: "Spinner example", size: "large" })
  ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Modal, { id: "new-bundle-builder-modal", children: [
      /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
        /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingSm", children: "Enter the title of your bundle" }),
        /* @__PURE__ */ jsx(
          TextField,
          {
            label: "Title",
            labelHidden: true,
            autoComplete: "off",
            inputMode: "text",
            name: "bundleTitle",
            helpText: "This title will be displayed to your customers on the bundle page, in checkout, and in the cart.",
            value: newBundleTitle,
            error: newBundleTitle === "" ? "Please enter a title" : void 0,
            onChange: (newTitile) => {
              setNewBundleTitle(newTitile);
            },
            type: "text"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(TitleBar, { title: "Bundle title", children: /* @__PURE__ */ jsx("button", { variant: "primary", onClick: createBundle, disabled: fetcher.state !== "idle", children: "Next" }) })
    ] }),
    /* @__PURE__ */ jsxs(Modal, { id: "delete-confirm-modal", open: showBundleDeleteConfirmModal, children: [
      /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsx(Text, { as: "p", children: "If you delete this bundle, everything will be lost forever." }) }),
      /* @__PURE__ */ jsxs(TitleBar, { title: "Are you sure you want to delete this bundle?", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setShowBundleDeleteConfirmModal(false), children: "Close" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            variant: "primary",
            tone: "critical",
            onClick: () => {
              if (!bundleForDelete)
                return;
              const form2 = new FormData();
              form2.append("action", "deleteBundle");
              fetcher.submit(form2, {
                method: "post",
                action: `/app/edit-bundle-builder/${bundleForDelete.id}/builder`
              });
              setBundleForDelete(null);
              setShowBundleDeleteConfirmModal(false);
            },
            children: "Delete"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Modal, { id: "bundle-limit-modal", children: [
      /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
        /* @__PURE__ */ jsx(Text, { as: "p", children: "You are on the 'Basic' plan which only allows you to have up to 2 bundles at one time." }),
        /* @__PURE__ */ jsxs(Text, { as: "p", variant: "headingSm", children: [
          "If you want to create more bundles, go to ",
          /* @__PURE__ */ jsx(Link, { to: "/app/billing", children: "billing" }),
          " and upgrade to paid plan."
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TitleBar, { title: "Maximum bundles reached", children: /* @__PURE__ */ jsx("button", { variant: "primary", onClick: () => shopify.modal.hide("bundle-limit-modal"), children: "Close" }) })
    ] }),
    /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
      /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
        /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingLg", children: "My Bundles" }),
        /* @__PURE__ */ jsx(Button, { icon: PlusIcon, variant: "primary", onClick: createBundleBtnHandler, children: "Create bundle" })
      ] }),
      /* @__PURE__ */ jsxs("div", { id: styles$4.tableWrapper, children: [
        /* @__PURE__ */ jsx("div", { className: fetcher.state !== "idle" ? styles$4.loadingTable : styles$4.hide, children: /* @__PURE__ */ jsx(Spinner, { accessibilityLabel: "Spinner example", size: "large" }) }),
        /* @__PURE__ */ jsx(Card, { children: bundleBuilders.length > 0 ? /* @__PURE__ */ jsx(
          DataTable,
          {
            columnContentTypes: ["text", "text", "text", "text", "text", "text"],
            headings: ["Bundle ID", "Name", "Steps", "Status", "Actions", "Settings", "Preview"],
            rows: bundleBuilders.map((bundleBuilder) => {
              return [
                /* @__PURE__ */ jsx(Text, { as: "p", tone: "base", children: bundleBuilder.id }),
                //
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: "#",
                    onClick: () => {
                      handleEditBundleBuilder(bundleBuilder.id);
                    },
                    children: /* @__PURE__ */ jsx(Text, { as: "p", tone: "base", children: bundleBuilder.title })
                  }
                ),
                //
                bundleBuilder.steps.length,
                //
                /* @__PURE__ */ jsx(Link, { to: `/app/edit-bundle-builder/${bundleBuilder.id}/builder`, children: bundleBuilder.published ? /* @__PURE__ */ jsx(Badge, { tone: "success", children: "Active" }) : /* @__PURE__ */ jsx(Badge, { tone: "info", children: "Draft" }) }),
                //
                /* @__PURE__ */ jsxs(ButtonGroup, { children: [
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      icon: DeleteIcon,
                      variant: "secondary",
                      tone: "critical",
                      onClick: () => {
                        setBundleForDelete(bundleBuilder);
                      },
                      children: "Delete"
                    }
                  ),
                  /* @__PURE__ */ jsx(Button, { icon: EditIcon, variant: "primary", url: `/app/edit-bundle-builder/${bundleBuilder.id}/builder`, children: "Edit" })
                ] }),
                //
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    icon: SettingsIcon,
                    variant: "secondary",
                    tone: "success",
                    url: `/app/edit-bundle-builder/${bundleBuilder.id}/settings/?redirect=/app/edit-bundle-builder/${bundleBuilder.id}/builder`,
                    children: "Settings"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    icon: ExternalIcon,
                    variant: "secondary",
                    tone: "success",
                    url: `${bundleBuilder.bundleBuilderPageUrl}?${bundlePagePreviewKey}=true`,
                    target: "_blank",
                    children: "Preview"
                  }
                )
              ];
            })
          }
        ) : /* @__PURE__ */ jsx(
          EmptyState,
          {
            heading: "Let’s create the first custom bundle for your customers!",
            action: {
              content: "Create bundle",
              icon: PlusIcon,
              onAction: createBundleBtnHandler
            },
            fullWidth: true,
            image: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png",
            children: /* @__PURE__ */ jsx("p", { children: "Your customers will be able to use the custom bundles you create to create and buy their own custom bundles." })
          }
        ) })
      ] })
    ] })
  ] }) });
}
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$b,
  default: Index$b,
  loader: loader$h
}, Symbol.toStringTag, { value: "Module" }));
class SignatureValidator {
  receivedSignature;
  otherQueryParams;
  constructor(searchParams) {
    this.otherQueryParams = searchParams;
    this.receivedSignature = searchParams.get("signature");
    this.otherQueryParams.delete("signature");
  }
  getReceivedSignature() {
    return this.receivedSignature;
  }
  getOtherQueryParams() {
    return this.otherQueryParams;
  }
  async verifySignature() {
    const queryParamsForSigning = this.getUrlForSigning();
    const calculatedSignature = Hex.stringify(HmacSha256(queryParamsForSigning, process.env.SHOPIFY_API_SECRET));
    if (this.receivedSignature === calculatedSignature) {
      return true;
    }
    return false;
  }
  getUrlForSigning() {
    const queryParamEntries = this.otherQueryParams.entries();
    let paramKeyValuePair = queryParamEntries.next();
    const arrayOfParams = [];
    while (true) {
      if (!paramKeyValuePair.done) {
        arrayOfParams.push(paramKeyValuePair.value);
      } else
        break;
      paramKeyValuePair = queryParamEntries.next();
    }
    arrayOfParams.sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });
    let queryParametersString = "";
    arrayOfParams.forEach((param) => {
      queryParametersString += `${param[0]}=${param[1]}`;
    });
    return queryParametersString;
  }
}
async function checkPublicAuth(request, strict) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const bundleId = url.searchParams.get("bundleId");
  const isBundleInPreview = url.searchParams.get(bundlePagePreviewKey);
  const signatureValidator = new SignatureValidator(url.searchParams);
  if (!await signatureValidator.verifySignature()) {
    return new JsonData(false, "error", "There was an error with your request. 'signature' is invalid.");
  }
  if (!shop) {
    return new JsonData(false, "error", "There was an error with your request. 'shop' wasn't specified.");
  }
  if (!bundleId) {
    return new JsonData(false, "error", "There was an error with your request. 'bundleId' wasn't specified.");
  }
  console.log("bundleId", bundleId);
  const bundleBuilder = await prisma.bundleBuilder.findUnique({
    where: {
      id: Number(bundleId),
      deleted: false
    },
    select: {
      id: true,
      user: {
        select: {
          hasAppInstalled: true
        }
      },
      published: true,
      storeUrl: true
    }
  });
  if (isBundleInPreview === "true" && !strict) {
    return new JsonData(true, "success", "Bundle is in preview mode.");
  }
  if (bundleBuilder && (bundleBuilder.id === 98 || bundleBuilder.id === 1)) {
    return new JsonData(true, "success", "Returning test bundle.");
  }
  if (!bundleBuilder || bundleBuilder.storeUrl !== shop) {
    return new JsonData(false, "error", "There was an error with your request. Requested bundle either doesn't exist.");
  }
  if (!bundleBuilder.published) {
    return new JsonData(false, "error", "There was an error with your request. Requested bundle is not active.");
  }
  return new JsonData(true, "success", "Bundle is published and belongs to the store.");
}
const storage = new Storage();
const bucket = process.env.BUCKET_NAME;
class FileStoreRepositoryImpl {
  constructor() {
  }
  async uploadFile(fileName, files) {
    let fileToUpload;
    if (!Array.isArray(files)) {
      fileToUpload = files;
    } else {
      fileToUpload = files.find((file) => {
        return file.name === fileName;
      });
    }
    const fileId = Date.now().toString() + "." + fileToUpload.name.split(".").at(-1);
    const fileContent = await fileToUpload.stream().getReader().read();
    try {
      await storage.bucket(bucket).file(fileId).save(fileContent.value);
    } catch (error) {
      console.log(error);
    }
    const fileUrl = `${process.env.BUCKET_URL}/${fileId}`;
    return fileUrl;
  }
  async getFile(fileUrl) {
    return null;
  }
  deleteFile(fileUrl) {
    return false;
  }
}
const bundleFullStepsFull = {
  steps: {
    include: {
      productInput: {
        include: {
          products: true
        }
      },
      contentInputs: true
    }
  }
};
class CreatedBundleRepository {
  constructor() {
  }
  static async createCreatedBundle(bundleBuilderId, finalPrice, discountAmount, productVariants, addedContent) {
    const createdBundle = await prisma.createdBundle.create({
      data: {
        bundleBuilderId,
        createdAt: /* @__PURE__ */ new Date(),
        finalPrice,
        discountAmount,
        //Extract product variants from all steps
        addedProductVariants: {
          create: productVariants?.map((variant) => {
            return variant;
          })
        },
        //Extract content items from all steps
        addedContent: {
          create: addedContent?.map((content2) => {
            return content2.getContentItems().map((item) => {
              return {
                contentType: item.contentType,
                contentValue: item.value
              };
            });
          }).flat()
        }
      },
      select: {
        id: true
      }
    });
    return createdBundle.id;
  }
}
class AddedContentDto {
  stepNumber;
  contentItems;
  constructor(stepNumber, contentItems) {
    this.stepNumber = stepNumber;
    this.contentItems = contentItems;
  }
  getStepNumber() {
    return this.stepNumber;
  }
  getContentItems() {
    return this.contentItems;
  }
  setStepNumber(stepNumber) {
    this.stepNumber = stepNumber;
  }
  setContentItems(contentItems) {
    this.contentItems = contentItems;
  }
  addContentItem(contentItem) {
    this.contentItems.push(contentItem);
  }
}
class CustomerInputsDto {
  constructor() {
  }
  //Go through the customer inputs and extract the data
  //Extract the productVariant ids and quantities
  //Extract the content types and values (if any)
  //Extract the total price of the products
  static async extractDataFromCustomerInputs(admin, customerInputs, bundle, productVariantService) {
    let addedProductVariants = [];
    let addedContent = [];
    let totalProductPrice = 0;
    await Promise.all(
      customerInputs.map(async (input2) => {
        if (input2.stepType === "PRODUCT") {
          const products = input2.inputs;
          await Promise.all(
            products.map(async (product) => {
              product.id = `gid://shopify/ProductVariant/${product.id}`;
              addedProductVariants.push({
                productVariant: product.id,
                quantity: product.quantity
              });
              if (bundle.pricing === "CALCULATED") {
                const price = await productVariantService.getProductVariantPrice(admin, product.id);
                totalProductPrice += price;
              }
            })
          );
        } else if (input2.stepType === "CONTENT") {
          const contentInputs = input2.inputs;
          const addedContentOnThisStep = new AddedContentDto(input2.stepNumber, []);
          contentInputs.forEach((contentInput) => {
            addedContentOnThisStep.addContentItem({
              contentType: contentInput.type === "file" ? "IMAGE" : "TEXT",
              value: contentInput.value
            });
          });
          addedContent.push(addedContentOnThisStep);
        }
      })
    );
    return { addedProductVariants, addedContent, totalProductPrice };
  }
}
class ShopifyProductVariantRepository {
  constructor() {
  }
  //Get the price of the product variant
  async getProductVariantPrice(admin, productVariantId) {
    const response = await admin.graphql(
      `#graphql
            query getProductVariantPrice($productId: ID!) {
                productVariant(id: $productId) {
                    price
                }
            }`,
      {
        variables: {
          productId: productVariantId
        }
      }
    );
    const data = await response.json();
    return parseFloat(data.data.productVariant.price);
  }
  //Create a new product variant
  async createProductVariant(admin, createdBundleId, shopifyProductId, compareAtPrice, price) {
    const response = await admin.graphql(
      `#graphql
            mutation createProductVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                productVariantsBulkCreate(productId: $productId, variants: $variants) {
                    productVariants {
                        id
                        compareAtPrice
                        price
                    }
                    userErrors {
                        field
                        message
                    }
            }
            }`,
      {
        variables: {
          productId: shopifyProductId,
          variants: [
            {
              compareAtPrice,
              optionValues: [
                {
                  optionName: "Title",
                  name: `Bundle #${createdBundleId}`
                }
              ]
            }
          ]
        }
      }
    );
    const data = (await response.json()).data;
    if (data.productVariantsBulkCreate.userErrors > 0) {
      console.log(data.productVariantsBulkCreate.userErrors);
      throw Error("There was an error creating a bundle builder product variant.");
    }
    const productVariantId = data.productVariantsBulkCreate.productVariants[0].id;
    return productVariantId;
  }
  //Update the product variant relationship
  async updateProductVariantRelationship(admin, variantId, addedProductVariants, price) {
    const response = await admin.graphql(
      `#graphql
          mutation addVariantsToBundleProductVariant($input: [ProductVariantRelationshipUpdateInput!]!) {
            productVariantRelationshipBulkUpdate(input: $input) {
              parentProductVariants {
                id
                price
                compareAtPrice
                productVariantComponents(first: 10) {
                  nodes {
                    id
                    productVariant {
                      id
                      displayName
                    }
                  }
                }
              }
              userErrors {
                code
                field
                message
              }
            }
          }`,
      {
        variables: {
          input: [
            {
              parentProductVariantId: variantId,
              priceInput: {
                calculation: "FIXED",
                price
              },
              productVariantRelationshipsToCreate: addedProductVariants.map((addedProductVariant) => {
                return { id: addedProductVariant.productVariant, quantity: addedProductVariant.quantity };
              })
            }
          ]
        }
      }
    );
    const data = await response.json();
    if (data.data.productVariantRelationshipBulkUpdate.userErrors.length && data.data.productVariantRelationshipBulkUpdate.userErrors.length > 0) {
      return false;
    }
    console.log(data.data.productVariantRelationshipBulkUpdate);
    console.log(data.data.productVariantRelationshipBulkUpdate.parentProductVariants);
    return true;
  }
}
const shopifyProductVariantRepository = new ShopifyProductVariantRepository();
class BundleVariantForCartDto {
  bundleId;
  bundleInputsCustomer = {};
  //This is used to display what the customer has inputed in the cart and checkout page
  bundleTitle;
  bundleInputsAdmin;
  // This is used to display what the customer has inputed in the admin orders page
  constructor(bundleVariantId, bundleTitle, addedBundleContent) {
    this.bundleTitle = bundleTitle;
    const bundleVariantIdArray = bundleVariantId.split("/");
    const bundleVariantIdShopify = bundleVariantIdArray[bundleVariantIdArray.length - 1];
    this.bundleId = parseInt(bundleVariantIdShopify);
    const { customerBundleInputs, adminBundleInputs } = BundleVariantForCartDto.getBundleInputsForCustomerAndAdmin(addedBundleContent, this.bundleId);
    this.bundleInputsCustomer = customerBundleInputs;
    this.bundleInputsAdmin = adminBundleInputs;
  }
  //This method is used to transform the added content into a key-value pair to display what has customer inputed in the cart and admin orders page
  static getBundleInputsForCustomerAndAdmin(addedContent, bundleId) {
    if (addedContent.length === 0) {
      return { customerBundleInputs: {}, adminBundleInputs: "" };
    }
    const lineItemProperties = {};
    let cartAttributes = "";
    lineItemProperties[`_neat_bundles_id`] = `${bundleId}`;
    lineItemProperties[`- :-----Bundle Inputs-----`] = "-";
    addedContent.forEach((addedContentOnStep) => {
      const stepNumber = addedContentOnStep.getStepNumber();
      cartAttributes += "Step #" + stepNumber + ": \n";
      addedContentOnStep.getContentItems().forEach((contentItem, contentItemIndex) => {
        console.log("contentItem", contentItem);
        if (contentItem.contentType === "IMAGE") {
          lineItemProperties[`Step #${stepNumber} - IMAGE URL`] = contentItem.value;
          cartAttributes += "IMAGE URL: " + contentItem.value;
        }
        if (contentItem.contentType === "TEXT" || contentItem.contentType === "NUMBER") {
          if (addedContentOnStep.getContentItems().length > 1) {
            lineItemProperties[`Step #${stepNumber} - input #${contentItemIndex + 1} - ${contentItem.contentType}`] = contentItem.value;
          } else {
            lineItemProperties[`Step #${stepNumber} - ${contentItem.contentType}`] = contentItem.value;
          }
          cartAttributes += contentItem.contentType + ": " + contentItem.value;
        }
        if (contentItemIndex < addedContentOnStep.getContentItems().length - 1) {
          cartAttributes += ", \n";
        }
      });
      if (addedContent.indexOf(addedContentOnStep) < addedContent.length - 1) {
        lineItemProperties[`- :----------------${this.getStringWithNumberOfDashes(stepNumber)}`] = "-";
        cartAttributes += "   \n\n";
      }
    });
    return { customerBundleInputs: lineItemProperties, adminBundleInputs: cartAttributes };
  }
  static getStringWithNumberOfDashes(numberOfDashes) {
    let dashes = "";
    for (let i = 0; i < numberOfDashes; i++) {
      dashes += "-";
    }
    return dashes;
  }
  //Calculate the price of the bundle
  static getFinalBundlePrices(bundle, totalProductPrice) {
    let bundlePrice = 0;
    let bundleCompareAtPrice = bundle.pricing === "CALCULATED" ? totalProductPrice : bundle.priceAmount;
    if (bundle.discountType === "FIXED") {
      bundlePrice = bundleCompareAtPrice - bundle.discountValue;
    } else if (bundle.discountType === "PERCENTAGE") {
      bundlePrice = bundleCompareAtPrice - bundleCompareAtPrice * (bundle.discountValue / 100);
    } else {
      bundlePrice = bundleCompareAtPrice;
    }
    if (bundlePrice < 0) {
      bundlePrice = 0;
    }
    const discountAmount = bundleCompareAtPrice - bundlePrice;
    return { bundlePrice, bundleCompareAtPrice, discountAmount };
  }
}
const action$a = async ({ request }) => {
  const res = await checkPublicAuth(request, true);
  if (!res.ok)
    return json(res, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const bundleBuilderId = url.searchParams.get("bundleId");
  const { admin } = await unauthenticated.admin(shop);
  try {
    const formData = await request.formData();
    const customerInputs = JSON.parse(formData.get("customerInputs"));
    const files = formData.get("files");
    if (!customerInputs) {
      return json(new JsonData(true, "error", "Invalid form data.", []), {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        status: 400
      });
    }
    const bundleBuilder = await prisma.bundleBuilder.findUnique({
      where: {
        id: Number(bundleBuilderId)
      },
      include: bundleFullStepsFull
    });
    let error = false;
    bundleBuilder.steps.forEach((step) => {
      const customerInputsOnThisStep = customerInputs.find((input2) => {
        return input2.stepNumber === step.stepNumber;
      });
      if (!customerInputsOnThisStep || customerInputsOnThisStep?.stepType != step.stepType) {
        error = true;
        return;
      }
      if (step.stepType === "PRODUCT") {
        const maxProductsOnThisStep = step.productInput?.maxProductsOnStep;
        const minProductsOnThisStep = step.productInput?.minProductsOnStep;
        const actualProductsOnThisStep = customerInputsOnThisStep?.inputs;
        if (actualProductsOnThisStep.length < minProductsOnThisStep || actualProductsOnThisStep.length > maxProductsOnThisStep) {
          error = true;
          return;
        }
        const allowMultipleSelections = step.productInput?.allowProductDuplicates;
        if (!allowMultipleSelections) {
          actualProductsOnThisStep.forEach((product) => {
            if (product.quantity > 1) {
              error = true;
            }
          });
        }
      } else if (step.stepType === "CONTENT") {
        const contentInputs = customerInputsOnThisStep?.inputs;
        step.contentInputs?.forEach((contentInput) => {
          if (contentInput.inputType === "NONE")
            return;
          const contentInputsOnThisStep = contentInputs.find((input2) => {
            return input2.id == contentInput.id;
          });
          if (contentInputsOnThisStep.value.length == 0 && contentInput.required && contentInput.inputType != "IMAGE") {
            error = true;
            return;
          }
          if (contentInput.inputType != "IMAGE" && contentInputsOnThisStep.value.length > contentInput.maxChars) {
            error = true;
            return;
          }
          if (contentInputsOnThisStep.type === "file" && contentInput.inputType != "IMAGE") {
            error = true;
            return;
          }
          if (contentInputsOnThisStep.type === "text" && !(contentInput.inputType === "TEXT" || contentInput.inputType === "NUMBER")) {
            error = true;
            return;
          }
        });
      }
    });
    if (error) {
      console.log(error);
      return json(new JsonData(false, "error", "Invalid form data.", []), {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        status: 200
      });
    }
    const { addedProductVariants, addedContent, totalProductPrice } = await CustomerInputsDto.extractDataFromCustomerInputs(
      admin,
      customerInputs,
      bundleBuilder,
      shopifyProductVariantRepository
    );
    if (files) {
      const fileStoreService = new FileStoreRepositoryImpl();
      await Promise.all(
        addedContent.map(async (contentItem) => {
          await Promise.all(
            contentItem.getContentItems().map(async (contentInput) => {
              if (contentInput.contentType === "IMAGE") {
                const imageUrl = await fileStoreService.uploadFile(contentInput.value, files);
                contentInput.value = imageUrl;
              }
            })
          );
        })
      );
    }
    const { bundlePrice, bundleCompareAtPrice, discountAmount } = BundleVariantForCartDto.getFinalBundlePrices(bundleBuilder, totalProductPrice);
    const doesBundleBuilderProductExist = await shopifyBundleBuilderProductRepository.checkIfProductExists(admin, bundleBuilder.shopifyProductId);
    if (!doesBundleBuilderProductExist) {
      const newBundleBuilderProductId = await shopifyBundleBuilderProductRepository.createBundleProduct(admin, bundleBuilder.title, shop);
      if (newBundleBuilderProductId) {
        bundleBuilder.shopifyProductId = newBundleBuilderProductId;
      }
    } else {
      const numOfBundleBuilderProductVariants = await shopifyBundleBuilderProductRepository.getNumberOfProductVariants(admin, bundleBuilder.shopifyProductId);
      if (numOfBundleBuilderProductVariants >= 100) {
        const newBundleBuilderProductId = await shopifyBundleBuilderProductRepository.createBundleProduct(admin, bundleBuilder.title, shop);
        if (newBundleBuilderProductId) {
          bundleBuilder.shopifyProductId = newBundleBuilderProductId;
        }
      }
    }
    const newCreatedBundleId = await CreatedBundleRepository.createCreatedBundle(bundleBuilder.id, bundlePrice, discountAmount, addedProductVariants, addedContent);
    const newVariantId = await shopifyProductVariantRepository.createProductVariant(
      admin,
      newCreatedBundleId,
      bundleBuilder.shopifyProductId,
      bundleCompareAtPrice,
      bundlePrice
    );
    const success = await shopifyProductVariantRepository.updateProductVariantRelationship(admin, newVariantId, addedProductVariants, bundlePrice);
    const bundleVariantForCart = new BundleVariantForCartDto(newVariantId, bundleBuilder.title, addedContent);
    if (!success) {
      return json(new JsonData(false, "error", "Error while adding the bundle to the cart.", []), {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        status: 200
      });
    }
    return json(new JsonData(true, "success", "Bundle succesfuly added to cart.", [], bundleVariantForCart), {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  } catch (err) {
    console.log(err);
    console.log("There was an error");
    return json(new JsonData(false, "error", "Invalid form data.", []), {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  }
};
const route17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$a
}, Symbol.toStringTag, { value: "Module" }));
const loader$g = async ({ request }) => {
  const res = await checkPublicAuth(request);
  if (!res.ok)
    return json(res, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  const url = new URL(request.url);
  const bundleBuilderId = url.searchParams.get("bundleId");
  const storeUrl = url.searchParams.get("shop");
  const cacheKey = new ApiCacheKeyService(storeUrl);
  const cache = new ApiCacheService(cacheKey.getBundleSettingsKey(url.searchParams.get("bundleId")));
  const cacheData = await cache.readCache();
  if (cacheData) {
    return json(new JsonData(true, "success", "Bundle settings succesfuly retirieved.", [], cacheData, true), {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  } else {
    try {
      let bundleSettings = await prisma.bundleSettings.findUnique({
        where: {
          bundleBuilderId: Number(bundleBuilderId)
        }
      });
      if (!bundleSettings) {
        return json(new JsonData(false, "error", "There was an error with your request. 'stepNum' doesn't exist for this bundle."), {
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          status: 200
        });
      }
      await cache.writeCache(bundleSettings);
      return json(new JsonData(false, "success", "Bundle settings succesfuly retirieved.", [], bundleSettings), {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        status: 200
      });
    } catch (error) {
      console.log(error);
    }
  }
};
const route18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$g
}, Symbol.toStringTag, { value: "Module" }));
const loader$f = async ({ request }) => {
  const res = await checkPublicAuth(request);
  if (!res.ok)
    return json(res, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  const url = new URL(request.url);
  const stepNumber = url.searchParams.get("stepNum");
  const bundleBuilderId = url.searchParams.get("bundleId");
  const shop = url.searchParams.get("shop");
  const cacheKey = new ApiCacheKeyService(shop);
  const cacheService = new ApiCacheService(cacheKey.getStepKey(stepNumber, bundleBuilderId));
  const cacheData = await cacheService.readCache();
  if (cacheData) {
    return json(new JsonData(true, "success", "Bundle succesfuly retirieved.", [], cacheData, true), {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  } else {
    try {
      const bundleStep = await prisma.bundleStep.findMany({
        where: {
          bundleBuilderId: Number(bundleBuilderId),
          stepNumber: Number(stepNumber)
        },
        include: bundleStepFull
      });
      if (!bundleStep) {
        return json(new JsonData(false, "error", "There was an error with your request. Requested step either doesn't exist or it's not active."), {
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          status: 200
        });
      }
      await cacheService.writeCache(bundleStep);
      return json(new JsonData(false, "success", "Bundle succesfuly retirieved.", [], bundleStep), {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        status: 200
      });
    } catch (error) {
      console.error(error);
    }
  }
};
const route19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$f
}, Symbol.toStringTag, { value: "Module" }));
const loader$e = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const action$9 = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const action2 = formData.get("action");
  switch (action2) {
    case "dismissHomePageBanner": {
      break;
    }
    default: {
      return json$1(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
};
function Index$a() {
  const nav = useNavigation();
  const isLoading = nav.state !== "idle";
  const navigate = useNavigate();
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Page,
    {
      title: "Want to request a feature?",
      backAction: {
        content: "Back",
        onAction: async () => {
          navigate(-1);
        }
      },
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
        /* @__PURE__ */ jsx(Text, { as: "p", children: "My team and I have been working hard to make NeatBundles into a product you love and want to share with others, but we understand that there is always space for improvement." }),
        /* @__PURE__ */ jsx(Text, { as: "p", children: "If you have a feature request or a suggestion, we'd love to hear it! Feel free to send us an email describing the feature that you would like Neat Bundles to have. We will do our best to implement that feature as soon as possible." }),
        /* @__PURE__ */ jsxs(Text, { as: "p", children: [
          "Send your feature requests to",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "mailto:contact@neatmerchant.com", target: "_blank", children: "contact@neatmerchant.com" }),
          ", and we will reply as soon as possible. Every feature request will be personally reviewed by me and my team and considered for implementation."
        ] }),
        /* @__PURE__ */ jsx(Text, { as: "p", children: "Thank you for your continued support and for helping us make NeatBundles better every day." }),
        /* @__PURE__ */ jsx(Text, { as: "p", alignment: "end", children: "Jure Reljanovic, the creator of Neat Merchant and NeatBundles" })
      ] })
    }
  ) }) });
}
const route20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$9,
  default: Index$a,
  loader: loader$e
}, Symbol.toStringTag, { value: "Module" }));
class GlobalSettingsRepository {
  async getSettingsByStoreUrl(storeUrl) {
    const globalSettings = await prisma.globalSettings.findUnique({
      where: {
        storeUrl
      }
    });
    return globalSettings;
  }
  async updateGlobalSettings(newGlobalSettings) {
    const updatedSettings = await prisma.globalSettings.update({
      where: {
        id: newGlobalSettings.id
      },
      data: newGlobalSettings
    });
    if (!updatedSettings) {
      return false;
    }
    return true;
  }
}
const globalSettingsRepository = new GlobalSettingsRepository();
const stickyNavMobile = "/assets/navStickyMobile-pwuzWHr9.png";
const normalNavMobile = "/assets/navNormalMobile-Cg-oHKqj.png";
const normalNavDesktop = "/assets/navNormalDesktop-CVZqIvWA.png";
const stickyNavDesktop = "/assets/navStickyDesktop-yJA4uUmx.png";
const divWithFlexCenterContent = "_divWithFlexCenterContent_xey5s_1";
const sticky = "_sticky_xey5s_11";
const overflow = "_overflow_xey5s_18";
const editorTab = "_editorTab_xey5s_22";
const activeEditorTab = "_activeEditorTab_xey5s_34";
const image = "_image_xey5s_39";
const active = "_active_xey5s_34";
const styles$3 = {
  divWithFlexCenterContent,
  sticky,
  overflow,
  editorTab,
  activeEditorTab,
  image,
  active
};
function Index$9({
  value,
  selectedValue,
  imgSrc,
  updateHandler,
  label: label2,
  attributeKey,
  horizontal
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("input", { type: "radio", id: "sticky", name: "displayMobileStepNavigation", defaultValue: value, hidden: true }),
    /* @__PURE__ */ jsx("label", { htmlFor: "displayMobileStepNavigation", "aria-label": "sticky", children: /* @__PURE__ */ jsxs("div", { className: styles$3.divWithFlexCenterContent, children: [
      /* @__PURE__ */ jsx(Text, { as: "p", fontWeight: "bold", variant: "headingMd", children: label2 }),
      /* @__PURE__ */ jsx(
        "img",
        {
          src: imgSrc,
          alt: "Sticky navigation",
          width: !horizontal ? 220 : 370,
          onClick: () => {
            updateHandler(attributeKey, value);
          },
          className: `${styles$3.image} ${selectedValue === value ? styles$3.active : ""}`
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          disabled: selectedValue === value,
          onClick: () => {
            updateHandler(attributeKey, value);
          },
          children: selectedValue !== value ? "Select" : "Selected"
        }
      )
    ] }) })
  ] });
}
const loader$d = async ({ request }) => {
  const { redirect: redirect2, session } = await authenticate.admin(request);
  const [globalSettings, user] = await Promise.all([globalSettingsRepository.getSettingsByStoreUrl(session.shop), userRepository.getUserByStoreUrl(session.shop)]);
  if (!globalSettings || !user)
    return redirect2("/app");
  const bundleBuilder = await bundleBuilderRepository.getFirstActiveBundleBuilder(session.shop);
  return json(
    new JsonData(true, "success", "Global settings retrieved", [], {
      user,
      appId: process.env.SHOPIFY_BUNDLE_UI_ID,
      bundleBuilderHandle: bundleBuilder?.bundleBuilderPageHandle,
      globalSettings
    })
  );
};
const action$8 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action2 = formData.get("action");
  switch (action2) {
    case "updateSettings": {
      try {
        const newGlobalSettings = JSON.parse(formData.get("globalSettings"));
        await globalSettingsRepository.updateGlobalSettings(newGlobalSettings);
        const cacheKey = new ApiCacheKeyService(session.shop);
        await ApiCacheService.singleKeyDelete(cacheKey.getGlobalSettingsKey());
      } catch (error) {
        console.error(error);
      }
    }
    default: {
      return json(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
};
function Index$8() {
  const nav = useNavigation();
  const navigate = useNavigate();
  const shopify2 = useAppBridge();
  const isLoading = nav.state === "loading";
  const isSubmitting = nav.state === "submitting";
  const submit = useSubmit();
  const loaderData = useLoaderData();
  const data = loaderData.data;
  const serverGlobalSettings = data.globalSettings;
  const mappedGlobalSettings = {
    ...serverGlobalSettings,
    stepNavigationTypeDesktop: serverGlobalSettings.stepNavigationTypeDesktop,
    stepNavigationTypeMobile: serverGlobalSettings.stepNavigationTypeMobile
  };
  const [globalSettingsState, setGlobalSettingsState] = useState(mappedGlobalSettings);
  const [activeMode, setActiveMode] = useState("desktop");
  const saveGlobalSettingsHandler = async () => {
    await shopify2.saveBar.hide("my-save-bar");
    const form2 = new FormData();
    form2.append("action", "updateSettings");
    form2.append("globalSettings", JSON.stringify(globalSettingsState));
    submit(form2, { method: "POST", navigate: true });
  };
  const updateHandler = (attributeKey, value) => {
    console.log(attributeKey, value);
    setGlobalSettingsState((prev) => ({
      ...prev,
      [attributeKey]: value
    }));
  };
  useEffect(() => {
    JSON.stringify(globalSettingsState) !== JSON.stringify(serverGlobalSettings) && shopify2.saveBar.show("my-save-bar");
  }, [globalSettingsState, serverGlobalSettings]);
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading || isSubmitting ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(SaveBar, { id: "my-save-bar", children: [
      /* @__PURE__ */ jsx("button", { variant: "primary", onClick: saveGlobalSettingsHandler }),
      /* @__PURE__ */ jsx("button", { onClick: () => shopify2.saveBar.hide("my-save-bar") })
    ] }),
    /* @__PURE__ */ jsx(
      Page,
      {
        fullWidth: true,
        backAction: {
          content: "back",
          onAction: async () => {
            await shopify2.saveBar.leaveConfirmation();
            navigate(-1);
          }
        },
        title: "Global settings",
        subtitle: "Edit the behavior of all bundles",
        children: /* @__PURE__ */ jsxs(Form, { method: "POST", "data-discard-confirmation": true, "data-save-bar": true, children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "action", defaultValue: "updateSettings" }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "globalSettings", defaultValue: JSON.stringify(globalSettingsState) }),
          !data.bundleBuilderHandle ? /* @__PURE__ */ jsx(Banner, { title: "Uups, there are no bundles created.", tone: "warning", onDismiss: () => {
          }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
            /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "Please create your first bundle, and then come back here to edit settings." }),
            /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Button, { variant: "secondary", url: "/app", children: "Create bundle" }) })
          ] }) }) : /* @__PURE__ */ jsxs(BlockStack, { gap: BigGapBetweenSections, children: [
            /* @__PURE__ */ jsxs(BlockStack, { gap: LargeGapBetweenSections, children: [
              /* @__PURE__ */ jsxs(InlineGrid, { columns: { xs: "1fr", md: "3fr 4fr" }, gap: "400", children: [
                /* @__PURE__ */ jsx(Box, { as: "section", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
                  /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingLg", children: "Colors" }),
                  /* @__PURE__ */ jsx(Text, { as: "p", children: "Edit colors to match your brand." })
                ] }) }),
                /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
                  /* @__PURE__ */ jsx(Text, { as: "p", children: "All styling changes are done using Shopify's native theme editor." }),
                  /* @__PURE__ */ jsx(Text, { as: "p", children: "Just click 'Edit styles'. The editing process is the same as if you were editing your theme." }),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "primary",
                      target: "_blank",
                      url: `https://${data.user.storeUrl}/admin/themes/current/editor?context=apps&previewPath=/pages/${data.bundleBuilderHandle}?neatBundlePreview=true&appEmbed=${data.appId}/${"embed_block"}`,
                      children: "Edit colors"
                    }
                  )
                ] }) })
              ] }),
              /* @__PURE__ */ jsx(Divider, {}),
              /* @__PURE__ */ jsx(InlineStack, { align: "center", children: /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingLg", children: /* @__PURE__ */ jsx(InlineStack, { children: "The settings below apply separately for desktop and mobile." }) }) }),
              /* @__PURE__ */ jsx("div", { className: styles$3.sticky, children: /* @__PURE__ */ jsx(Card, { padding: "200", children: /* @__PURE__ */ jsxs(InlineStack, { gap: GapBetweenTitleAndContent, align: "space-between", blockAlign: "center", children: [
                /* @__PURE__ */ jsxs(Text, { as: "h3", variant: "headingMd", children: [
                  "You are currently editing settings for: ",
                  /* @__PURE__ */ jsx("u", { children: activeMode === "desktop" ? "Desktop" : "Mobile" })
                ] }),
                /* @__PURE__ */ jsxs(InlineStack, { gap: GapInsideSection, children: [
                  /* @__PURE__ */ jsx(Tooltip, { content: "Desktop", children: /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "secondary",
                      icon: DesktopIcon,
                      disabled: activeMode === "desktop",
                      onClick: () => {
                        setActiveMode("desktop");
                      }
                    }
                  ) }),
                  /* @__PURE__ */ jsx(Tooltip, { content: "Mobile", children: /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "secondary",
                      icon: MobileIcon,
                      disabled: activeMode === "mobile",
                      onClick: () => {
                        setActiveMode("mobile");
                      }
                    }
                  ) })
                ] })
              ] }) }) }),
              /* @__PURE__ */ jsx(Divider, {}),
              /* @__PURE__ */ jsxs(InlineGrid, { columns: { xs: "1fr", md: `${activeMode === "desktop" ? "2fr 5fr" : "3fr 4fr"}` }, gap: "400", children: [
                /* @__PURE__ */ jsx(Box, { as: "section", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
                  /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingLg", children: "Step navigation" }),
                  /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", children: "Navigation can be sticky or normal. Sticky navigation will be always visible on the screen, while normal navigation is only visible when the user scrolls down." })
                ] }) }),
                /* @__PURE__ */ jsx(Card, { children: activeMode === "desktop" ? /* @__PURE__ */ jsx(BlockStack, { gap: GapBetweenSections, children: /* @__PURE__ */ jsxs(InlineStack, { gap: GapInsideSection, align: "center", blockAlign: "center", children: [
                  /* @__PURE__ */ jsx(
                    Index$9,
                    {
                      label: "Normal navigation",
                      imgSrc: normalNavDesktop,
                      attributeKey: "stepNavigationTypeDesktop",
                      selectedValue: globalSettingsState.stepNavigationTypeDesktop,
                      value: "NORMAL",
                      updateHandler,
                      horizontal: true
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Index$9,
                    {
                      imgSrc: stickyNavDesktop,
                      label: "Sticky navigation",
                      attributeKey: "stepNavigationTypeDesktop",
                      selectedValue: globalSettingsState.stepNavigationTypeDesktop,
                      value: "STICKY",
                      updateHandler,
                      horizontal: true
                    }
                  )
                ] }) }) : /* @__PURE__ */ jsx(BlockStack, { gap: GapBetweenSections, children: /* @__PURE__ */ jsxs(InlineStack, { gap: GapInsideSection, align: "center", blockAlign: "center", children: [
                  /* @__PURE__ */ jsx(
                    Index$9,
                    {
                      label: "Normal navigation",
                      imgSrc: normalNavMobile,
                      attributeKey: "stepNavigationTypeMobile",
                      selectedValue: globalSettingsState.stepNavigationTypeMobile,
                      value: "NORMAL",
                      updateHandler
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Index$9,
                    {
                      imgSrc: stickyNavMobile,
                      label: "Sticky navigation",
                      attributeKey: "stepNavigationTypeMobile",
                      selectedValue: globalSettingsState.stepNavigationTypeMobile,
                      value: "STICKY",
                      updateHandler
                    }
                  )
                ] }) }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Box, { width: "full", children: [
              /* @__PURE__ */ jsx(BlockStack, { inlineAlign: "end", children: /* @__PURE__ */ jsx(Button, { variant: "primary", submit: true, children: "Save" }) }),
              /* @__PURE__ */ jsxs(FooterHelp, { children: [
                "Are you stuck? ",
                /* @__PURE__ */ jsx(Link, { to: "/app/help", children: "Get help" }),
                " from us, or ",
                /* @__PURE__ */ jsx(Link, { to: "/app/feature-request", children: "suggest new features" }),
                "."
              ] })
            ] })
          ] })
        ] })
      }
    )
  ] }) });
}
const route21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$8,
  default: Index$8,
  loader: loader$d
}, Symbol.toStringTag, { value: "Module" }));
const loader$c = async ({ request }) => {
  await authenticate.public.appProxy(request);
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const cacheKey = new ApiCacheKeyService(shop);
  const cache = new ApiCacheService(cacheKey.getGlobalSettingsKey());
  const cacheData = await cache.readCache();
  if (cacheData) {
    return json(new JsonData(true, "success", "Global settings succesfuly retirieved.", [], cacheData, true), {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  } else {
    try {
      const globalSettings = await globalSettingsRepository.getSettingsByStoreUrl(shop);
      await cache.writeCache(globalSettings);
      return json(new JsonData(false, "success", "Global settings succesfuly retirieved.", [], globalSettings), {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        status: 200
      });
    } catch (error) {
      console.error(error);
    }
  }
};
const route22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$c
}, Symbol.toStringTag, { value: "Module" }));
const tutorialTumbnail = "/assets/tutorial_tumbnail-CUIVaP1I.png";
const loader$b = async ({ request }) => {
  const { session, redirect: redirect2 } = await authenticate.admin(request);
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  const url = new URL(request.url);
  const installSuccessBanner = url.searchParams.get("installSuccess");
  return json$1(new JsonData(true, "success", "User successfuly retrieved", [], { installSuccessBanner: installSuccessBanner === "true", user }));
};
const action$7 = async ({ request }) => {
  const { redirect: redirect2, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action2 = formData.get("action");
  switch (action2) {
    case "hideTutorial": {
      const user = await userRepository.getUserByStoreUrl(session.shop);
      if (!user)
        return redirect2("/app");
      await userRepository.updateUser({ ...user, showTutorialBanner: false });
      return redirect2("bundles");
    }
    default: {
      return json$1(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
};
function Index$7() {
  const nav = useNavigation();
  const isLoading = nav.state === "loading";
  const navigateSubmit = useNavigateSubmit();
  const params = useParams();
  const loaderResponse = useLoaderData();
  const data = loaderResponse.data;
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Page,
    {
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: "800", children: [
        /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
          data.installSuccessBanner && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Banner, { title: "Installation successful, congratulations!", tone: "success", onDismiss: () => {
            }, children: /* @__PURE__ */ jsx(BlockStack, { gap: GapInsideSection, children: /* @__PURE__ */ jsx(Text, { as: "p", children: "Congratulations on successfully installing our app. Let's now start creating the first bundle for your customers. The whole process should take less than 5 minutes." }) }) }),
            /* @__PURE__ */ jsx(Divider, {})
          ] }),
          /* @__PURE__ */ jsx(Outlet, {})
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
          data.user.showTutorialBanner && /* @__PURE__ */ jsx(
            MediaCard,
            {
              title: "Watch a short tutorial to get quickly started",
              primaryAction: {
                content: "Watch tutorial",
                onAction: () => {
                },
                icon: ExternalIcon,
                url: "https://youtu.be/Mbzu7mI1jDE",
                target: "_blank"
              },
              size: "small",
              description: "We recommend watching this short tutorial to get started with using NeatBundles.",
              popoverActions: [
                {
                  content: "Dismiss",
                  onAction: () => {
                    navigateSubmit("hideTutorial", `/app/users/${params.userid}`);
                  }
                }
              ],
              children: /* @__PURE__ */ jsx(VideoThumbnail, { videoLength: 80, thumbnailUrl: tutorialTumbnail, onClick: () => console.log("clicked") })
            }
          ),
          /* @__PURE__ */ jsx(Banner, { title: "Enjoying the app?", tone: "success", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
            /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx("p", { children: "We'd highly appreciate getting a review!" }) }),
            /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Button, { children: "⭐ Leave a review" }) })
          ] }) }),
          /* @__PURE__ */ jsxs(FooterHelp, { children: [
            "Are you stuck? ",
            /* @__PURE__ */ jsx(Link, { to: "/app/help", children: "Get help" }),
            " from us, or ",
            /* @__PURE__ */ jsx(Link, { to: "/app/feature-request", children: "suggest new features" }),
            "."
          ] })
        ] })
      ] })
    }
  ) }) });
}
const route23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$7,
  default: Index$7,
  loader: loader$b
}, Symbol.toStringTag, { value: "Module" }));
const activateVideo = "/assets/installation-video-BzHrgB9J.mp4";
class ShopifyThemesRepository {
  async getAllThemes(admin) {
    const response = await admin.graphql(`
            #graphql
            query getThemes {
                themes(first: 20) {
                    nodes {
                        name
                        processing
                        role
                        files(filenames: ["sections*.json", "templates*.json"]) {
                            nodes {
                                filename
                                body {
                                    __typename
                                }
                            }
                        }
                    }
                }
            }`);
    const data = (await response.json()).data.themes;
    return data.nodes;
  }
  //  get main theme with sections and templates
  async getMainThemeWithTandS(admin) {
    const response = await admin.graphql(`
            #graphql
            query getMainThemeWithTandS {
                themes(first: 1, roles: MAIN) {
                    nodes {
                        name
                        processing
                        role
                        files(filenames: ["sections*.json", "templates*.json"]) {
                            nodes {
                                filename
                                body {
                                    __typename
                                    ... on OnlineStoreThemeFileBodyText {
                                        content
                                    }

                                }
                            }
                        }
                    }
                }
            }`);
    const data = (await response.json()).data.themes;
    return data.nodes[0];
  }
  async getMainThemeWithSettings(admin) {
    const response = await admin.graphql(`
            #graphql
            query getMainThemeWithSettings {
                themes(first: 1, roles: MAIN) {
                    nodes {
                        name
                        processing
                        role
                        files(filenames: ["*settings_data.json"]) {
                            nodes {
                                filename
                                body {
                                    __typename
                                    ... on OnlineStoreThemeFileBodyText {
                                        content
                                    }

                                }
                            }
                        }
                    }
                }
            }`);
    const data = (await response.json()).data.themes;
    return data.nodes[0];
  }
}
const shopifyThemesRepository = new ShopifyThemesRepository();
function parseMainPageBody(content2) {
  const jsonMatch = content2.match(/{[\s\S]*}/);
  if (jsonMatch) {
    try {
      const jsonString = jsonMatch[0].trim();
      const jsonObject = JSON.parse(jsonString);
      return jsonObject;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  } else {
    console.error("No JSON found in the log string");
    return null;
  }
}
const loader$a = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const thankYouBanner = url.searchParams.get("thankYou");
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect$1("/app");
  const activeTheme = await shopifyThemesRepository.getMainThemeWithTandS(admin);
  let activeThemeCompatible = true;
  try {
    if (!activeTheme.files || activeTheme.files.nodes.length === 0) {
      activeThemeCompatible = false;
      throw Error("Theme not compatible, there are no .json templates in active theme.");
    }
    const pageTemplate = activeTheme.files.nodes.filter((file) => file.filename === "templates/page.json");
    if (!pageTemplate)
      throw Error("There is no template/page.json file in active theme.");
    const templateBody = pageTemplate[0].body;
    if (templateBody.__typename === "OnlineStoreThemeFileBodyText") {
      const bodyContent = parseMainPageBody(templateBody.content);
      const mainSection = Object.entries(bodyContent.sections).find(([id, section]) => id === "main" || section.type.startsWith("main-"));
      if (!mainSection) {
        activeThemeCompatible = false;
        throw Error("Theme not compatible, there is no 'main' section in the 'template/page.json'.");
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    return json$1({
      ...new JsonData(
        true,
        "success",
        "Installation page",
        [],
        [
          {
            displayThankYouBaner: thankYouBanner === "true",
            storeUrl: user.storeUrl,
            appId: process.env.SHOPIFY_BUNDLE_UI_ID,
            activeTheme: { name: activeTheme.name, compatible: activeThemeCompatible }
          }
        ]
      )
    });
  }
};
const action$6 = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return "/app";
  const formData = await request.formData();
  const action2 = formData.get("action");
  switch (action2) {
    case "FINISH_INSTALL": {
      try {
        const mainTheme = await shopifyThemesRepository.getMainThemeWithSettings(admin);
        if (!mainTheme.files || mainTheme.files.nodes.length === 0) {
          throw Error("Theme not compatible, there are no .json templates in active theme.");
        }
        const themeSettings = mainTheme.files?.nodes[0];
        if (themeSettings.body.__typename === "OnlineStoreThemeFileBodyText") {
          const bodyContent = parseMainPageBody(themeSettings.body.content);
          const neatBundlesEmbedBlock = Object.entries(bodyContent.current.blocks).filter(([blockId, block]) => {
            if (block.type.includes(process.env.SHOPIFY_BUNDLE_UI_ID)) {
              if (!block.disabled) {
                return true;
              }
            }
            return false;
          })[0];
          if (!neatBundlesEmbedBlock) {
            user.completedInstallation = false;
            await userRepository.updateUser(user);
            throw Error("App not activated.");
          }
          user.completedInstallation = true;
          await userRepository.updateUser(user);
          return redirect$1(`/app/users/${user.id}/bundles?installSuccess=true`);
        }
      } catch (err) {
        console.log(err);
        return json$1(
          {
            ...new JsonData(
              false,
              "error",
              "Neat Bundels hasn't been properly activated. If you've already activated it, please try deactivating it and activating it again. If the errror continues, feel free to reach us as support@neatmerchant.com."
            )
          },
          { status: 200 }
        );
      }
    }
    default: {
      return json$1(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
};
function Index$6() {
  const nav = useNavigation();
  const isLoading = nav.state !== "idle";
  const loaderResponse = useLoaderData();
  const actionResponse = useActionData();
  const data = loaderResponse.data[0];
  const navigate = useNavigate();
  useEffect(() => {
    scrollTo(0, 0);
  }, [actionResponse]);
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Page,
    {
      title: "Installation",
      backAction: {
        content: "Back",
        onAction: async () => {
          navigate(-1);
        }
      },
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: LargeGapBetweenSections, id: "top", children: [
        actionResponse && actionResponse !== "/app" && !actionResponse.ok && actionResponse.message ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Banner, { title: "App wasn't detected in your theme.", tone: "critical", onDismiss: () => {
          }, children: /* @__PURE__ */ jsx(BlockStack, { gap: GapInsideSection, children: /* @__PURE__ */ jsx(Text, { as: "p", children: actionResponse.message }) }) }),
          /* @__PURE__ */ jsx(Divider, {})
        ] }) : null,
        /* @__PURE__ */ jsxs(InlineGrid, { columns: { xs: "1fr", md: "2fr 5fr" }, gap: "400", children: [
          /* @__PURE__ */ jsx(Box, { as: "section", children: /* @__PURE__ */ jsx(BlockStack, { gap: "400", children: /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Video tutorial" }) }) }),
          /* @__PURE__ */ jsx(
            MediaCard,
            {
              title: "Watch a short tutorial to get quickly started with NeatBundles",
              primaryAction: {
                content: "Watch tutorial",
                icon: ExternalIcon,
                url: "https://youtu.be/Mbzu7mI1jDE",
                target: "_blank"
              },
              size: "small",
              description: "We recommend watching this short tutorial to get quickly started with installation and creating your first bundles.",
              children: /* @__PURE__ */ jsx(VideoThumbnail, { videoLength: 80, thumbnailUrl: tutorialTumbnail, onClick: () => console.log("clicked") })
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(InlineGrid, { columns: { xs: "1fr", md: "2fr 5fr" }, gap: "400", children: [
          /* @__PURE__ */ jsx(Box, { as: "section", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
            /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingXl", children: "App activation" }),
            /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", children: "Follow these 3 steps to active the Bundles app." })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(InlineStack, { gap: GapInsideSection, align: "center", blockAlign: "start", children: [
            /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, align: "end", children: [
              /* @__PURE__ */ jsxs(BlockStack, { children: [
                /* @__PURE__ */ jsxs(Text, { as: "p", children: [
                  '1. Click the "',
                  /* @__PURE__ */ jsx("b", { children: "Activate app" }),
                  '" button'
                ] }),
                /* @__PURE__ */ jsxs(Text, { as: "p", children: [
                  '2. Click "',
                  /* @__PURE__ */ jsx("b", { children: "Save" }),
                  '" in Shopify theme editor'
                ] }),
                /* @__PURE__ */ jsx(Text, { as: "p", children: "3. You're all done" })
              ] }),
              /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(InlineStack, { align: "end", children: /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "primary",
                  target: "_blank",
                  url: `https://${data.storeUrl}/admin/themes/current/editor?context=apps&activateAppId=${data.appId}/${"embed_block"}`,
                  children: "Activate app"
                }
              ) }) })
            ] }),
            /* @__PURE__ */ jsx("video", { src: activateVideo, autoPlay: true, muted: true, width: 370, loop: true })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(Divider, {}),
        /* @__PURE__ */ jsxs(InlineGrid, { columns: { xs: "1fr", md: "2fr 5fr" }, gap: "400", children: [
          /* @__PURE__ */ jsx(Box, { as: "section", children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
            /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingMd", children: "Theme compatibility" }),
            /* @__PURE__ */ jsxs(Text, { as: "p", variant: "bodyMd", children: [
              "NeatBundles is compatible with all",
              " ",
              /* @__PURE__ */ jsx(Link, { to: "https://www.shopify.com/partners/blog/shopify-online-store", target: "_blank", children: "Online store 2.0" }),
              " ",
              "themes."
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(BlockStack, { children: data.activeTheme.compatible ? /* @__PURE__ */ jsxs(InlineStack, { gap: GapBetweenSections, children: [
            /* @__PURE__ */ jsxs(InlineStack, { gap: GapInsideSection, children: [
              /* @__PURE__ */ jsxs(Text, { as: "h3", children: [
                "Your active theme ",
                /* @__PURE__ */ jsx("b", { children: data.activeTheme.name }),
                " is compatible with NeatBundles."
              ] }),
              /* @__PURE__ */ jsx(Badge, { tone: "success", icon: CheckIcon, children: "Theme compatible" })
            ] }),
            /* @__PURE__ */ jsx(Text, { as: "p", fontWeight: "bold", children: "If you change your theme, make sure to come back here and check if NeatBundles supports your new theme." }),
            /* @__PURE__ */ jsxs(Text, { as: "p", children: [
              "If you have trouble activating the app, send us an email at",
              " ",
              /* @__PURE__ */ jsx(Link, { to: "mailto:support@neatmerchantcom", children: "support@neatmerchant.com" }),
              " and we will help you with the activation."
            ] })
          ] }) : /* @__PURE__ */ jsxs(InlineStack, { gap: GapInsideSection, children: [
            /* @__PURE__ */ jsxs(InlineStack, { gap: GapInsideSection, children: [
              /* @__PURE__ */ jsxs(Text, { as: "h3", children: [
                "Your theme ",
                /* @__PURE__ */ jsx("b", { children: data.activeTheme.name }),
                " is unfortunately not compatible with NeatBundles."
              ] }),
              /* @__PURE__ */ jsx(Badge, { tone: "critical", icon: XSmallIcon, children: "Theme not compatible" })
            ] }),
            /* @__PURE__ */ jsx(Text, { as: "p", children: "You are either using a custom theme or Online store 1.0 theme. " }),
            /* @__PURE__ */ jsxs(Text, { as: "p", children: [
              "Send us an email at ",
              /* @__PURE__ */ jsx(Link, { to: "mailto:support@neatmerchantcom", children: "support@neatmerchant.com" }),
              " and we can help you integrate our app with your theme. Exept in some extreme cases (very old or poorly designed theme) ",
              /* @__PURE__ */ jsx("b", { children: "integration will be free of charge." })
            ] })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsx(Box, { width: "full", children: /* @__PURE__ */ jsx(BlockStack, { inlineAlign: "end", children: /* @__PURE__ */ jsxs(Form, { method: "post", children: [
          /* @__PURE__ */ jsx("input", { type: "text", name: "action", defaultValue: "FINISH_INSTALL", hidden: true }),
          /* @__PURE__ */ jsx(Button, { variant: "primary", submit: true, children: "Finish installation" })
        ] }) }) }),
        /* @__PURE__ */ jsxs(FooterHelp, { children: [
          "Are you stuck? ",
          /* @__PURE__ */ jsx(Link, { to: "/app/help", children: "Get help" }),
          " from us, or ",
          /* @__PURE__ */ jsx(Link, { to: "/app/feature-request", children: "suggest new features" }),
          "."
        ] })
      ] })
    }
  ) }) });
}
const route24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6,
  default: Index$6,
  loader: loader$a
}, Symbol.toStringTag, { value: "Module" }));
const loader$9 = async ({ request }) => {
  console.log("bundleData loader");
  const res = await checkPublicAuth(request);
  if (!res.ok)
    return json(res, {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const cacheKey = new ApiCacheKeyService(shop);
  const cache = new ApiCacheService(cacheKey.getBundleDataKey(url.searchParams.get("bundleId")));
  const cacheData = await cache.readCache();
  const bundleId = url.searchParams.get("bundleId");
  if (cacheData) {
    return json(new JsonData(true, "success", "Bundle succesfuly retirieved.", [], cacheData, true), {
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });
  } else {
    try {
      const bundleData = await prisma.bundleBuilder.findUnique({
        where: {
          id: Number(bundleId)
        },
        select: {
          ...bundleAndSteps,
          id: true,
          title: true,
          published: true,
          createdAt: true,
          discountType: true,
          discountValue: true,
          priceAmount: true,
          pricing: true,
          bundleSettings: true,
          steps: {
            select: {
              title: true,
              stepNumber: true,
              stepType: true
            },
            orderBy: {
              stepNumber: "asc"
            }
          }
        }
      });
      await cache.writeCache(bundleData);
      return json(new JsonData(false, "success", "Bundle succesfuly retirieved.", [], bundleData), {
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        status: 200
      });
    } catch (error) {
      console.error(error);
    }
  }
};
const route25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
const loader$8 = async ({ request }) => {
  await authenticate.admin(request);
  const url = new URL(request.url);
  const variant = url.searchParams.get("variant");
  if (variant === "upgrade")
    return json$1({ type: "upgrade" });
  if (variant === "firstPlan")
    return json$1({ type: "firstPlan" });
};
const action$5 = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const action2 = formData.get("action");
  switch (action2) {
    case "dismissHomePageBanner": {
      break;
    }
    default: {
      return json$1(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
};
function Index$5() {
  const nav = useNavigation();
  const isLoading = nav.state !== "idle";
  const navigate = useNavigate();
  const loaderResponse = useLoaderData();
  const thankYouType = loaderResponse.type;
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Page,
    {
      title: "Thank you",
      backAction: {
        content: "Back",
        onAction: async () => {
          navigate(-1);
        }
      },
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
        thankYouType === "firstPlan" && /* @__PURE__ */ jsx(BlockStack, { gap: "500", children: /* @__PURE__ */ jsx(Banner, { title: "Thank you for choosing a plan!", tone: "success", onDismiss: () => {
        }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
          /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "You will be using NeatBundles to let your customers create bundles they love in no time." }),
          /* @__PURE__ */ jsx(Text, { as: "p", children: "Just before you get there, you need to quickly go through the installation to get the NeatBundles app properly connected to your store." })
        ] }) }) }),
        thankYouType === "upgrade" && /* @__PURE__ */ jsx(BlockStack, { gap: "500", children: /* @__PURE__ */ jsx(Banner, { title: "Thank you for upgrading!", tone: "success", onDismiss: () => {
        }, children: /* @__PURE__ */ jsx(BlockStack, { gap: GapInsideSection, children: /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: "We hope that new features will give you plenty of new power." }) }) }) }),
        /* @__PURE__ */ jsx(Box, { width: "full", children: /* @__PURE__ */ jsx(BlockStack, { inlineAlign: "end", children: /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsx(
          Button,
          {
            variant: "primary",
            onClick: () => {
              if (thankYouType === "upgrade") {
                navigate("/app");
              } else if (thankYouType === "firstPlan") {
                navigate("/app/installation");
              }
            },
            children: "Go to bundles"
          }
        ) }) }) }),
        /* @__PURE__ */ jsxs(FooterHelp, { children: [
          "Are you stuck? ",
          /* @__PURE__ */ jsx(Link, { to: "/app/help", children: "Get help" }),
          " from us, or ",
          /* @__PURE__ */ jsx(Link, { to: "/app/feature-request", children: "suggest new features" }),
          "."
        ] })
      ] })
    }
  ) }) });
}
const route26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5,
  default: Index$5,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
function ToggleSwitch({ label: label2, labelHidden = true, onChange }) {
  return /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsxs("div", { className: "toggle-switch", children: [
    /* @__PURE__ */ jsx("input", { type: "checkbox", className: "checkbox", name: label2, id: label2, onChange }),
    /* @__PURE__ */ jsxs("label", { className: "label", htmlFor: label2, children: [
      /* @__PURE__ */ jsx("span", { className: "inner" }),
      /* @__PURE__ */ jsx("span", { className: "switch" })
    ] })
  ] }) });
}
const tableWrapper = "_tableWrapper_17045_1";
const loadingTable = "_loadingTable_17045_5";
const hide = "_hide_17045_18";
const dummyIconPlaceholder = "_dummyIconPlaceholder_17045_22";
const tooltipContent = "_tooltipContent_17045_29";
const styles$2 = {
  tableWrapper,
  loadingTable,
  hide,
  dummyIconPlaceholder,
  tooltipContent
};
var PricingPlanClient = /* @__PURE__ */ ((PricingPlanClient2) => {
  PricingPlanClient2["NONE"] = "NONE";
  PricingPlanClient2["FREE"] = "FREE";
  PricingPlanClient2["BASIC"] = "BASIC";
  PricingPlanClient2["PRO"] = "PRO";
  return PricingPlanClient2;
})(PricingPlanClient || {});
const pricingPlanWrapper = "_pricingPlanWrapper_bx485_1";
const styles$1 = {
  pricingPlanWrapper
};
function Index$4({
  subscriptionIdentifier,
  title,
  features,
  monthlyPricing,
  yearlyPricing,
  pricingInterval,
  activePlan,
  planDisabled,
  trialDays,
  handleSubscription
}) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs("div", { className: styles$1.pricingPlanWrapper, children: [
    /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
      /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingLg", alignment: "center", children: pricingInterval === "MONTHLY" ? title.monthly : title.yearly }),
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(BlockStack, { gap: "100", align: "start", children: features.map((feature) => {
        return /* @__PURE__ */ jsxs(InlineStack, { align: "start", children: [
          /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Icon, { source: CheckSmallIcon }) }),
          /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(Text, { as: "p", children: feature }) })
        ] }, feature);
      }) })
    ] }),
    /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
      /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenTitleAndContent, align: "center", children: [
        /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingLg", alignment: "center", children: pricingInterval === "MONTHLY" ? monthlyPricing : yearlyPricing }),
        trialDays && /* @__PURE__ */ jsxs(Text, { as: "h2", variant: "headingMd", alignment: "center", children: [
          "+ ",
          trialDays,
          "-day free trial"
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          disabled: activePlan || planDisabled,
          onClick: () => {
            handleSubscription(pricingInterval === "MONTHLY" ? subscriptionIdentifier.monthly : subscriptionIdentifier.yearly);
          },
          children: activePlan === true ? "Current plan" : "Select plan"
        }
      )
    ] })
  ] }) });
}
const loader$7 = async ({ request }) => {
  const { billing, session, redirect: redirect2 } = await authenticate.admin(request);
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  const result = await billing.check({
    plans: [BillingPlanIdentifiers.PRO_MONTHLY, BillingPlanIdentifiers.PRO_YEARLY, BillingPlanIdentifiers.BASIC_MONTHLY, BillingPlanIdentifiers.BASIC_YEARLY],
    isTest: false
  });
  console.log(result);
  const { hasActivePayment, appSubscriptions } = result;
  if (!hasActivePayment) {
    if (user.isDevelopmentStore && user.activeBillingPlan !== "FREE") {
      user.activeBillingPlan = "FREE";
      await userRepository.updateUser(user);
    } else if (user.activeBillingPlan !== "NONE" && !user.isDevelopmentStore) {
      user.activeBillingPlan = "NONE";
      await userRepository.updateUser(user);
    }
  } else {
    if (user.activeBillingPlan === "NONE") {
      switch (appSubscriptions[0].name) {
        case BillingPlanIdentifiers.PRO_MONTHLY:
          user.activeBillingPlan = "PRO";
        case BillingPlanIdentifiers.PRO_YEARLY:
          user.activeBillingPlan = "PRO";
        case BillingPlanIdentifiers.BASIC_MONTHLY:
          user.activeBillingPlan = "BASIC";
        case BillingPlanIdentifiers.BASIC_YEARLY:
          user.activeBillingPlan = "BASIC";
      }
      await userRepository.updateUser(user);
    }
  }
  if (hasActivePayment) {
    return json$1({ planName: user.activeBillingPlan, planId: appSubscriptions[0].name, user });
  } else if (user.activeBillingPlan === "FREE") {
    return json$1({ planName: user.activeBillingPlan, planId: "FREE", user });
  } else
    return json$1({ planName: user.activeBillingPlan, planId: "NONE", user });
};
const action$4 = async ({ request }) => {
  const { session, billing, redirect: redirect2 } = await authenticate.admin(request);
  const user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user)
    return redirect2("/app");
  const { hasActivePayment, appSubscriptions } = await billing.check({
    plans: [BillingPlanIdentifiers.PRO_MONTHLY, BillingPlanIdentifiers.PRO_YEARLY, BillingPlanIdentifiers.BASIC_MONTHLY, BillingPlanIdentifiers.BASIC_YEARLY],
    isTest: false
  });
  const formData = await request.formData();
  const action2 = formData.get("action");
  let state = "none";
  console.log(action2);
  if (user.isDevelopmentStore) {
    return redirect2("/app");
  }
  switch (action2) {
    case "CANCEL": {
      if (hasActivePayment) {
        await billing.cancel({
          subscriptionId: appSubscriptions[0].id,
          isTest: false,
          prorate: false
        });
      }
      await userRepository.updateUser({ ...user, activeBillingPlan: "NONE" });
      return redirect2("/app/billing");
    }
    case BillingPlanIdentifiers.BASIC_MONTHLY: {
      if (user.activeBillingPlan === "PRO")
        state = "downgrading";
      await userRepository.updateUser({ ...user, activeBillingPlan: "BASIC" });
      await billing.request({
        plan: action2,
        isTest: false,
        returnUrl: `https://admin.shopify.com/store/${session.shop.split(".")[0]}/apps/${process.env.APP_HANDLE}/app/${state === "downgrading" ? "billing" : state === "none" ? "thank-you?variant=firstPlan" : ""}`
      });
      break;
    }
    case BillingPlanIdentifiers.BASIC_YEARLY: {
      if (user.activeBillingPlan === "PRO")
        state = "downgrading";
      await userRepository.updateUser({ ...user, activeBillingPlan: "BASIC" });
      await billing.request({
        plan: action2,
        isTest: false,
        returnUrl: `https://admin.shopify.com/store/${session.shop.split(".")[0]}/apps/${process.env.APP_HANDLE}/app/${state === "downgrading" ? "billing" : state === "none" ? "thank-you?variant=firstPlan" : ""}`
      });
      break;
    }
    case BillingPlanIdentifiers.PRO_MONTHLY: {
      if (user.activeBillingPlan === "BASIC")
        state = "upgrading";
      await userRepository.updateUser({ ...user, activeBillingPlan: "PRO" });
      await billing.request({
        plan: action2,
        isTest: false,
        returnUrl: `https://admin.shopify.com/store/${session.shop.split(".")[0]}/apps/${process.env.APP_HANDLE}/app/thank-you?variant=${state === "upgrading" ? "upgrade" : state === "none" ? "firstPlan" : ""}`
      });
      break;
    }
    case BillingPlanIdentifiers.PRO_YEARLY: {
      if (user.activeBillingPlan === "BASIC")
        state = "upgrading";
      await userRepository.updateUser({ ...user, activeBillingPlan: "PRO" });
      await billing.request({
        plan: action2,
        isTest: false,
        returnUrl: `https://admin.shopify.com/store/${session.shop.split(".")[0]}/apps/${process.env.APP_HANDLE}/app/thank-you?variant=${state === "upgrading" ? "upgrade" : state === "none" ? "firstPlan" : ""}`
      });
      break;
    }
    default: {
      return json$1(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
  return redirect2("/app");
};
function Index$3() {
  const nav = useNavigation();
  const isLoading = nav.state !== "idle";
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  const user = loaderData.user;
  const activeSubscription = { planId: loaderData.planId, planName: loaderData.planName };
  const [pricingInterval, setPricingInterval] = useState("MONTHLY");
  const handlePricingIntervalToogle = () => {
    setPricingInterval((state) => {
      if (state === "MONTHLY")
        return "YEARLY";
      return "MONTHLY";
    });
  };
  const handleCanclePlan = async () => {
    const form2 = new FormData();
    form2.append("action", "CANCEL");
    fetcher.submit(form2, { method: "POST" });
  };
  const [isDowngrading, setIsDowngrading] = useState();
  const [newSelectedSubscription, setNewSelectedSubscription] = useState();
  const handleSubscription = (newPlan) => {
    if (activeSubscription.planId === BillingPlanIdentifiers.FREE) {
      shopify.modal.show("partner-stores-modal");
      return;
    }
    if ((newPlan.planId === BillingPlanIdentifiers.BASIC_MONTHLY || newPlan.planId === BillingPlanIdentifiers.BASIC_YEARLY) && (activeSubscription.planId === BillingPlanIdentifiers.PRO_MONTHLY || activeSubscription.planId === BillingPlanIdentifiers.PRO_YEARLY)) {
      setNewSelectedSubscription(newPlan);
      setIsDowngrading(true);
      return;
    }
    chargeCustomer(newPlan);
  };
  const chargeCustomer = (newPlan) => {
    const form2 = new FormData();
    form2.append("action", newPlan.planId);
    fetcher.submit(form2, { method: "POST" });
  };
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Modal, { id: "partner-stores-modal", children: [
      /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsx(Text, { as: "p", children: "Since your are running a development store, you already have all the features for free." }) }),
      /* @__PURE__ */ jsx(TitleBar, { title: "Why pay when it's free!", children: /* @__PURE__ */ jsx("button", { variant: "primary", onClick: () => shopify.modal.hide("partner-stores-modal"), children: "Close" }) })
    ] }),
    /* @__PURE__ */ jsxs(Modal, { id: "cancel-subscription-modal", children: [
      /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsx(Text, { as: "p", children: "If you cancel the subscription, you won't be able to use NeatBundles app. Are you sure that you want to to that?" }) }),
      /* @__PURE__ */ jsxs(TitleBar, { title: "Cancel confirmation", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => shopify.modal.hide("cancel-subscription-modal"), children: "Close" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            variant: "primary",
            tone: "critical",
            onClick: () => {
              handleCanclePlan();
              shopify.modal.hide("cancel-subscription-modal");
            },
            children: "Cancel"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Modal, { id: "downgrading-subscription-modal", open: isDowngrading, onHide: () => setIsDowngrading(false), children: [
      /* @__PURE__ */ jsx(Box, { padding: "300", children: /* @__PURE__ */ jsxs(Text, { as: "p", children: [
        "You are about to downgrade from the ",
        /* @__PURE__ */ jsx("b", { children: activeSubscription.planId }),
        " plan to the ",
        /* @__PURE__ */ jsx("b", { children: newSelectedSubscription?.planId }),
        " plan. All the bundles that don't fit within the limitations of the new plan will be deleted. Are you sure that you want to do that?"
      ] }) }),
      /* @__PURE__ */ jsxs(TitleBar, { title: "Are you sure you want to downgrade your plan?", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setIsDowngrading(false), children: "Close" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            variant: "primary",
            tone: "critical",
            onClick: () => {
              chargeCustomer(newSelectedSubscription);
              setIsDowngrading(false);
            },
            children: "Downgrade"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Page,
      {
        title: "Billing",
        backAction: {
          content: "Back",
          onAction: async () => {
            navigate(-1);
          }
        },
        children: /* @__PURE__ */ jsxs("div", { id: styles$2.tableWrapper, children: [
          /* @__PURE__ */ jsx("div", { className: fetcher.state !== "idle" ? styles$2.loadingTable : styles$2.hide, children: /* @__PURE__ */ jsx(Spinner, { accessibilityLabel: "Spinner example", size: "large" }) }),
          /* @__PURE__ */ jsxs(BlockStack, { align: "center", gap: LargeGapBetweenSections, children: [
            /* @__PURE__ */ jsx(Banner, { onDismiss: () => {
            }, children: /* @__PURE__ */ jsxs(Text, { as: "p", children: [
              "Select the plan that best suits your needs. ",
              /* @__PURE__ */ jsx("b", { children: "For a limited time, we have a 30-day free trial" }),
              " that should be enough to get your customers started with custom bundles."
            ] }) }),
            /* @__PURE__ */ jsxs(InlineStack, { gap: GapInsideSection, align: "center", blockAlign: "center", children: [
              /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingLg", children: "Monthly" }),
              /* @__PURE__ */ jsx(ToggleSwitch, { label: "Biling frequency", labelHidden: true, onChange: () => handlePricingIntervalToogle() }),
              /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingLg", children: "Yearly (15% off)" })
            ] }),
            /* @__PURE__ */ jsxs(InlineStack, { gap: GapBetweenSections, align: "center", children: [
              /* @__PURE__ */ jsx(
                Index$4,
                {
                  activePlan: activeSubscription.planId === BillingPlanIdentifiers.FREE,
                  subscriptionIdentifier: {
                    yearly: { planName: PricingPlanClient.FREE, planId: BillingPlanIdentifiers.FREE },
                    monthly: { planName: PricingPlanClient.FREE, planId: BillingPlanIdentifiers.FREE }
                  },
                  handleSubscription,
                  title: { yearly: "Development", monthly: "Development" },
                  monthlyPricing: "Free",
                  yearlyPricing: "Free",
                  pricingInterval,
                  planDisabled: !user.isDevelopmentStore,
                  features: ["All features", "For development stores only"]
                }
              ),
              /* @__PURE__ */ jsx(
                Index$4,
                {
                  activePlan: activeSubscription.planId === BillingPlanIdentifiers.BASIC_MONTHLY || activeSubscription.planId === BillingPlanIdentifiers.BASIC_YEARLY,
                  subscriptionIdentifier: {
                    yearly: { planName: PricingPlanClient.BASIC, planId: BillingPlanIdentifiers.BASIC_YEARLY },
                    monthly: { planName: PricingPlanClient.BASIC, planId: BillingPlanIdentifiers.BASIC_MONTHLY }
                  },
                  handleSubscription,
                  title: { yearly: "Basic (yearly)", monthly: "Basic (monthly)" },
                  trialDays: 30,
                  monthlyPricing: "$6.99",
                  yearlyPricing: "$69.99",
                  pricingInterval,
                  features: [
                    "Create up to 2 bundles",
                    "Create up to 2 two steps in one bundle",
                    "Create product steps",
                    "Customize colors",
                    "Customer support"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                Index$4,
                {
                  activePlan: activeSubscription.planId === BillingPlanIdentifiers.PRO_MONTHLY || activeSubscription.planId === BillingPlanIdentifiers.PRO_YEARLY,
                  subscriptionIdentifier: {
                    yearly: { planName: PricingPlanClient.PRO, planId: BillingPlanIdentifiers.PRO_YEARLY },
                    monthly: { planName: PricingPlanClient.PRO, planId: BillingPlanIdentifiers.PRO_MONTHLY }
                  },
                  handleSubscription,
                  trialDays: 30,
                  title: { yearly: "Pro (yearly)", monthly: "Pro (monthly)" },
                  monthlyPricing: "$9.99",
                  yearlyPricing: "$99.99",
                  pricingInterval,
                  features: [
                    "Create unlimited bundles",
                    "Create up to 5 steps on all bundles",
                    "Create product steps",
                    "Collect images or text on steps",
                    "Customize colors",
                    "Priority support"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(InlineStack, { gap: GapBetweenSections, align: "center", blockAlign: "center", children: [
              /* @__PURE__ */ jsx(Text, { as: "p", children: /* @__PURE__ */ jsx("u", { children: activeSubscription.planId === "NONE" ? "You don't have an active plan." : `Your currently active plan is ${activeSubscription.planId}.` }) }),
              activeSubscription.planId !== "FREE" && activeSubscription.planName !== "NONE" && /* @__PURE__ */ jsx(Button, { onClick: () => shopify.modal.show("cancel-subscription-modal"), children: "Cancel plan" })
            ] }),
            /* @__PURE__ */ jsx(Divider, {}),
            /* @__PURE__ */ jsx(Text, { as: "p", children: "Note: The plans displayed reflect current pricing. If you previously signed up at a different price, you will continue to be charged your original price until you change your plan." }),
            /* @__PURE__ */ jsx(Divider, {})
          ] })
        ] })
      }
    )
  ] }) });
}
const route27 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: Index$3,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
const loops = new LoopsClient(process.env.LOOPS_API_KEY);
const loopsClient = loops;
class BundleBuilderServiceImpl {
  deleteBundle(bundleId) {
    prisma.bundleBuilder.delete({
      where: {
        id: bundleId
      }
    });
  }
  // Deleting non-allowed bundles
  async deleteNonAllowedBundles(shop) {
    let bundles = await bundleBuilderRepository.getAllBundleBuilderAndBundleStepsAsc(shop) || [];
    const bundlesForDeleting = [];
    bundles.forEach((bundle) => {
      if (bundle.steps.length > 2) {
        bundlesForDeleting.push(bundle.id);
      }
    });
    bundles = bundles.filter((bundle) => {
      if (bundlesForDeleting.includes(bundle.id)) {
        return false;
      }
      return true;
    });
    if (bundles.length > 2) {
      bundlesForDeleting.push(...bundles.slice(2).map((bundle) => bundle.id));
    }
    await bundleBuilderRepository.deleteBundles(bundlesForDeleting);
  }
}
const bundleBuilderService = new BundleBuilderServiceImpl();
const loader$6 = async ({ request }) => {
  const { admin, session, billing, redirect: redirect2 } = await authenticate.admin(request);
  let user = await userRepository.getUserByStoreUrl(session.shop);
  if (!user) {
    const response2 = await admin.graphql(
      `#graphql
                query getStore {
                shop {
                    name
                    shopOwnerName
                    email
                    primaryDomain {
                        url
                    }
                    plan {
                        partnerDevelopment
                    }
                }
                }`
    );
    const data2 = (await response2.json()).data.shop;
    user = await userRepository.createUser(session.shop, data2.email, data2.name, data2.primaryDomain.url, "", data2.shopOwnerName);
    if (data2.plan.partnerDevelopment) {
      user.activeBillingPlan = "FREE";
      user.isDevelopmentStore = true;
      await userRepository.updateUser(user);
    }
    const firstName = user.ownerName.split(" ")[0];
    const contactProperties = {
      firstName,
      lastName: user.ownerName.replace(firstName, "").trim(),
      email: user.email,
      shopifyPrimaryDomain: user.primaryDomain,
      myShopifyDomain: user.storeUrl,
      source: "Shopify - Installed the app",
      userGroup: "neat-bundles"
    };
    const mailingLists = {
      cm2rilz99023y0lmjc9vp4zin: true,
      //Neat Bundles mailing list
      cm2rinqh8007n0ljmcqtgbiz9: false
      //Neat Merchant - all users
    };
    const loopsResponse = await loopsClient.createContact(user.email, contactProperties, mailingLists);
    if (!loopsResponse.success) {
      await loopsClient.createContact(user.email, contactProperties, mailingLists);
    }
  }
  if (!user.hasAppInstalled) {
    await userRepository.updateUser({ ...user, hasAppInstalled: true });
  }
  const response = await admin.graphql(
    `#graphql
            query isStoreDevelopment {
            shop {
                plan {
                    partnerDevelopment
                }
            }
            }`
  );
  const data = (await response.json()).data.shop;
  if (!data.plan.partnerDevelopment && user.isDevelopmentStore) {
    user.isDevelopmentStore = false;
    await userRepository.updateUser(user);
  } else if (data.plan.partnerDevelopment && !user.isDevelopmentStore) {
    user.activeBillingPlan = "FREE";
    user.isDevelopmentStore = true;
    await userRepository.updateUser(user);
  }
  const result = await billing.check({
    plans: [BillingPlanIdentifiers.PRO_MONTHLY, BillingPlanIdentifiers.PRO_YEARLY, BillingPlanIdentifiers.BASIC_MONTHLY, BillingPlanIdentifiers.BASIC_YEARLY],
    isTest: false
  });
  console.log(result);
  const hasActivePayment = result.hasActivePayment;
  const appSubscriptions = result.appSubscriptions;
  if (!hasActivePayment) {
    if (user.isDevelopmentStore && user.activeBillingPlan !== "FREE") {
      user.activeBillingPlan = "FREE";
      await userRepository.updateUser(user);
    } else if (user.activeBillingPlan !== "NONE" && !user.isDevelopmentStore) {
      user.activeBillingPlan = "NONE";
      await userRepository.updateUser(user);
      return redirect2(`/app/billing`);
    } else if (user.activeBillingPlan === "NONE" && !user.isDevelopmentStore) {
      return redirect2(`/app/billing`);
    }
  } else {
    switch (appSubscriptions[0].name) {
      case BillingPlanIdentifiers.PRO_MONTHLY:
        user.activeBillingPlan = "PRO";
      case BillingPlanIdentifiers.PRO_YEARLY:
        user.activeBillingPlan = "PRO";
      case BillingPlanIdentifiers.BASIC_MONTHLY:
        if (user.activeBillingPlan === "PRO")
          await bundleBuilderService.deleteNonAllowedBundles(session.shop);
        user.activeBillingPlan = "BASIC";
      case BillingPlanIdentifiers.BASIC_YEARLY:
        if (user.activeBillingPlan === "PRO")
          await bundleBuilderService.deleteNonAllowedBundles(session.shop);
        user.activeBillingPlan = "BASIC";
    }
    await userRepository.updateUser(user);
  }
  if (!user.completedInstallation)
    return redirect2(`/app/installation`);
  return redirect2(`/app/users/${user.id}/bundles`);
};
function Index$2() {
  return /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) });
}
const route28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index$2,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const Polaris = {
  ActionMenu: {
    Actions: {
      moreActions: "More actions"
    },
    RollupActions: {
      rollupButton: "View actions"
    }
  },
  ActionList: {
    SearchField: {
      clearButtonLabel: "Clear",
      search: "Search",
      placeholder: "Search actions"
    }
  },
  Avatar: {
    label: "Avatar",
    labelWithInitials: "Avatar with initials {initials}"
  },
  Autocomplete: {
    spinnerAccessibilityLabel: "Loading",
    ellipsis: "{content}…"
  },
  Badge: {
    PROGRESS_LABELS: {
      incomplete: "Incomplete",
      partiallyComplete: "Partially complete",
      complete: "Complete"
    },
    TONE_LABELS: {
      info: "Info",
      success: "Success",
      warning: "Warning",
      critical: "Critical",
      attention: "Attention",
      "new": "New",
      readOnly: "Read-only",
      enabled: "Enabled"
    },
    progressAndTone: "{toneLabel} {progressLabel}"
  },
  Banner: {
    dismissButton: "Dismiss notification"
  },
  Button: {
    spinnerAccessibilityLabel: "Loading"
  },
  Common: {
    checkbox: "checkbox",
    undo: "Undo",
    cancel: "Cancel",
    clear: "Clear",
    close: "Close",
    submit: "Submit",
    more: "More"
  },
  ContextualSaveBar: {
    save: "Save",
    discard: "Discard"
  },
  DataTable: {
    sortAccessibilityLabel: "sort {direction} by",
    navAccessibilityLabel: "Scroll table {direction} one column",
    totalsRowHeading: "Totals",
    totalRowHeading: "Total"
  },
  DatePicker: {
    previousMonth: "Show previous month, {previousMonthName} {showPreviousYear}",
    nextMonth: "Show next month, {nextMonth} {nextYear}",
    today: "Today ",
    start: "Start of range",
    end: "End of range",
    months: {
      january: "January",
      february: "February",
      march: "March",
      april: "April",
      may: "May",
      june: "June",
      july: "July",
      august: "August",
      september: "September",
      october: "October",
      november: "November",
      december: "December"
    },
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    },
    daysAbbreviated: {
      monday: "Mo",
      tuesday: "Tu",
      wednesday: "We",
      thursday: "Th",
      friday: "Fr",
      saturday: "Sa",
      sunday: "Su"
    }
  },
  DiscardConfirmationModal: {
    title: "Discard all unsaved changes",
    message: "If you discard changes, you’ll delete any edits you made since you last saved.",
    primaryAction: "Discard changes",
    secondaryAction: "Continue editing"
  },
  DropZone: {
    single: {
      overlayTextFile: "Drop file to upload",
      overlayTextImage: "Drop image to upload",
      overlayTextVideo: "Drop video to upload",
      actionTitleFile: "Add file",
      actionTitleImage: "Add image",
      actionTitleVideo: "Add video",
      actionHintFile: "or drop file to upload",
      actionHintImage: "or drop image to upload",
      actionHintVideo: "or drop video to upload",
      labelFile: "Upload file",
      labelImage: "Upload image",
      labelVideo: "Upload video"
    },
    allowMultiple: {
      overlayTextFile: "Drop files to upload",
      overlayTextImage: "Drop images to upload",
      overlayTextVideo: "Drop videos to upload",
      actionTitleFile: "Add files",
      actionTitleImage: "Add images",
      actionTitleVideo: "Add videos",
      actionHintFile: "or drop files to upload",
      actionHintImage: "or drop images to upload",
      actionHintVideo: "or drop videos to upload",
      labelFile: "Upload files",
      labelImage: "Upload images",
      labelVideo: "Upload videos"
    },
    errorOverlayTextFile: "File type is not valid",
    errorOverlayTextImage: "Image type is not valid",
    errorOverlayTextVideo: "Video type is not valid"
  },
  EmptySearchResult: {
    altText: "Empty search results"
  },
  Frame: {
    skipToContent: "Skip to content",
    navigationLabel: "Navigation",
    Navigation: {
      closeMobileNavigationLabel: "Close navigation"
    }
  },
  FullscreenBar: {
    back: "Back",
    accessibilityLabel: "Exit fullscreen mode"
  },
  Filters: {
    moreFilters: "More filters",
    moreFiltersWithCount: "More filters ({count})",
    filter: "Filter {resourceName}",
    noFiltersApplied: "No filters applied",
    cancel: "Cancel",
    done: "Done",
    clearAllFilters: "Clear all filters",
    clear: "Clear",
    clearLabel: "Clear {filterName}",
    addFilter: "Add filter",
    clearFilters: "Clear all",
    searchInView: "in:{viewName}"
  },
  FilterPill: {
    clear: "Clear",
    unsavedChanges: "Unsaved changes - {label}"
  },
  IndexFilters: {
    searchFilterTooltip: "Search and filter",
    searchFilterTooltipWithShortcut: "Search and filter (F)",
    searchFilterAccessibilityLabel: "Search and filter results",
    sort: "Sort your results",
    addView: "Add a new view",
    newView: "Custom search",
    SortButton: {
      ariaLabel: "Sort the results",
      tooltip: "Sort",
      title: "Sort by",
      sorting: {
        asc: "Ascending",
        desc: "Descending",
        az: "A-Z",
        za: "Z-A"
      }
    },
    EditColumnsButton: {
      tooltip: "Edit columns",
      accessibilityLabel: "Customize table column order and visibility"
    },
    UpdateButtons: {
      cancel: "Cancel",
      update: "Update",
      save: "Save",
      saveAs: "Save as",
      modal: {
        title: "Save view as",
        label: "Name",
        sameName: "A view with this name already exists. Please choose a different name.",
        save: "Save",
        cancel: "Cancel"
      }
    }
  },
  IndexProvider: {
    defaultItemSingular: "Item",
    defaultItemPlural: "Items",
    allItemsSelected: "All {itemsLength}+ {resourceNamePlural} are selected",
    selected: "{selectedItemsCount} selected",
    a11yCheckboxDeselectAllSingle: "Deselect {resourceNameSingular}",
    a11yCheckboxSelectAllSingle: "Select {resourceNameSingular}",
    a11yCheckboxDeselectAllMultiple: "Deselect all {itemsLength} {resourceNamePlural}",
    a11yCheckboxSelectAllMultiple: "Select all {itemsLength} {resourceNamePlural}"
  },
  IndexTable: {
    emptySearchTitle: "No {resourceNamePlural} found",
    emptySearchDescription: "Try changing the filters or search term",
    onboardingBadgeText: "New",
    resourceLoadingAccessibilityLabel: "Loading {resourceNamePlural}…",
    selectAllLabel: "Select all {resourceNamePlural}",
    selected: "{selectedItemsCount} selected",
    undo: "Undo",
    selectAllItems: "Select all {itemsLength}+ {resourceNamePlural}",
    selectItem: "Select {resourceName}",
    selectButtonText: "Select",
    sortAccessibilityLabel: "sort {direction} by"
  },
  Loading: {
    label: "Page loading bar"
  },
  Modal: {
    iFrameTitle: "body markup",
    modalWarning: "These required properties are missing from Modal: {missingProps}"
  },
  Page: {
    Header: {
      rollupActionsLabel: "View actions for {title}",
      pageReadyAccessibilityLabel: "{title}. This page is ready"
    }
  },
  Pagination: {
    previous: "Previous",
    next: "Next",
    pagination: "Pagination"
  },
  ProgressBar: {
    negativeWarningMessage: "Values passed to the progress prop shouldn’t be negative. Resetting {progress} to 0.",
    exceedWarningMessage: "Values passed to the progress prop shouldn’t exceed 100. Setting {progress} to 100."
  },
  ResourceList: {
    sortingLabel: "Sort by",
    defaultItemSingular: "item",
    defaultItemPlural: "items",
    showing: "Showing {itemsCount} {resource}",
    showingTotalCount: "Showing {itemsCount} of {totalItemsCount} {resource}",
    loading: "Loading {resource}",
    selected: "{selectedItemsCount} selected",
    allItemsSelected: "All {itemsLength}+ {resourceNamePlural} in your store are selected",
    allFilteredItemsSelected: "All {itemsLength}+ {resourceNamePlural} in this filter are selected",
    selectAllItems: "Select all {itemsLength}+ {resourceNamePlural} in your store",
    selectAllFilteredItems: "Select all {itemsLength}+ {resourceNamePlural} in this filter",
    emptySearchResultTitle: "No {resourceNamePlural} found",
    emptySearchResultDescription: "Try changing the filters or search term",
    selectButtonText: "Select",
    a11yCheckboxDeselectAllSingle: "Deselect {resourceNameSingular}",
    a11yCheckboxSelectAllSingle: "Select {resourceNameSingular}",
    a11yCheckboxDeselectAllMultiple: "Deselect all {itemsLength} {resourceNamePlural}",
    a11yCheckboxSelectAllMultiple: "Select all {itemsLength} {resourceNamePlural}",
    Item: {
      actionsDropdownLabel: "Actions for {accessibilityLabel}",
      actionsDropdown: "Actions dropdown",
      viewItem: "View details for {itemName}"
    },
    BulkActions: {
      actionsActivatorLabel: "Actions",
      moreActionsActivatorLabel: "More actions"
    }
  },
  SkeletonPage: {
    loadingLabel: "Page loading"
  },
  Tabs: {
    newViewAccessibilityLabel: "Create new view",
    newViewTooltip: "Create view",
    toggleTabsLabel: "More views",
    Tab: {
      rename: "Rename view",
      duplicate: "Duplicate view",
      edit: "Edit view",
      editColumns: "Edit columns",
      "delete": "Delete view",
      copy: "Copy of {name}",
      deleteModal: {
        title: "Delete view?",
        description: "This can’t be undone. {viewName} view will no longer be available in your admin.",
        cancel: "Cancel",
        "delete": "Delete view"
      }
    },
    RenameModal: {
      title: "Rename view",
      label: "Name",
      cancel: "Cancel",
      create: "Save",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    },
    DuplicateModal: {
      title: "Duplicate view",
      label: "Name",
      cancel: "Cancel",
      create: "Create view",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    },
    CreateViewModal: {
      title: "Create new view",
      label: "Name",
      cancel: "Cancel",
      create: "Create view",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    }
  },
  Tag: {
    ariaLabel: "Remove {children}"
  },
  TextField: {
    characterCount: "{count} characters",
    characterCountWithMaxLength: "{count} of {limit} characters used"
  },
  TooltipOverlay: {
    accessibilityLabel: "Tooltip: {label}"
  },
  TopBar: {
    toggleMenuLabel: "Toggle menu",
    SearchField: {
      clearButtonLabel: "Clear",
      search: "Search"
    }
  },
  MediaCard: {
    dismissButton: "Dismiss",
    popoverButton: "Actions"
  },
  VideoThumbnail: {
    playButtonA11yLabel: {
      "default": "Play video",
      defaultWithDuration: "Play video of length {duration}",
      duration: {
        hours: {
          other: {
            only: "{hourCount} hours",
            andMinutes: "{hourCount} hours and {minuteCount} minutes",
            andMinute: "{hourCount} hours and {minuteCount} minute",
            minutesAndSeconds: "{hourCount} hours, {minuteCount} minutes, and {secondCount} seconds",
            minutesAndSecond: "{hourCount} hours, {minuteCount} minutes, and {secondCount} second",
            minuteAndSeconds: "{hourCount} hours, {minuteCount} minute, and {secondCount} seconds",
            minuteAndSecond: "{hourCount} hours, {minuteCount} minute, and {secondCount} second",
            andSeconds: "{hourCount} hours and {secondCount} seconds",
            andSecond: "{hourCount} hours and {secondCount} second"
          },
          one: {
            only: "{hourCount} hour",
            andMinutes: "{hourCount} hour and {minuteCount} minutes",
            andMinute: "{hourCount} hour and {minuteCount} minute",
            minutesAndSeconds: "{hourCount} hour, {minuteCount} minutes, and {secondCount} seconds",
            minutesAndSecond: "{hourCount} hour, {minuteCount} minutes, and {secondCount} second",
            minuteAndSeconds: "{hourCount} hour, {minuteCount} minute, and {secondCount} seconds",
            minuteAndSecond: "{hourCount} hour, {minuteCount} minute, and {secondCount} second",
            andSeconds: "{hourCount} hour and {secondCount} seconds",
            andSecond: "{hourCount} hour and {secondCount} second"
          }
        },
        minutes: {
          other: {
            only: "{minuteCount} minutes",
            andSeconds: "{minuteCount} minutes and {secondCount} seconds",
            andSecond: "{minuteCount} minutes and {secondCount} second"
          },
          one: {
            only: "{minuteCount} minute",
            andSeconds: "{minuteCount} minute and {secondCount} seconds",
            andSecond: "{minuteCount} minute and {secondCount} second"
          }
        },
        seconds: {
          other: "{secondCount} seconds",
          one: "{secondCount} second"
        }
      }
    }
  }
};
const polarisTranslations = {
  Polaris
};
const polarisStyles = "/assets/styles-BTPZE52T.css";
function loginErrorMessage(loginErrors) {
  if (loginErrors?.shop === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if (loginErrors?.shop === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }
  return {};
}
const links$1 = () => [{ rel: "stylesheet", href: polarisStyles }];
const loader$5 = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return json({ errors, polarisTranslations });
};
const action$3 = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return json({
    errors
  });
};
function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;
  return /* @__PURE__ */ jsx(AppProvider, { i18n: loaderData.polarisTranslations, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsxs(FormLayout, { children: [
    /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Log in" }),
    /* @__PURE__ */ jsx(
      TextField,
      {
        type: "text",
        name: "shop",
        label: "Shop domain",
        helpText: "example.myshopify.com",
        value: shop,
        onChange: setShop,
        autoComplete: "on",
        error: errors.shop
      }
    ),
    /* @__PURE__ */ jsx(Button, { submit: true, children: "Log in" })
  ] }) }) }) }) });
}
const route29 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: Auth,
  links: links$1,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({ request }) => {
  await authenticate.admin(request);
  const url = new URL(request.url);
  const params = url.searchParams;
  const errorType = params.get("type");
  return errorType;
};
const action$2 = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const action2 = formData.get("action");
  switch (action2) {
    case "dismissHomePageBanner": {
      break;
    }
    default: {
      return json$1(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
};
function Index$1() {
  const nav = useNavigation();
  const isLoading = nav.state !== "idle";
  const navigate = useNavigate();
  const loaderResponse = useLoaderData();
  const errorType = loaderResponse;
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Page,
    {
      title: "Error",
      backAction: {
        content: "Back",
        onAction: async () => {
          navigate(-1);
        }
      },
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
        errorType === "no-publication" && /* @__PURE__ */ jsx(BlockStack, { gap: "500", children: /* @__PURE__ */ jsx(Banner, { title: "There was an error!", tone: "critical", onDismiss: () => {
        }, children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapInsideSection, children: [
          /* @__PURE__ */ jsx(Text, { as: "p", variant: "headingMd", children: `You don't have an "Online store" app installed on your store.` }),
          /* @__PURE__ */ jsx(Text, { as: "p", children: `NeatBundles app wasn't able to find an "Online store" sales channel app by Shopify installed on your store. Please install the mentioned app and then come back here. If you think this was a mistake on our part, please contact us.` })
        ] }) }) }),
        /* @__PURE__ */ jsxs(FooterHelp, { children: [
          "Are you stuck? ",
          /* @__PURE__ */ jsx(Link, { to: "/app/help", children: "Get help" }),
          " from us, or ",
          /* @__PURE__ */ jsx(Link, { to: "/app/feature-request", children: "suggest new features" }),
          "."
        ] })
      ] })
    }
  ) }) });
}
const route30 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: Index$1,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const loader$3 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const action$1 = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const action2 = formData.get("action");
  switch (action2) {
    case "dismissHomePageBanner": {
      break;
    }
    default: {
      return json$1(
        {
          ...new JsonData(true, "success", "This is the default action that doesn't do anything.")
        },
        { status: 200 }
      );
    }
  }
};
function Index() {
  const nav = useNavigation();
  const isLoading = nav.state !== "idle";
  const navigate = useNavigate();
  return /* @__PURE__ */ jsx(Fragment, { children: isLoading ? /* @__PURE__ */ jsx(SkeletonPage, { primaryAction: true, children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(SkeletonBodyText, {}) })
  ] }) }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    Page,
    {
      title: "Need some help?",
      backAction: {
        content: "Back",
        onAction: async () => {
          navigate(-1);
        }
      },
      children: /* @__PURE__ */ jsxs(BlockStack, { gap: GapBetweenSections, children: [
        /* @__PURE__ */ jsx(Text, { as: "p", children: "There are two possible explanations for why you are visiting this page. Either you are just exploring, or you have been stuck and really need some help." }),
        /* @__PURE__ */ jsx(Text, { as: "p", children: "If you are just exploring, that's great! We are happy to have you here." }),
        /* @__PURE__ */ jsx(Text, { as: "p", fontWeight: "bold", children: "If you are stuck, we are here to help you. Please don't hesitate to send us an email describing your problem. We will do our best to help you." }),
        /* @__PURE__ */ jsxs(Text, { as: "p", children: [
          "Send the email to",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "mailto:support@neatmerchant.com", target: "_blank", children: "support@neatmerchant.com" }),
          ", All the emails are read and replied to by me. I usually reply within 24 hours."
        ] }),
        /* @__PURE__ */ jsx(Text, { as: "p", alignment: "end", children: "Jure Reljanovic, the creator of Neat Merchant and NeatBundles" })
      ] })
    }
  ) }) });
}
const route31 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: Index,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);
  if (!admin) {
    throw new Response();
  }
  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await prisma.session.delete({
          where: {
            id: session.id
          }
        });
        await prisma.user.update({
          where: {
            storeUrl: shop
          },
          data: {
            hasAppInstalled: false,
            activeBillingPlan: "NONE"
          }
        });
        console.log("APP_UNINSTALLED webhook handled");
      }
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }
  throw new Response();
};
const route32 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action
}, Symbol.toStringTag, { value: "Module" }));
const index = "_index_12o3y_1";
const heading = "_heading_12o3y_11";
const text = "_text_12o3y_12";
const content = "_content_12o3y_22";
const form = "_form_12o3y_27";
const label = "_label_12o3y_35";
const input = "_input_12o3y_43";
const button = "_button_12o3y_47";
const list = "_list_12o3y_51";
const styles = {
  index,
  heading,
  text,
  content,
  form,
  label,
  input,
  button,
  list
};
const loader$2 = async ({ request }) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return json({ showForm: Boolean(login) });
};
function App$1() {
  const { showForm } = useLoaderData();
  return /* @__PURE__ */ jsx("div", { className: styles.index, children: /* @__PURE__ */ jsxs("div", { className: styles.content, children: [
    /* @__PURE__ */ jsx("h1", { className: styles.heading, children: "A short heading about [your app]" }),
    /* @__PURE__ */ jsx("p", { className: styles.text, children: "A tagline about [your app] that describes your value proposition." }),
    showForm && /* @__PURE__ */ jsxs(Form, { className: styles.form, method: "post", action: "/auth/login", children: [
      /* @__PURE__ */ jsxs("label", { className: styles.label, children: [
        /* @__PURE__ */ jsx("span", { children: "Shop domain" }),
        /* @__PURE__ */ jsx("input", { className: styles.input, type: "text", name: "shop" }),
        /* @__PURE__ */ jsx("span", { children: "e.g: my-shop-domain.myshopify.com" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: styles.button, type: "submit", children: "Log in" })
    ] }),
    /* @__PURE__ */ jsxs("ul", { className: styles.list, children: [
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] })
    ] })
  ] }) });
}
const route33 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$1,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const route34 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{ rel: "stylesheet", href: polarisStyles }];
const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};
function App() {
  const { apiKey } = useLoaderData();
  return /* @__PURE__ */ jsxs(AppProvider$1, { isEmbeddedApp: true, apiKey, children: [
    /* @__PURE__ */ jsxs(NavMenu, { children: [
      /* @__PURE__ */ jsx(Link, { to: ".", rel: "home", children: "Home" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/global-settings", rel: "globalSettings", children: "Global settings" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/installation", rel: "installation", children: "Installation" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/billing", rel: "billing", children: "Billing" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/feature-request", rel: "featureRequest", children: "Request a feature" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/help", rel: "help", children: "Help" })
    ] }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
function ErrorBoundary() {
  return boundary.error(useRouteError());
}
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route35 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: App,
  headers,
  links,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-D9LAj2_K.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/components-BDrsBlv3.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-DbfF3Snt.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/components-BDrsBlv3.js"], "css": [] }, "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum.content": { "id": "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum.content", "parentId": "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum", "path": "content", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DA2rGA15.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Box-CnqJGKrn.js", "/assets/Bleed-DpULRbVU.js", "/assets/constants-xrzLx32Y.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/DeleteIcon.svg-BsxW9olQ.js", "/assets/InlineGrid-Df5BtU4c.js", "/assets/Select-Cif7Qcy3.js", "/assets/ChoiceList-Dt5iyaoi.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/useNavigateSubmit-CTqj78J6.js", "/assets/contentStepInputs-DCJJSpa0.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Banner-DrpU63xa.js", "/assets/Layout-CMntMX4Q.js", "/assets/Card-DdP2um4p.js", "/assets/Divider-BzciHtgk.js"], "css": [] }, "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum.product": { "id": "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum.product", "parentId": "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum", "path": "product", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CCHgtrgr.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/index-BdEiwQAR.js", "/assets/constants-xrzLx32Y.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/useNavigateSubmit-CTqj78J6.js", "/assets/resourcePicer-CAWIdYIt.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Banner-DrpU63xa.js", "/assets/Layout-CMntMX4Q.js", "/assets/Card-DdP2um4p.js", "/assets/InlineGrid-Df5BtU4c.js", "/assets/ChoiceList-Dt5iyaoi.js"], "css": [] }, "routes/app.create-bundle-builder.$bundleid.step-4-content": { "id": "routes/app.create-bundle-builder.$bundleid.step-4-content", "parentId": "routes/app.create-bundle-builder", "path": ":bundleid/step-4-content", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-NeUJ5SVP.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Box-CnqJGKrn.js", "/assets/Bleed-DpULRbVU.js", "/assets/constants-xrzLx32Y.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/DeleteIcon.svg-BsxW9olQ.js", "/assets/InlineGrid-Df5BtU4c.js", "/assets/Select-Cif7Qcy3.js", "/assets/ChoiceList-Dt5iyaoi.js", "/assets/index-dL4ND7l9.js", "/assets/wideButton-D6W8M1Od.js", "/assets/contentStepInputs-DCJJSpa0.js", "/assets/index-y3bcNOgC.js"], "css": ["/assets/route-BImhF-Qa.css"] }, "routes/app.create-bundle-builder.$bundleid.step-4-product": { "id": "routes/app.create-bundle-builder.$bundleid.step-4-product", "parentId": "routes/app.create-bundle-builder", "path": ":bundleid/step-4-product", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-Dgha10IP.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/index-BdEiwQAR.js", "/assets/constants-xrzLx32Y.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/resourcePicer-CAWIdYIt.js", "/assets/wideButton-D6W8M1Od.js", "/assets/TextField-B-Nm0VLF.js", "/assets/InlineGrid-Df5BtU4c.js", "/assets/Box-CnqJGKrn.js"], "css": ["/assets/route-BImhF-Qa.css"] }, "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum": { "id": "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum", "parentId": "routes/app", "path": "edit-bundle-builder/:bundleid/steps/:stepnum", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DZ6_uRNf.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/constants-xrzLx32Y.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Page-C2Lx7T4Z.js", "/assets/FooterHelp-BUGPZSpp.js"], "css": [] }, "routes/app.edit-bundle-builder.$bundleid_.settings": { "id": "routes/app.edit-bundle-builder.$bundleid_.settings", "parentId": "routes/app", "path": "edit-bundle-builder/:bundleid/settings", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-D5Hckd-B.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/index-BdEiwQAR.js", "/assets/constants-xrzLx32Y.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Page-C2Lx7T4Z.js", "/assets/InlineGrid-Df5BtU4c.js", "/assets/ChoiceList-Dt5iyaoi.js", "/assets/QuestionCircleIcon.svg-CfqkKV47.js", "/assets/Divider-BzciHtgk.js", "/assets/FooterHelp-BUGPZSpp.js"], "css": [] }, "routes/app.create-bundle-builder.$bundleid.step-1": { "id": "routes/app.create-bundle-builder.$bundleid.step-1", "parentId": "routes/app.create-bundle-builder", "path": ":bundleid/step-1", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-TH0X-p7v.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/wideButton-D6W8M1Od.js", "/assets/constants-xrzLx32Y.js", "/assets/index-dL4ND7l9.js", "/assets/ButtonGroup-GOmEL2FH.js"], "css": ["/assets/route-y3_RWFuJ.css"] }, "routes/app.create-bundle-builder.$bundleid.step-2": { "id": "routes/app.create-bundle-builder.$bundleid.step-2", "parentId": "routes/app.create-bundle-builder", "path": ":bundleid/step-2", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-xdw0uHde.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/index-BdEiwQAR.js", "/assets/constants-xrzLx32Y.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/resourcePicer-CAWIdYIt.js", "/assets/wideButton-D6W8M1Od.js", "/assets/components-BDrsBlv3.js", "/assets/TextField-B-Nm0VLF.js", "/assets/InlineGrid-Df5BtU4c.js", "/assets/Box-CnqJGKrn.js"], "css": ["/assets/route-BImhF-Qa.css"] }, "routes/app.create-bundle-builder.$bundleid.step-3": { "id": "routes/app.create-bundle-builder.$bundleid.step-3", "parentId": "routes/app.create-bundle-builder", "path": ":bundleid/step-3", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-Bf0NeADO.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/constants-xrzLx32Y.js", "/assets/wideButton-D6W8M1Od.js", "/assets/index-dL4ND7l9.js", "/assets/ButtonGroup-GOmEL2FH.js"], "css": ["/assets/route-y3_RWFuJ.css"] }, "routes/app.create-bundle-builder.$bundleid.step-5": { "id": "routes/app.create-bundle-builder.$bundleid.step-5", "parentId": "routes/app.create-bundle-builder", "path": ":bundleid/step-5", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-B3fAhuFP.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Box-CnqJGKrn.js", "/assets/wideButton-D6W8M1Od.js", "/assets/constants-xrzLx32Y.js", "/assets/BundleDiscountTypeClient-B-3njYHa.js", "/assets/components-BDrsBlv3.js", "/assets/Select-Cif7Qcy3.js"], "css": ["/assets/route-y3_RWFuJ.css"] }, "routes/app.create-bundle-builder.$bundleid.step-6": { "id": "routes/app.create-bundle-builder.$bundleid.step-6", "parentId": "routes/app.create-bundle-builder", "path": ":bundleid/step-6", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-BT4UGB62.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/constants-xrzLx32Y.js", "/assets/components-BDrsBlv3.js", "/assets/Banner-DrpU63xa.js", "/assets/Divider-BzciHtgk.js", "/assets/InlineGrid-Df5BtU4c.js", "/assets/EditIcon.svg-SYyjgaKg.js", "/assets/ExternalIcon.svg-1Nno8FFk.js"], "css": ["/assets/route-y3_RWFuJ.css"] }, "routes/app.edit-bundle-builder.$bundleid.builder": { "id": "routes/app.edit-bundle-builder.$bundleid.builder", "parentId": "routes/app.edit-bundle-builder.$bundleid", "path": "builder", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/route-C0TbBfvG.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Bleed-DpULRbVU.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/index-BdEiwQAR.js", "/assets/constants-xrzLx32Y.js", "/assets/BundleDiscountTypeClient-B-3njYHa.js", "/assets/useNavigateSubmit-CTqj78J6.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Divider-BzciHtgk.js", "/assets/EmptyState-Bdvqmiml.js", "/assets/DeleteIcon.svg-BsxW9olQ.js", "/assets/EditIcon.svg-SYyjgaKg.js", "/assets/Page-C2Lx7T4Z.js", "/assets/ExternalIcon.svg-1Nno8FFk.js", "/assets/Banner-DrpU63xa.js", "/assets/Layout-CMntMX4Q.js", "/assets/ChoiceList-Dt5iyaoi.js", "/assets/QuestionCircleIcon.svg-CfqkKV47.js", "/assets/Select-Cif7Qcy3.js", "/assets/FooterHelp-BUGPZSpp.js"], "css": ["/assets/route-DUx7zfRl.css"] }, "routes/app.edit-bundle-builder.$bundleid_.steps": { "id": "routes/app.edit-bundle-builder.$bundleid_.steps", "parentId": "routes/app", "path": "edit-bundle-builder/:bundleid/steps", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app.edit-bundle-builder.$bundleid": { "id": "routes/app.edit-bundle-builder.$bundleid", "parentId": "routes/app", "path": "edit-bundle-builder/:bundleid", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DyedghEA.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Icon-C-cZWGQM.js", "/assets/constants-xrzLx32Y.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Badge-PSuHbHll.js"], "css": ["/assets/route-Ek3ca9Tv.css"] }, "routes/app.create-bundle-builder": { "id": "routes/app.create-bundle-builder", "parentId": "routes/app", "path": "create-bundle-builder", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CLaND_7S.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/constants-xrzLx32Y.js", "/assets/components-BDrsBlv3.js", "/assets/Page-C2Lx7T4Z.js", "/assets/Card-DdP2um4p.js", "/assets/Divider-BzciHtgk.js", "/assets/FooterHelp-BUGPZSpp.js"], "css": ["/assets/route-cpqcxQRN.css"] }, "routes/app.users.$userid.bundles": { "id": "routes/app.users.$userid.bundles", "parentId": "routes/app.users.$userid", "path": "bundles", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CVJD9pGP.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/TextField-B-Nm0VLF.js", "/assets/index-BdEiwQAR.js", "/assets/constants-xrzLx32Y.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/EmptyState-Bdvqmiml.js", "/assets/Badge-PSuHbHll.js", "/assets/DeleteIcon.svg-BsxW9olQ.js", "/assets/EditIcon.svg-SYyjgaKg.js", "/assets/ExternalIcon.svg-1Nno8FFk.js"], "css": ["/assets/route-BImhF-Qa.css"] }, "routes/api.bundleData.addToCart": { "id": "routes/api.bundleData.addToCart", "parentId": "routes/api.bundleData", "path": "addToCart", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-RnTpOC5-.js", "imports": [], "css": [] }, "routes/api.bundleData.settings": { "id": "routes/api.bundleData.settings", "parentId": "routes/api.bundleData", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-C6Kfwj0f.js", "imports": [], "css": [] }, "routes/api.bundleData.step": { "id": "routes/api.bundleData.step", "parentId": "routes/api.bundleData", "path": "step", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-K6Dvbx-E.js", "imports": [], "css": [] }, "routes/app.feature-request": { "id": "routes/app.feature-request", "parentId": "routes/app", "path": "feature-request", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-D16gB777.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/index-dL4ND7l9.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/index-y3bcNOgC.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/constants-xrzLx32Y.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Page-C2Lx7T4Z.js", "/assets/components-BDrsBlv3.js"], "css": [] }, "routes/app.global-settings": { "id": "routes/app.global-settings", "parentId": "routes/app", "path": "global-settings", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-Do1ZZBVC.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/index-BdEiwQAR.js", "/assets/constants-xrzLx32Y.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Page-C2Lx7T4Z.js", "/assets/Banner-DrpU63xa.js", "/assets/InlineGrid-Df5BtU4c.js", "/assets/Divider-BzciHtgk.js", "/assets/FooterHelp-BUGPZSpp.js"], "css": ["/assets/route-thf1sFg_.css"] }, "routes/api.globalSettings": { "id": "routes/api.globalSettings", "parentId": "root", "path": "api/globalSettings", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DP2rzg_V.js", "imports": [], "css": [] }, "routes/app.users.$userid": { "id": "routes/app.users.$userid", "parentId": "routes/app", "path": "users/:userid", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-C9-tTBI6.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Page-C2Lx7T4Z.js", "/assets/Banner-DrpU63xa.js", "/assets/useNavigateSubmit-CTqj78J6.js", "/assets/constants-xrzLx32Y.js", "/assets/tutorial_tumbnail-5LrMXLRw.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Divider-BzciHtgk.js", "/assets/ExternalIcon.svg-1Nno8FFk.js", "/assets/FooterHelp-BUGPZSpp.js"], "css": [] }, "routes/app.installation": { "id": "routes/app.installation", "parentId": "routes/app", "path": "installation", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DkdWK6PO.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/index-dL4ND7l9.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/index-y3bcNOgC.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Page-C2Lx7T4Z.js", "/assets/Banner-DrpU63xa.js", "/assets/constants-xrzLx32Y.js", "/assets/tutorial_tumbnail-5LrMXLRw.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Divider-BzciHtgk.js", "/assets/InlineGrid-Df5BtU4c.js", "/assets/ExternalIcon.svg-1Nno8FFk.js", "/assets/FooterHelp-BUGPZSpp.js"], "css": [] }, "routes/api.bundleData": { "id": "routes/api.bundleData", "parentId": "root", "path": "api/bundleData", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DVN7Oi2P.js", "imports": [], "css": [] }, "routes/app.thank-you": { "id": "routes/app.thank-you", "parentId": "routes/app", "path": "thank-you", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CrIypIDK.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/constants-xrzLx32Y.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Page-C2Lx7T4Z.js", "/assets/Banner-DrpU63xa.js", "/assets/FooterHelp-BUGPZSpp.js"], "css": [] }, "routes/app.billing": { "id": "routes/app.billing", "parentId": "routes/app", "path": "billing", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-sB1D-GO9.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Box-CnqJGKrn.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/constants-xrzLx32Y.js", "/assets/index-BdEiwQAR.js", "/assets/Card-DdP2um4p.js", "/assets/Divider-BzciHtgk.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Page-C2Lx7T4Z.js", "/assets/Banner-DrpU63xa.js"], "css": ["/assets/route-DYtOhT7v.css"] }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-Bj53Isn-.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js"], "css": [] }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "root", "path": "auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CnWFt-s4.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/context-C-JwoyEZ.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/context-g-r66Qxo.js", "/assets/context-B2IVp4WU.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/styles-Enhus2Kl.js", "/assets/components-BDrsBlv3.js", "/assets/Page-C2Lx7T4Z.js", "/assets/Card-DdP2um4p.js"], "css": [] }, "routes/app.error": { "id": "routes/app.error", "parentId": "routes/app", "path": "error", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CVqyngU4.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/constants-xrzLx32Y.js", "/assets/components-BDrsBlv3.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Page-C2Lx7T4Z.js", "/assets/Banner-DrpU63xa.js", "/assets/FooterHelp-BUGPZSpp.js"], "css": [] }, "routes/app.help": { "id": "routes/app.help", "parentId": "routes/app", "path": "help", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DWM1R2zS.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/context-C-JwoyEZ.js", "/assets/BlockStack-CBC_PXe6.js", "/assets/Box-CnqJGKrn.js", "/assets/InlineStack-BYbsxF_T.js", "/assets/within-content-context-B9v2rWOt.js", "/assets/Icon-C-cZWGQM.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/use-toggle-Bx-o2WPs.js", "/assets/use-event-listener-DOg0fKDs.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/index-dL4ND7l9.js", "/assets/ButtonGroup-GOmEL2FH.js", "/assets/context-g-r66Qxo.js", "/assets/index-y3bcNOgC.js", "/assets/Bleed-DpULRbVU.js", "/assets/TextField-B-Nm0VLF.js", "/assets/Pagination-B_BjUQTQ.js", "/assets/Badge-PSuHbHll.js", "/assets/context-B2IVp4WU.js", "/assets/constants-xrzLx32Y.js", "/assets/SkeletonPage-oS14FYNy.js", "/assets/Card-DdP2um4p.js", "/assets/SkeletonBodyText-PJLcqbGt.js", "/assets/Page-C2Lx7T4Z.js", "/assets/components-BDrsBlv3.js"], "css": [] }, "routes/webhooks": { "id": "routes/webhooks", "parentId": "root", "path": "webhooks", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-E7u1mBCF.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/components-BDrsBlv3.js"], "css": ["/assets/route-COVlfczw.css"] }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/route-Cdl1nL0F.js", "imports": ["/assets/jsx-runtime-BMrMXMSG.js", "/assets/index-dL4ND7l9.js", "/assets/index-y3bcNOgC.js", "/assets/context-C-JwoyEZ.js", "/assets/use-is-after-initial-mount-DPsAqfZs.js", "/assets/context-g-r66Qxo.js", "/assets/context-B2IVp4WU.js", "/assets/EventListener-kZJ1rsuP.js", "/assets/components-BDrsBlv3.js", "/assets/styles-Enhus2Kl.js", "/assets/index-BdEiwQAR.js"], "css": [] } }, "url": "/assets/manifest-004f08e4.js", "version": "004f08e4" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "unstable_singleFetch": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum.content": {
    id: "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum.content",
    parentId: "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum",
    path: "content",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum.product": {
    id: "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum.product",
    parentId: "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum",
    path: "product",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/app.create-bundle-builder.$bundleid.step-4-content": {
    id: "routes/app.create-bundle-builder.$bundleid.step-4-content",
    parentId: "routes/app.create-bundle-builder",
    path: ":bundleid/step-4-content",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/app.create-bundle-builder.$bundleid.step-4-product": {
    id: "routes/app.create-bundle-builder.$bundleid.step-4-product",
    parentId: "routes/app.create-bundle-builder",
    path: ":bundleid/step-4-product",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum": {
    id: "routes/app.edit-bundle-builder.$bundleid_.steps_.$stepnum",
    parentId: "routes/app",
    path: "edit-bundle-builder/:bundleid/steps/:stepnum",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/app.edit-bundle-builder.$bundleid_.settings": {
    id: "routes/app.edit-bundle-builder.$bundleid_.settings",
    parentId: "routes/app",
    path: "edit-bundle-builder/:bundleid/settings",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/app.create-bundle-builder.$bundleid.step-1": {
    id: "routes/app.create-bundle-builder.$bundleid.step-1",
    parentId: "routes/app.create-bundle-builder",
    path: ":bundleid/step-1",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/app.create-bundle-builder.$bundleid.step-2": {
    id: "routes/app.create-bundle-builder.$bundleid.step-2",
    parentId: "routes/app.create-bundle-builder",
    path: ":bundleid/step-2",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/app.create-bundle-builder.$bundleid.step-3": {
    id: "routes/app.create-bundle-builder.$bundleid.step-3",
    parentId: "routes/app.create-bundle-builder",
    path: ":bundleid/step-3",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/app.create-bundle-builder.$bundleid.step-5": {
    id: "routes/app.create-bundle-builder.$bundleid.step-5",
    parentId: "routes/app.create-bundle-builder",
    path: ":bundleid/step-5",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/app.create-bundle-builder.$bundleid.step-6": {
    id: "routes/app.create-bundle-builder.$bundleid.step-6",
    parentId: "routes/app.create-bundle-builder",
    path: ":bundleid/step-6",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/app.edit-bundle-builder.$bundleid.builder": {
    id: "routes/app.edit-bundle-builder.$bundleid.builder",
    parentId: "routes/app.edit-bundle-builder.$bundleid",
    path: "builder",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/app.edit-bundle-builder.$bundleid_.steps": {
    id: "routes/app.edit-bundle-builder.$bundleid_.steps",
    parentId: "routes/app",
    path: "edit-bundle-builder/:bundleid/steps",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "routes/app.edit-bundle-builder.$bundleid": {
    id: "routes/app.edit-bundle-builder.$bundleid",
    parentId: "routes/app",
    path: "edit-bundle-builder/:bundleid",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/app.create-bundle-builder": {
    id: "routes/app.create-bundle-builder",
    parentId: "routes/app",
    path: "create-bundle-builder",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "routes/app.users.$userid.bundles": {
    id: "routes/app.users.$userid.bundles",
    parentId: "routes/app.users.$userid",
    path: "bundles",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  },
  "routes/api.bundleData.addToCart": {
    id: "routes/api.bundleData.addToCart",
    parentId: "routes/api.bundleData",
    path: "addToCart",
    index: void 0,
    caseSensitive: void 0,
    module: route17
  },
  "routes/api.bundleData.settings": {
    id: "routes/api.bundleData.settings",
    parentId: "routes/api.bundleData",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route18
  },
  "routes/api.bundleData.step": {
    id: "routes/api.bundleData.step",
    parentId: "routes/api.bundleData",
    path: "step",
    index: void 0,
    caseSensitive: void 0,
    module: route19
  },
  "routes/app.feature-request": {
    id: "routes/app.feature-request",
    parentId: "routes/app",
    path: "feature-request",
    index: void 0,
    caseSensitive: void 0,
    module: route20
  },
  "routes/app.global-settings": {
    id: "routes/app.global-settings",
    parentId: "routes/app",
    path: "global-settings",
    index: void 0,
    caseSensitive: void 0,
    module: route21
  },
  "routes/api.globalSettings": {
    id: "routes/api.globalSettings",
    parentId: "root",
    path: "api/globalSettings",
    index: void 0,
    caseSensitive: void 0,
    module: route22
  },
  "routes/app.users.$userid": {
    id: "routes/app.users.$userid",
    parentId: "routes/app",
    path: "users/:userid",
    index: void 0,
    caseSensitive: void 0,
    module: route23
  },
  "routes/app.installation": {
    id: "routes/app.installation",
    parentId: "routes/app",
    path: "installation",
    index: void 0,
    caseSensitive: void 0,
    module: route24
  },
  "routes/api.bundleData": {
    id: "routes/api.bundleData",
    parentId: "root",
    path: "api/bundleData",
    index: void 0,
    caseSensitive: void 0,
    module: route25
  },
  "routes/app.thank-you": {
    id: "routes/app.thank-you",
    parentId: "routes/app",
    path: "thank-you",
    index: void 0,
    caseSensitive: void 0,
    module: route26
  },
  "routes/app.billing": {
    id: "routes/app.billing",
    parentId: "routes/app",
    path: "billing",
    index: void 0,
    caseSensitive: void 0,
    module: route27
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route28
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route29
  },
  "routes/app.error": {
    id: "routes/app.error",
    parentId: "routes/app",
    path: "error",
    index: void 0,
    caseSensitive: void 0,
    module: route30
  },
  "routes/app.help": {
    id: "routes/app.help",
    parentId: "routes/app",
    path: "help",
    index: void 0,
    caseSensitive: void 0,
    module: route31
  },
  "routes/webhooks": {
    id: "routes/webhooks",
    parentId: "root",
    path: "webhooks",
    index: void 0,
    caseSensitive: void 0,
    module: route32
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route33
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route34
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route35
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
