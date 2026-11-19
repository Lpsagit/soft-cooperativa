import multer from "multer";

const storage = multer.memoryStorage();

export const uploadExcel = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
  fileFilter: (_req, file, cb) => {
    // Validar por extensión también
    const allowedExtensions = [".xlsx", ".xls"];
    const extension = file.originalname
      .substring(file.originalname.lastIndexOf("."))
      .toLowerCase();

    const excelMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (
      excelMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(extension)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Solo archivos Excel (.xlsx, .xls)"));
    }
  },
});
