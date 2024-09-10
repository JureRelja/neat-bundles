import multer from "multer";
import { FileStoreService } from "../FileStoreService";

export class FileStoreServiceImpl implements FileStoreService {
  constructor() {
    // Implementation
  }

  public uploadFile(file: File): string {
    // Implementation
    return "";
  }
  public getFile(fileUrl: string): File | null {
    // Implementation

    return null;
  }
  public deleteFile(fileUrl: string): boolean {
    // Implementation

    return false;
  }
}
