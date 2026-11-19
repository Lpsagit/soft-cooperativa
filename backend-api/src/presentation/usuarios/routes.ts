import { Router } from "express";
import { UsuariosController } from "./controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { UsuariosService } from "../services/usuarios.service";

export class UsuariosRoutes {
  static get routes(): Router {
    const router = Router();
    const usuariosService = new UsuariosService();
    const controller = new UsuariosController(usuariosService);

    // Definir las rutas

    // obtener codigo diponible
    router.get("/", [AuthMiddleware.validateAdmin], controller.getUsuarios);
    router.post(
      "/restablecer-pass",
      [AuthMiddleware.validateAdmin],
      controller.reestablecerPassword,
    );
    router.post(
      "/asigna-rol",
      [AuthMiddleware.validateAdmin],
      controller.asignarRol,
    );

    // para consultar a la base de datos del server rrhh
    router.post(
      "/update-list-users",
      [AuthMiddleware.validateAdmin],
      controller.updateListUsers,
    );
    //router.post('/update-list-users', [ AuthMiddleware.validateAdmin ], controller.updateListUsers );

    // consulta datos a server rrhh para ver agregar nuevo socio
    router.post(
      "/user-rrhh",
      [AuthMiddleware.validateAdmin],
      controller.findPersonalOnRRHH,
    );

    return router;
  }
}
