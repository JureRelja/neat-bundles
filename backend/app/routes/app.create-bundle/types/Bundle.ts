import { BundleStep, defaultBundleStep } from "./BundleStep";
import { BundleSettings, defaultBundleSettings } from "./BundleSettings";
import { v4 as uuidv4 } from "uuid";

export type Bundle = {
  id: string;
  title: string;
  steps: BundleStep[];
  settings: BundleSettings;
};

export const defaultBundle: Bundle = {
  id: uuidv4(),
  title: "Super awesome custom bundle",
  steps: [defaultBundleStep(1), defaultBundleStep(2), defaultBundleStep(3)],
  settings: defaultBundleSettings,
};

export class BundleClass {
  private id: string;
  private title: string;
  private steps: BundleStep[];
  private settings: BundleSettings;

  constructor() {
    this.id = uuidv4();
    this.title = "Super awesome custom bundle";

    this.steps = [
      defaultBundleStep(1),
      defaultBundleStep(2),
      defaultBundleStep(3),
    ];
    this.settings = defaultBundleSettings;
  }

  public getSteps(): BundleStep[] {
    return this.steps;
  }

  public newStep(): void {
    const newStepId = this.steps.length + 1;
    this.steps.push(defaultBundleStep(newStepId));
  }

  public removeStep(stepId: number): void {
    this.steps = this.steps.filter((step) => step.stepId !== stepId);
  }

  public updateStep(stepData: BundleStep): void {
    const stepIndex = this.steps.findIndex(
      (step) => step.stepId === stepData.stepId,
    );
    this.steps[stepIndex] = stepData;
  }

  public getTitle(): string {
    return this.title;
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public getSettings(): BundleSettings {
    return this.settings;
  }

  public setSettings(settings: BundleSettings): void {
    this.settings = settings;
  }

  public getId(): string {
    return this.id;
  }
}
