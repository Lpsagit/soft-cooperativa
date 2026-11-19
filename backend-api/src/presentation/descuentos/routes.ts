import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { uploadExcel } from "../middlewares/file.upload.middleware";
import multer from "multer";
import { DescuentoController } from "./controller";
import { DescuentoService } from "../services/descuento.service";

export class DescuentoRoutes {
  static get routes(): Router {
    const router = Router();
    const descuentoService = new DescuentoService();
    const controller = new DescuentoController(descuentoService);
    const upload = multer({ storage: multer.memoryStorage() }); // Configuración básica en memoria

    //* ADMINISTRADOR *//
    //* obtiene periodo de descuento planilla segun mes y anio
    router.post(
      "/periodo-data",
      [AuthMiddleware.validateAdmin],
      controller.getPeriodoDescuentoPlanilla,
    );
    //* ruta para generar lista de descuentos
    router.post(
      "/generate-list",
      [AuthMiddleware.validateAdmin],
      controller.generateListDescuento,
    );
    //* para generar el excel de lista de descuentos
    router.post(
      "/export-excel",
      [AuthMiddleware.validateAdmin],
      controller.exportExcelDescuentoPlanilla,
    );
    //* para cargar excel de descuentos confirmados
    router.post(
      "/upload-descuentos",
      [uploadExcel.single("file")],
      [AuthMiddleware.validateAdmin],
      controller.uploadDescuentos,
    );

    // todo boorrar luego solo es guia
    router.post(
      "/upload-prestamo",
      [AuthMiddleware.validateAdmin, uploadExcel.single("file")],
      controller.uploadPrestamo,
    );

    return router;
  }
}
