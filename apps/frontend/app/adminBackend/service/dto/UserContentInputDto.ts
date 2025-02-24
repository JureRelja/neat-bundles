import { InputType } from "@db/server";

export interface UserContentInputDto {
    inputType: InputType;
    inputLabel: string;
    maxChars: number;
    required: boolean;
}
