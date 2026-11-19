import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const excelMimeTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const allowedExtensions = [".xlsx", ".xls"];

export const uploadExcel = multer({
  storage,

  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
    files: 1,
  },

  fileFilter: (_req, file, cb) => {
    try {
      const extension = path.extname(file.originalname).toLowerCase();

      const isValidMime = excelMimeTypes.includes(file.mimetype);

      const isValidExtension = allowedExtensions.includes(extension);

      if (!isValidMime || !isValidExtension) {
        return cb(
          new multer.MulterError(
            "LIMIT_UNEXPECTED_FILE",
            "Solo se permiten archivos Excel (.xlsx, .xls)",
          ),
        );
      }

      cb(null, true);
    } catch (error) {
      cb(error as Error);
    }
  },
});
