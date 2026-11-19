import { Router } from "express";
import { AuthController } from "./controller"; // Adjust the path as needed
import { AuthService } from "../services/auth.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();
    const authService = new AuthService();
    const controller = new AuthController(authService);

    //** rutas user normal **//
    //*ok login
    router.post("/login", controller.loginUser);
    //*ok renovar token
    router.get(
      "/check-status",
      [AuthMiddleware.validate],
      controller.checkAuthStatus,
    );

    //*ok para cambiar contraseña
    router.post(
      "/change-pass",
      [AuthMiddleware.validate],
      controller.changePassUser,
    );

    //* para la solicitud union a la cooperativa

    //---aun no usado
    router.get("/validate-user/:token", controller.validateUser);

    //** rutas Adminstrador **//

    //*ok login admin
    router.post("/login/admin", controller.loginUserAdmin);

    //*ok renueva token
    router.get(
      "/check-status/admin",
      [AuthMiddleware.validateAdmin],
      controller.checkAuthStatusAdmin,
    );

    //*ok cambiar contraseña admin
    router.post(
      "/admin/change-pass",
      [AuthMiddleware.validateAdmin],
      controller.changePassUserAdmin,
    );

    // restaurar contraseña // por ver si se lo hara con servicio usuario
    router.post("/change-pass/admin", controller.changePassAdmin);

    return router;
  }
}
