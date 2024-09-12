import { FileStoreService } from "../FileStoreService";
import { Storage } from "@google-cloud/storage";

const storage = new Storage();

const bucket = process.env.BUCKET_NAME as string;

export class FileStoreServiceImpl implements FileStoreService {
  constructor() {
    // Implementation
  }

  public async uploadMultipleFiles(files: File[]): Promise<string[]> {
    const fileUrls: string[] = [];
    files.forEach(async (file) => {
      const fileId = await this.uploadFile(file);

      fileUrls.push(`${process.env.BUCKET_URL}/${fileId}`);
    });
    return fileUrls;
  }

  public async uploadFile(file: File): Promise<string> {
    const fileId = file.name + Date.now();

    const fileContent = await file.text();

    try {
      await storage.bucket(bucket).file(fileId).save(fileContent);
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
