import { InputType } from "@prisma/client";

export interface UserContentInputDto {
    inputType: InputType;
    inputLabel: string;
    maxChars: number;
    required: boolean;
}
