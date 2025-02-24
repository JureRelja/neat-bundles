import db, { ContentInput } from "@db/server";

export class BundleBuilderContentInputRepository {
    public async addContentInputs(bundleStepId: number, contentInputs: ContentInput[]): Promise<number> {
        const newContentInputs = await db.contentInput.createMany({
            data: contentInputs.map((contentInput) => {
                return {
                    bundleStepId: bundleStepId,
                    inputLabel: contentInput.inputLabel,
                    inputType: contentInput.inputType,
                    maxChars: contentInput.maxChars,
                    required: contentInput.required,
                };
            }),
        });

        if (!newContentInputs) throw "Failed to create new content inputs";

        return newContentInputs.count;
    }
}

export const bundleBuilderContentInputRepository = new BundleBuilderContentInputRepository();
