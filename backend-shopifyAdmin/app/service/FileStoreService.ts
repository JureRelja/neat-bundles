export interface FileStoreService {
  uploadFile(file: File): string;

  getFile(fileUrl: string): File | null;

  deleteFile(fileUrl: string): boolean;
}
