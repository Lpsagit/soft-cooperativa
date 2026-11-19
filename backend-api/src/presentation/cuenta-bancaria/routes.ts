import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { SocioService } from "../services/socios.service";
import { CuentaBancariaService } from "../services/cuenta.bancaria.service";
import { CuentaBancariaController } from "./controller";
import multer from "multer";

export class CuentaBancariaRoutes {
  static get routes(): Router {
    const router = Router();
    const cuentaBancariaService = new CuentaBancariaService();
    const controller = new CuentaBancariaController(cuentaBancariaService);
    const upload = multer({ storage: multer.memoryStorage() });
    //* ADMINISTRADOR *//
    // obtenemos lista de socios
    // router.get(
    //   "/admin-list-socio",
    //   [AuthMiddleware.validateAdmin],
    //   controller.getSocios,
    // );
    //* obtiene datos generales de un socio incluyendo su usuario
    router.get(
      "/",
      [AuthMiddleware.validateAdmin],
      controller.getDataCtaBancaria,
    );

    //* actualiza el saldo fisico o el saldo en safi de la cuenta bancaria de la cooperativa segun el TIPO que venga
    router.post(
      "/saldo-fisico-safi",
      [AuthMiddleware.validateAdmin],
      controller.setSaldoFisicoAndSafi,
    );

    //* para registro de rc/iva e intereses
    router.post(
      "/registro-rc-iva-intereses",
      [AuthMiddleware.validateAdmin],
      controller.registroRcIvaIntereses,
    );

    //* para subir el codigo QR de la cuenta bancaria de la cooperativa
    router.post(
      "/update-cod-qr",
      [upload.single("file")],
      [AuthMiddleware.validateAdmin],
      controller.updateCodQR,
    );

    return router;
  }
}
