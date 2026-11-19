import { Router } from "express";
import { AhorroController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AhorroService } from "../services/ahorro.service";
import { uploadExcel } from "../middlewares/file.upload.middleware";
import multer from "multer";

export class AhorroRoutes {
  static get routes(): Router {
    const router = Router();
    const ahorroService = new AhorroService();
    const controller = new AhorroController(ahorroService);
    const upload = multer({ storage: multer.memoryStorage() }); // Configuración básica en memoria
    //! PONER LOS MIDDLEWARE PARA EL CONTROL DE SEGIRUDAD

    //* USUARIO NORMAL *//
    // para obtener movimientos de una cuenta en especifico
    //* comparte la funcion con el admin
    router.post(
      "/movimientos-ahorro",
      [AuthMiddleware.validate],
      controller.getMovimientosBySocio,
    );

    //* ADMINISTRADOR *//
    //para subir datos de ahorros de manera global
    router.post(
      "/upload-ahorro",
      [AuthMiddleware.validateAdmin, uploadExcel.single("file")],
      controller.uploadAhorro,
    );

    //* para subir ahorros individuales
    // todo: compleatar el guardado de la imagen comprobante
    router.post(
      "/upload-ahorro-individual",
      [AuthMiddleware.validateAdmin],
      upload.single("file"),
      controller.uploadAhorroIndividual,
    );

    //* para retirar dinero de la cuenta
    // todo: compleatar el guardado de la imagen comprobante
    router.post(
      "/retiro-ahorro",
      [AuthMiddleware.validateAdmin],
      upload.single("file"),
      controller.retiroAhorro,
    );

    // para crear una cuenta de ahorro
    router.post(
      "/new-count",
      [AuthMiddleware.validateAdmin],
      controller.newCount,
    );

    // para obtener lista de socios y sus cuentas de ahorro
    router.get(
      "/cuentas-ahorro",
      [AuthMiddleware.validateAdmin],
      controller.getCuentasAhorro,
    );

    //* para obtener una cuenta de ahorro y sus movimientos
    //? comparte la funcion con el socio normal
    router.post(
      "/cuenta-ahorro-by-cod",
      [AuthMiddleware.validateAdmin],
      controller.getMovimientosBySocio,
    );

    //* EXCLUSIVO para traer el saldo y codigo de ahorro de un socio desde el administrador PARA PODER AMORTIZAR CON AHORROS UN PRESTAMO

    router.post(
      "/saldo-ahorro-by-cod-socio",
      [AuthMiddleware.validateAdmin],
      controller.getSaldoByCodSocio,
    );

    return router;
  }
}
