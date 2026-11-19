import { UuidAdapter } from "../config";
import path from "path";
import fs from "fs";
import { CustomError } from "../domain";
export interface IStorageProvider {
  upload(file: Express.Multer.File, folder?: string): Promise<string>;

  delete(fileName: string): Promise<void>;
}

const validExtensions: string[] = ["png", "jpg", "jpeg"];

export class LocalStorageAdapter implements IStorageProvider {
  constructor(private readonly uuid = UuidAdapter.v4) {}

  private checkFolder(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }

  async upload(file: Express.Multer.File, folder?: string): Promise<string> {
    //* guardar archivo
    //? obtenemos un nuevo nombre para el archivo

    //const fileExtension = file!.mimetype.split("/").at(1) ?? "";
    const fileExtension = path
      .extname(file.originalname)
      .replace(".", "")
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      throw CustomError.badRequest(`Extencion no valida ${fileExtension}`);
    }

    const destination = path.resolve(
      __dirname,
      "../../",
      `uploads/${folder ?? ""}`,
    );
    this.checkFolder(destination);

    const fileName = `${this.uuid()}.${fileExtension}`;

    //movemos la imagen a la carpeta upload
    const filePath = path.join(destination, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return `${folder ? `uploads/${folder}/` : ""}${fileName}`;
  }

  async delete(fileName: string): Promise<void> {
    // eliminar archivo
  }
}
