import { Request, Response } from "express";
import { CustomError } from "../../domain";
import ExcelJS from "exceljs";
import { ReportService } from "../services/report.service";
export class ReportController {
  // Constructor
  constructor(public readonly reportService: ReportService) {}

  // para el manejo de errores
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  //** usuario ADMIN */
  //*generar PDF del extracto de ahorro de un socio
  extractoAhorroAdmin = (req: Request, res: Response) => {
    const { socioId, fechaIni, fechaFin } = req.body;
    //console.log("llega al controller");
    //console.log(req.body);
    this.reportService
      .extractoAhorro(socioId, fechaIni, fechaFin)
      .then(({ buffer, name }) => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${name}.pdf"`);
        res.send(buffer);
      })
      .catch((error) => this.handleError(error, res));
  };

  //*generar PDF del extracto de ahorro de un socio solicitado por el administrador
  extractoPrestamoAdmin = (req: Request, res: Response) => {
    const { socioId, prestamoId } = req.body;
    //console.log("llega al controller");
    //console.log(req.body);
    this.reportService
      .extractoPrestamo(socioId, prestamoId)
      .then(({ buffer, name }) => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${name}.pdf"`);
        res.send(buffer);
      })
      .catch((error) => this.handleError(error, res));
  };

  // obtener lista de descuentos planillas ahorros y prestamos
  listaDescuentosPlanilla = (rep: Request, res: Response) => {
    this.reportService
      .listaDescuentosPlanilla()
      .then((excelBuffer) => {
        // Configurar los headers de la respuesta
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${excelBuffer.name}.xlsx`,
        );
        // Enviar el archivo
        res.send(excelBuffer.buffer);
      })
      .catch((error) => this.handleError(error, res));
  };

  //** usuario normal */
  extractoAhorro = (req: Request, res: Response) => {
    const socioId = req.body.user.socio_id;
    const { fechaIni, fechaFin } = req.body;
    //console.log(req.body.user);
    this.reportService
      .extractoAhorro(socioId, fechaIni, fechaFin)
      .then(({ buffer, name }) => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${name}.pdf"`);
        res.send(buffer);
      })
      .catch((error) => this.handleError(error, res));
  };

  //*generar PDF del extracto de ahorro de un socio solicitado por el socio
  extractoPrestamoSocio = (req: Request, res: Response) => {
    const socioId = req.body.user.socio_id;
    const { prestamoId } = req.body;
    //console.log("llega al controller");
    //console.log(req.body);
    if (!socioId || !prestamoId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    this.reportService
      .extractoPrestamo(socioId, prestamoId)
      .then(({ buffer, name }) => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${name}.pdf"`);
        res.send(buffer);
      })
      .catch((error) => this.handleError(error, res));
  };
}
