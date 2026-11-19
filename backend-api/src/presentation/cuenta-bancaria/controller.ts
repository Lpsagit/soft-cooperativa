import { Request, Response } from "express";
import { CustomError } from "../../domain";
import { SocioUpdateDto } from "../../domain/dtos/socio/socio-update.dto";
import { CuentaBancariaService } from "../services/cuenta.bancaria.service";
export class CuentaBancariaController {
  // Constructor
  constructor(public readonly cuentaBancariaService: CuentaBancariaService) {}

  // para el manejo de errores
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  //** USUARIO ADMIN */

  //* obtiene datos de un socio
  getDataCtaBancaria = (req: Request, res: Response) => {
    this.cuentaBancariaService
      .getDataCtaBancaria()
      .then((ctaBancaria) => res.json(ctaBancaria))
      .catch((error) => this.handleError(error, res));
  };

  //* actualiza el saldo fisico o el saldo en safi de la cuenta bancaria de la cooperativa segun el TIPO que venga
  setSaldoFisicoAndSafi = (req: Request, res: Response) => {
    const { monto, tipo, ctaBancariaId } = req.body;
    if (!monto || !tipo || !ctaBancariaId) {
      return res.status(400).json({ error: "Monto y tipo son requeridos" });
    }
    if (tipo !== "safi" && tipo !== "saldoFisico") {
      return res
        .status(400)
        .json({ error: "error en el tipo de actualización" });
    }

    if (isNaN(Number(ctaBancariaId))) {
      return res.status(400).json({ error: "ID de cuenta bancaria no válido" });
    }

    this.cuentaBancariaService
      .setSaldoFisicoAndSafi(monto, tipo, Number(ctaBancariaId))
      .then((ctaBancaria) => res.json(ctaBancaria))
      .catch((error) => this.handleError(error, res));
  };
  //* registro de rc/iva e intereses
  registroRcIvaIntereses = (req: Request, res: Response) => {
    const { montoRcIva, montoInteres, ctaBancariaId, fechaRegistro } = req.body;
    if (!montoRcIva || !montoInteres || !ctaBancariaId || !fechaRegistro) {
      return res
        .status(400)
        .json({ error: "los montos RC/IVA e intereses son requeridos" });
    }

    if (isNaN(Number(ctaBancariaId))) {
      return res.status(400).json({ error: "ID de cuenta bancaria no válido" });
    }
    //validamos la fecha de registro
    const fecha = new Date(fechaRegistro);
    if (isNaN(fecha.getTime())) {
      return res.status(400).json({ error: "Fecha de registro no válida" });
    }

    this.cuentaBancariaService
      .registroRcIvaIntereses(
        montoRcIva,
        montoInteres,
        Number(ctaBancariaId),
        fechaRegistro,
      )
      .then((ctaBancaria) => res.json(ctaBancaria))
      .catch((error) => this.handleError(error, res));
  };

  //* para actualizar el codigo QR de la cuenta bancaria de la cooperativa
  updateCodQR = (req: Request, res: Response) => {
    const { ctaBancariaId } = req.body;
    if (!ctaBancariaId) {
      return res
        .status(400)
        .json({ error: "ID de cuenta bancaria es requerido" });
    }

    if (isNaN(Number(ctaBancariaId))) {
      return res.status(400).json({ error: "ID de cuenta bancaria no válido" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Archivo QR es requerido" });
    }

    this.cuentaBancariaService
      .updateCodQR(Number(ctaBancariaId), req.file)
      .then((ctaBancaria) => res.json(ctaBancaria))
      .catch((error) => this.handleError(error, res));
  };
}
