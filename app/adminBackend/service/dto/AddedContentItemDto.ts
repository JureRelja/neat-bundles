import { InputType } from '@prisma/client';

export interface AddedContentItemDto {
    contentType: InputType;
    value: string;
}
