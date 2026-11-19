import { Router } from "express";
import { ReportController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AhorroService } from "../services/ahorro.service";
import { uploadExcel } from "../middlewares/file.upload.middleware";
import { ReportService } from "../services/report.service";

export class ReportRoutes {
  static get routes(): Router {
    const router = Router();
    const reportService = new ReportService();
    const controller = new ReportController(reportService);

    //* USUARIO NORMAL *//
    // solicitar extracto o descargar
    router.post(
      "/extracto-ahorro",
      [AuthMiddleware.validate],
      controller.extractoAhorro,
    );

    //* extracto prestamos solicitada por el socio
    router.post(
      "/extracto-prestamo",
      [AuthMiddleware.validate],
      controller.extractoPrestamoSocio,
    );

    //* ADMINISTRADOR *//
    //* extracto solicitada por el administrador
    router.post(
      "/extracto-ahorro-admin",
      [AuthMiddleware.validateAdmin],
      controller.extractoAhorroAdmin,
    );

    //* extracto prestamos solicitada por el administrados
    router.post(
      "/extracto-prestamo-admin",
      [AuthMiddleware.validateAdmin],
      controller.extractoPrestamoAdmin,
    );

    // para obtener la lista de empleados a los que se les descontara ahorros y prestamos excel
    router.get(
      "/list-descuentos-planillas",
      [AuthMiddleware.validateAdmin],
      controller.listaDescuentosPlanilla,
    );

    return router;
  }
}
