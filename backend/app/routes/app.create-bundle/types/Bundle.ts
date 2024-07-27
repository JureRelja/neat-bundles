import { BundleStep, defaultBundleStep } from "./BundleStep";
import { v4 as uuidv4 } from "uuid";

export enum BundleType {
  FIXED = "fixed",
  CALCULATED = "calculated",
}

export type Bundle = {
  id: string;
  title: string;
  description: string;
  type: BundleType;
  steps: BundleStep[];
  settings: string[];
};

export const defaultBundle: Bundle = {
  id: uuidv4(),
  title: "Super awesome custom bundle",
  description: "Bundle description",
  type: BundleType.FIXED,
  steps: [defaultBundleStep(1), defaultBundleStep(2), defaultBundleStep(3)],
  settings: [],
};

// export class Bundle {
//   id: string;
//   title: string;
//   description: string;
//   type: "fixed" | "calculated";
//   steps: BundleStepClass[];
//   settings: string;

//   constructor(numOfSteps: number) {
//     this.id = uuidv4();
//     this.title = "Super awesome custom bundle";
//     this.description = "Bundle description";
//     this.steps = this.generateSteps(numOfSteps);
//     this.settings = "";
//     this.type = "fixed";
//   }

//   private generateSteps(numOfSteps: number): BundleStepClass[] {
//     const steps = [];
//     for (let i = 1; i <= numOfSteps; i++) {
//       steps.push(
//         new BundleStepClass(i, `Step ${i}`, "product", "Step description", []),
//       );
//     }
//     return steps;
//   }

//   public getSteps(): BundleStepClass[] {
//     return this.steps;
//   }

//   public newStep(): void {
//     const newStepId = this.steps.length + 1;
//     this.steps.push(
//       new BundleStepClass(
//         newStepId,
//         `Step ${newStepId}`,
//         "product",
//         "Step description",
//         [],
//       ),
//     );
//   }

//   public removeStep(stepId: number): void {
//     this.steps = this.steps.filter((step) => step.stepId !== stepId);
//   }

//   public updateStep(stepData: BundleStepClass): void {
//     const stepIndex = this.steps.findIndex(
//       (step) => step.stepId === stepData.stepId,
//     );
//     this.steps[stepIndex] = stepData;
//   }

//   public getTitle(): string {
//     return this.title;
//   }

//   public setTitle(title: string): void {
//     this.title = title;
//   }

//   public getDescription(): string {
//     return this.description;
//   }

//   public setDescription(description: string): void {
//     this.description = description;
//   }

//   public getSettings(): string {
//     return this.settings;
//   }

//   public setSettings(settings: string): void {
//     this.settings = settings;
//   }

//   public getType(): "fixed" | "calculated" {
//     return this.type;
//   }

//   public setType(type: "fixed" | "calculated"): void {
//     this.type = type;
//   }
// }
