import { UuidAdapter } from "../config";
import path from "path";
import fs from "fs";
import sharp, { Metadata } from "sharp";
import { CustomError } from "../domain";

export interface IStorageProvider {
  upload(file: Express.Multer.File, folder?: string): Promise<string>;
  delete(fileName: string): Promise<void>;
}

const validFormats = ["png", "jpeg"] as const;

export class LocalStorageAdapter implements IStorageProvider {
  constructor(private readonly uuid = UuidAdapter.v4) {}

  private checkFolder(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
      // recursive: true evita errores si la ruta incluye subcarpetas inexistentes
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, folder?: string): Promise<string> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw CustomError.badRequest("No se ha proporcionado un archivo válido");
    }

    // 1. VALIDACIÓN REAL DEL CONTENIDO
    //
    // No confiamos en:
    // - file.originalname
    // - file.mimetype
    // - la extensión enviada por el usuario
    //
    // Sharp intenta interpretar realmente el contenido binario.
    let metadata: Metadata;

    try {
      metadata = await sharp(file.buffer).metadata();
    } catch {
      throw CustomError.badRequest(
        "El archivo no es una imagen válida o está corrupto",
      );
    }

    // 2. VALIDAR EL FORMATO REAL DE LA IMAGEN
    //
    // Sharp obtiene el formato a partir del contenido del archivo,
    // no de la extensión proporcionada por el usuario.
    const detectedFormat = metadata.format?.toLowerCase();

    if (
      !detectedFormat ||
      !validFormats.includes(detectedFormat as (typeof validFormats)[number])
    ) {
      throw CustomError.badRequest(
        "Formato de imagen no permitido. Solo se permiten PNG y JPEG",
      );
    }

    // 3. CREACIÓN DE RUTA Y NOMBRE SEGURO
    //
    // Nunca utilizamos el nombre original enviado por el usuario.
    const destination = path.resolve(
      __dirname,
      "../../",
      `uploads/${folder ?? ""}`,
    );

    this.checkFolder(destination);

    // Normalizamos JPEG a una única extensión.
    const realExtension = detectedFormat === "jpeg" ? "jpg" : "png";

    const fileName = `${this.uuid()}.${realExtension}`;
    const filePath = path.join(destination, fileName);

    // 4. REPROCESAMIENTO DE LA IMAGEN
    //
    // Sharp decodifica la imagen y genera un archivo nuevo.
    // No copiamos directamente el archivo original al servidor.
    //
    // Esto elimina contenido arbitrario que pudiera venir dentro
    // del archivo original y permite controlar el formato de salida.
    try {
      const image = sharp(file.buffer).rotate();

      if (realExtension === "jpg") {
        await image
          .jpeg({
            quality: 90,
            mozjpeg: true,
          })
          .toFile(filePath);
      } else {
        await image
          .png({
            compressionLevel: 6,
          })
          .toFile(filePath);
      }
    } catch (error) {
      throw CustomError.internalServer(
        `Error al procesar la imagen: ${(error as Error).message}`,
      );
    }

    // 5. DEVOLVER ÚNICAMENTE LA RUTA GENERADA POR EL SERVIDOR
    return `${folder ? `uploads/${folder}/` : ""}${fileName}`;
  }

  async delete(fileName: string): Promise<void> {
    // Prevención de Path Traversal.
    //
    // Ejemplo bloqueado:
    // ../../index.ts
    const safeFileName = path.basename(fileName);

    const filePath = path.resolve(__dirname, "../../uploads", safeFileName);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}
