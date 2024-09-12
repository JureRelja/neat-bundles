export interface CustomerInput {
  stepNumber: number;
  stepType: "PRODUCT" | "CONTENT";
  value:
    | { id: number; quantity: number }[]
    | { id: number; type: "file" | "text"; value: string }[];
}
