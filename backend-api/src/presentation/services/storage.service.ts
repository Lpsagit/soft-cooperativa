import { IStorageProvider } from "../../adapters/local-storage.adapter";

export class StorageService {
  constructor(private readonly provider: IStorageProvider) {}

  public uploadFile(file: Express.Multer.File, folder?: string) {
    return this.provider.upload(file, folder);
  }

  public deleteFile(fileName: string) {
    return this.provider.delete(fileName);
  }
}
