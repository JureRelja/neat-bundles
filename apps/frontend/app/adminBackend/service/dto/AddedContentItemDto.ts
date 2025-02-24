import { InputType } from "@db/server";

export interface AddedContentItemDto {
    contentType: InputType;
    value: string;
}
