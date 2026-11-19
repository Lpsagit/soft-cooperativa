import { Router } from "express";
import { PrestamoController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { uploadExcel } from "../middlewares/file.upload.middleware";
import { PrestamoService } from "../services/prestamo.service";
import multer from "multer";
import { RulesMiddleware } from "../middlewares/rules.middleware";

export class PrestamoRoutes {
  static get routes(): Router {
    const router = Router();
    const prestamoService = new PrestamoService();
    const controller = new PrestamoController(prestamoService);
    const upload = multer({ storage: multer.memoryStorage() }); // Configuración básica en memoria
    //* USUARIO NORMAL *//
    // solicitar prestamo
    router.post(
      "/solicita-prestamo",
      [AuthMiddleware.validate],
      controller.solicitaPrestamo,
    );

    //* ruta para solicitar un refinanciamiento de un prestamo
    router.post(
      "/solicita-refinanciamiento",
      [AuthMiddleware.validate],
      controller.solicitaRefinanciamiento,
    );

    //* ruta para solicitar una amortizacion de un prestamo
    router.post(
      "/solicita-amortizacion",
      [upload.single("file"), AuthMiddleware.validate],
      controller.solicitaAmortizacion,
    );

    //* ADMINISTRADOR *//
    //cargar aportes de descuento de prestamos por lote
    router.post(
      "/upload-prestamo",
      [AuthMiddleware.validateAdmin, uploadExcel.single("file")],
      controller.uploadPrestamo,
    );

    //*para aprobar o rechazar un prestamo segun du codigo
    router.post(
      "/estado-aprobacion",
      upload.single("file"),
      [
        AuthMiddleware.validateAdmin,
        RulesMiddleware.validateDescuentosPlanilla,
      ],
      controller.apruebaRechazaPrestamo,
    );

    //* obtiene datos generales de todos los prestamos

    router.get(
      "/admin",
      [AuthMiddleware.validateAdmin],
      controller.getPrestamos,
    );

    //* obtener datos de un prestamos en especifico de un socio
    router.post(
      "/admin/socio",
      [AuthMiddleware.validateAdmin],
      controller.getPrestamoSocio,
    );

    //* aprobar o rechazar refinanciamiento de prestamos
    router.post(
      "/refinanciamiento",
      upload.single("file"),
      [
        AuthMiddleware.validateAdmin,
        RulesMiddleware.validateDescuentosPlanilla,
      ],
      controller.apruebaRechazaRefinancimiento,
    );

    //* aprobar o rechazar amortizacion de prestamos
    router.post(
      "/amortizacion",
      upload.single("file"),
      [
        AuthMiddleware.validateAdmin,
        RulesMiddleware.validateDescuentosPlanilla,
      ],
      controller.apruebaRechazaAmortizacion,
    );

    // para obtener movimientos de una cuenta en especifico
    // router.post(
    //   "/movimientos-ahorro-admin",
    //   [AuthMiddleware.validateAdmin],
    //   controller.getMovimientosBySocio,
    // );

    //* obtiene prestramo actual vigente de un socio USUARIO NORMAL

    router.get("/:socioId", [AuthMiddleware.validate], controller.getPrestamo);
    return router;
  }
}
