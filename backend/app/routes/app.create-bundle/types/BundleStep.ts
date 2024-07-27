import { Product } from "node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/product";
import { Collection } from "node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/collection";
import { BaseResource } from "@shopify/app-bridge-types";

export type ProductResourceList = Product[] | Collection[];

export enum ProductResourceType {
  PRODUCT = "product",
  COLLECTION = "collection",
}

export enum BundleStepType {
  PRODUCT = "product",
  CONTENT = "content",
}

export type BundleStep = {
  stepId: number;
  title: string;
  stepType: BundleStepType;
  description: string;
  productResources: {
    resourceType: ProductResourceType;
    selectedResources: BaseResource[];
  };
  productRules: {
    minProductsOnStep: number;
    maxProductsOnStep: number;
  };
  stepRules: {
    allowProductDuplicates: boolean;
    showProductPrice: boolean;
  };
};

export const defaultBundleStep = (stepId: number): BundleStep => {
  return {
    stepId: stepId,
    title: "Step " + stepId,
    stepType: BundleStepType.PRODUCT,
    description: "Step description",
    productResources: {
      resourceType: ProductResourceType.PRODUCT,
      selectedResources: [],
    },
    productRules: {
      minProductsOnStep: 1,
      maxProductsOnStep: 3,
    },
    stepRules: {
      allowProductDuplicates: false,
      showProductPrice: true,
    },
  };
};

// export class BundleStepClass {
//   stepId: number;
//   title: string;
//   stepType: "product" | "content";
//   description: string;
//   products: string[];

//   constructor(
//     stepId: number,
//     title: string,
//     stepType: "product" | "content",
//     description: string,
//     products: string[],
//   ) {
//     this.stepId = stepId;
//     this.title = title;
//     this.stepType = stepType;
//     this.description = description;
//     this.products = products;
//   }
// }
