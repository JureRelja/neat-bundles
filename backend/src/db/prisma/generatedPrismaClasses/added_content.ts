import { CreatedBundle } from "./created_bundle";
import { InputType } from "@prisma/client";

export class AddedContent {
    id: number;

    contentType: InputType;

    contentValue: string;

    createdBundleId: number;

    CreatedBundle: CreatedBundle;
}
