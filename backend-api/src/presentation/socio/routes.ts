import { Router } from "express";
import { SocioController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { SocioService } from "../services/socios.service";

export class SocioRoutes {
  static get routes(): Router {
    const router = Router();
    const socioService = new SocioService();
    const controller = new SocioController(socioService);

    //* USUARIO NORMAL *//
    // obtener datos de un socio ahorros y prestamos
    router.get("/", [AuthMiddleware.validate], controller.getSocioData);
    router.post(
      "/update",
      [AuthMiddleware.validate],
      controller.updateSocioData,
    );

    //* ADMINISTRADOR *//
    // obtenemos lista de socios
    router.get(
      "/admin-list-socio",
      [AuthMiddleware.validateAdmin],
      controller.getSocios,
    );
    //* obtiene datos generales de un socio incluyendo su usuario
    router.post("/socio", [AuthMiddleware.validateAdmin], controller.getSocio);

    //* para actualizar datos de un socio
    router.post(
      "/admin/update-socio",
      [AuthMiddleware.validateAdmin],
      controller.updateSocioByAdmin,
    );

    //* para actualizar datos del usuario de un socio
    router.post(
      "/admin/update-usuario",
      [AuthMiddleware.validateAdmin],
      controller.updateUsuarioSocio,
    );

    //* reestablecer contraseña usuario normal
    router.post(
      "/admin/reset-password",
      [AuthMiddleware.validateAdmin],
      controller.resetPasswordSocio,
    );

    //* dar de baja a un socio
    router.post(
      "/admin/baja-socio",
      [AuthMiddleware.validateAdmin],
      controller.bajaSocio,
    );

    //* crear un nuevo socio
    router.post(
      "/admin/create-socio",
      [AuthMiddleware.validateAdmin],
      controller.createNewSocio,
    );

    return router;
  }
}
