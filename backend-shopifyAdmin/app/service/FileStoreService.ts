export interface FileStoreService {
  uploadFile(file: File): Promise<string>;

  uploadMultipleFiles(files: File[]): Promise<string[]>;

  getFile(fileUrl: string): Promise<File | null>;

  deleteFile(fileUrl: string): boolean;
}
