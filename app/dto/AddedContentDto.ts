import { AddedContentItemDto } from './AddedContentItemDto';

export class AddedContentDto {
    private stepNumber: number;
    private contentItems: AddedContentItemDto[];

    constructor(stepNumber: number, contentItems: AddedContentItemDto[]) {
        this.stepNumber = stepNumber;
        this.contentItems = contentItems;
    }

    public getStepNumber(): number {
        return this.stepNumber;
    }

    public getContentItems(): AddedContentItemDto[] {
        return this.contentItems;
    }

    public setStepNumber(stepNumber: number): void {
        this.stepNumber = stepNumber;
    }

    public setContentItems(contentItems: AddedContentItemDto[]): void {
        this.contentItems = contentItems;
    }

    public addContentItem(contentItem: AddedContentItemDto): void {
        this.contentItems.push(contentItem);
    }
}
