import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { DashboardService } from "../services/dashboard.service";
export class DashboardController {
  // Constructor
  constructor(public readonly dashboardService: DashboardService) {}

  // para el manejo de errores
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  //* obtiene datos del dashboard
  getDashboard = async (req: Request, res: Response) => {
    try {
      const planta_id = req.params.planta_id;
      const result = await this.dashboardService.getDashboard();
      return res.json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };
}
