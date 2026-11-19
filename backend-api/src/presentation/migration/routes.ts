import { Router } from "express";

import { MigrationController } from "./controller";
import { MigrationService } from "../services/migration.service";
import { uploadExcel } from "../middlewares/file.upload.middleware";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class MigrationRoutes {
  static get routes(): Router {
    const router = Router();
    const migrationService = new MigrationService();
    const controller = new MigrationController(migrationService);

    // //* carga de socios y sus ahorros
    // router.post(
    //   "/cargar-socios",
    //   [uploadExcel.single("file")],
    //   [AuthMiddleware.validateAdmin],
    //   controller.cargaSocios,
    // );

    // //* carga de Prestamos
    // router.post(
    //   "/cargar-prestamos",
    //   [uploadExcel.single("file")],
    //   [AuthMiddleware.validateAdmin],
    //   controller.cargarPrestamos,
    // );

    // //* actualizar usuarios de socios
    // router.post("/actualizar-usuarios-socios", controller.updateUserSocios);

    return router;
  }
}
