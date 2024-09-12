import { InputType } from "@prisma/client";

export interface AddedContentDto {
  contentType: InputType;
  value: string;
}
