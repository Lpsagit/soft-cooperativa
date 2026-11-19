import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { AhorroService } from "../services/ahorro.service";
import ExcelJS from "exceljs";
export class AhorroController {
  // Constructor
  constructor(public readonly ahorroService: AhorroService) {}

  // para el manejo de errores
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  //** usuario normal */

  //** admin **/
  // ahorros por lote
  uploadAhorro = (req: Request, res: Response) => {
    const periodo = req.body.periodo;
    const fecha = req.body.fecha;
    if (!periodo) {
      return res.status(400).json({ error: "Periodo es requerido" });
    }
    if (!fecha) {
      return res.status(400).json({ error: "Fecha es requerido" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Archivo requerido" });
    }

    const workbook = new ExcelJS.Workbook();

    workbook.xlsx
      .load(req.file.buffer as any)
      .then(() => {
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          throw new CustomError(400, "El archivo Excel no tiene hojas");
        }

        const data: any[] = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;

          data.push({
            cod_socio: "SOC-" + row.getCell(1).value,
            monto: Number(row.getCell(2).value),
          });
        });

        if (!data.length) {
          throw new CustomError(400, "El archivo Excel está vacío");
        }

        return this.ahorroService.uploadAhorro(data, periodo, fecha);
      })
      .then((document) => res.json(document))
      .catch((error) => this.handleError(error, res));
  };

  //* depostar ahorro por socio de manera individual
  // todo: completar el guardado de la imagen
  uploadAhorroIndividual = (req: Request, res: Response) => {
    const { codCtaAhorro, monto } = req.body;

    // 2. El archivo está en req.file (gracias al middleware upload.single)
    const file = req.file;

    if (!codCtaAhorro || !monto) {
      return res.status(400).json({ error: "Codigo y monto son requeridos." });
    }
    if (!file) {
      return res.status(400).json({ error: "Archivo requerido." });
    }

    this.ahorroService
      .uploadAhorroIndividual(codCtaAhorro, +monto, file)
      .then((document) => res.json(document))
      .catch((error) => this.handleError(error, res));
  };

  //*retiro ahorro por socio
  // todo: completar el guardado de la imagen
  retiroAhorro = (req: Request, res: Response) => {
    const { codCtaAhorro, monto } = req.body;
    if (!codCtaAhorro || !monto) {
      return res.status(400).json({ error: "Codigo y monto son requeridos." });
    }
    const file = req.file;

    this.ahorroService
      .retiroAhorro(codCtaAhorro, +monto, file)
      .then((document) => res.json(document))
      .catch((error) => this.handleError(error, res));
  };

  // crea nueva cuenta ahorro
  newCount = (req: Request, res: Response) => {
    const num_emp = req.body.num_emp;
    this.ahorroService
      .newCount(num_emp)
      .then((cuentaAhorro) => res.json(cuentaAhorro))
      .catch((error) => this.handleError(error, res));
  };

  // envia lista de socios y sus cuentas de ahorro
  getCuentasAhorro = (req: Request, res: Response) => {
    this.ahorroService
      .getCuentasAhorro()
      .then((cuentaAhorro) => res.json(cuentaAhorro))
      .catch((error) => this.handleError(error, res));
  };
  // obtiene lista de movimientos de una cuenta en especifico
  getMovimientosBySocio = (req: Request, res: Response) => {
    const codCuenta = req.body.codCuenta;
    const rol = req.body.user.rol;
    const socioId = req.body.user.socio_id;
    if (!codCuenta) {
      return res.status(400).json({ error: "codigo de cuenta es requerido" });
    }
    this.ahorroService
      .getMovimientosBySocio(codCuenta, rol, socioId)
      .then((cuentaAhorro) => res.json(cuentaAhorro))
      .catch((error) => this.handleError(error, res));
  };

  // * EXCLUSIVO para traer el saldo y codigo de ahorro de un socio desde el administrador PARA PODER AMORTIZAR CON AHORROS UN PRESTAMO
  getSaldoByCodSocio = (req: Request, res: Response) => {
    const codSocio = req.body.codSocio;
    if (!codSocio) {
      return res.status(400).json({ error: "codigo de socio es requerido" });
    }
    this.ahorroService
      .getSaldoByCodSocio(codSocio)
      .then((cuentaAhorro) => res.json(cuentaAhorro))
      .catch((error) => this.handleError(error, res));
  };
}
