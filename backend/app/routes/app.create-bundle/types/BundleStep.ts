export type BundleStep = {
  stepId: number;
  title: string;
  stepType: "product" | "content";
  description: string;
  products: string[];
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
    stepType: "product",
    description: "Step description",
    products: [],
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
