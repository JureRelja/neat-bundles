import { FileStoreService } from '../FileStoreService';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();

const bucket = process.env.BUCKET_NAME as string;

export class FileStoreServiceImpl implements FileStoreService {
    constructor() {
        // Implementation
    }

    public async uploadFile(fileName: string, files: File | File[]): Promise<string> {
        //File for upload
        let fileToUpload: File;

        //Check if the file is an array or a single file
        if (!Array.isArray(files)) {
            fileToUpload = files as File;
        } else {
            fileToUpload = files.find((file) => {
                return file.name === fileName;
            }) as File;
        }

        const fileId = Date.now() + fileName;

        //Getting the file content
        const fileContent = (await fileToUpload.stream().getReader().read()) as { done: boolean; value: Uint8Array };

        try {
            await storage.bucket(bucket).file(fileId).save(fileContent.value);
        } catch (error) {
            console.log(error);
        }

        return `${process.env.BUCKET_URL}/${fileId}`;
    }

    public async getFile(fileUrl: string): Promise<File | null> {
        // Implementation

        return null;
    }
    public deleteFile(fileUrl: string): boolean {
        // Implementation

        return false;
    }
}
