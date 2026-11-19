import { Router } from "express";

import { DashboardController } from "./controller";
import { DashboardService } from "../services/dashboard.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class DashboardRoutes {
  static get routes(): Router {
    const router = Router();
    const dashboardService = new DashboardService();
    const controller = new DashboardController(dashboardService);

    //* obtiene datos del dashboard
    router.get("/", [AuthMiddleware.validateAdmin], controller.getDashboard);

    return router;
  }
}
