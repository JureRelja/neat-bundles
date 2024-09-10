import { ContentDto } from "./ContentDto";

export class ContentInputsDto {
  private content: ContentDto[];

  constructor(content: ContentDto[]) {
    this.content = content;
  }

  public getContent(): ContentDto[] {
    return this.content;
  }
}
