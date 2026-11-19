import { Request, Response } from "express";
import { CustomError } from "../../domain";
import ExcelJS from "exceljs";
import { PrestamoService } from "../services/prestamo.service";
export class PrestamoController {
  // Constructor
  constructor(public readonly prestamoService: PrestamoService) {}

  // para el manejo de errores
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  //** admin **/
  // cargar aportes de descuento de prestamos por lote
  uploadPrestamo = (req: Request, res: Response) => {
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

        return this.prestamoService.uploadPrestamo(data, periodo, fecha);
      })
      .then((document) => res.json(document))
      .catch((error) => this.handleError(error, res));
  };

  //* aprobar o rechazar prestamo
  apruebaRechazaPrestamo = (req: Request, res: Response) => {
    // 1. El texto sigue en req.body
    const { codPrestamo, estado, obs } = req.body;

    // 2. El archivo está en req.file (gracias al middleware upload.single)
    const file = req.file;

    if (!codPrestamo || !estado) {
      return res.status(400).json({ error: "Codigo y estado son requeridos." });
    }

    this.prestamoService
      .apruebaRechazaPrestamo(codPrestamo, estado, obs, file)
      .then((prestamo) => res.json(prestamo))
      .catch((error) => this.handleError(error, res));
  };
  //* obtener prestamos de todos los usuarios

  getPrestamos = (req: Request, res: Response) => {
    this.prestamoService
      .getPrestamos()
      .then((prestamo) => res.json(prestamo))
      .catch((error) => this.handleError(error, res));
  };

  //* obtener detalle de un prestamo en especifico
  getPrestamoSocio = (req: Request, res: Response) => {
    const codPrestamo = req.body.codPrestamo;
    //console.log("codPrestamo", codPrestamo);
    if (!codPrestamo) {
      return res.status(400).json({ error: "Socio es requerido" });
    }
    this.prestamoService
      .getPrestamoSocio(codPrestamo)
      .then((prestamo) => res.json(prestamo))
      .catch((error) => this.handleError(error, res));
  };

  //* aprueba o rechaza refinanciamiento de prestamos
  apruebaRechazaRefinancimiento = (req: Request, res: Response) => {
    const { codPrestamo, cuota, montoSolicitado, refinanciamientoId, estado } =
      req.body;

    const file = req.file;

    if (!codPrestamo || !cuota || !montoSolicitado) {
      return res
        .status(400)
        .json({ error: "Codigo, cuota y monto solicitado son requeridos." });
    }

    this.prestamoService
      .apruebaRechazaRefinancimiento(
        codPrestamo,
        cuota,
        montoSolicitado,
        refinanciamientoId,
        estado,
        file,
      )
      .then((prestamo) => res.json(prestamo))
      .catch((error) => this.handleError(error, res));
  };

  //* aprueba o rechaza amortizacion de prestamos
  apruebaRechazaAmortizacion = (req: Request, res: Response) => {
    const { codPrestamo, montoAmortizar, estado, amortizacionId, codAhorro } =
      req.body;

    const file = req.file;
    if (!codPrestamo || !montoAmortizar || !estado) {
      return res
        .status(400)
        .json({ error: "Codigo, monto a amortizar y estado  son requeridos." });
    }

    this.prestamoService
      .apruebaRechazaAmortizacion(
        codPrestamo,
        montoAmortizar,
        estado,
        amortizacionId,
        codAhorro,
        file,
      )
      .then((prestamo) => res.json(prestamo))
      .catch((error) => this.handleError(error, res));
  };

  //***** usuario normal *****/
  // solicitar prestamo
  solicitaPrestamo = (req: Request, res: Response) => {
    const { monto, nroCuotas } = req.body;
    const socioId = req.body.user.socio_id;
    if (!monto || !nroCuotas) {
      return res
        .status(400)
        .json({ error: "Monto y numero de cuotas es requerido" });
    }

    //? validar que el numero de cuotas sea un numero positivo
    if (isNaN(nroCuotas) || nroCuotas <= 0) {
      return res
        .status(400)
        .json({ error: "Numero de cuotas debe ser un numero positivo" });
    }
    this.prestamoService
      .solicitaPrestamo(socioId, +monto, +nroCuotas)
      .then((prestamo) => res.json(prestamo))
      .catch((error) => this.handleError(error, res));
  };
  // solicitar prestamo
  getPrestamo = (req: Request, res: Response) => {
    const socioId = req.body.user.socio_id;
    const socioIdParms = Number(req.params.socioId);
    // verificamos que el codigo enviado coincida con el insertado en el token
    if (socioId != socioIdParms) {
      console.log({ socioId, socioIdParms });
      return res.status(400).json({ error: "Socio no valido" });
    }

    this.prestamoService
      .getPrestamo(socioId)
      .then((prestamo) => res.json(prestamo))
      .catch((error) => this.handleError(error, res));
  };

  // solicitar refinanciamiento de prestamo
  solicitaRefinanciamiento = (req: Request, res: Response) => {
    const { codPrestamo, montoSolicitado, cuotas } = req.body;
    const socioId = req.body.user.socio_id;
    // console.log({ codPrestamo, montoSolicitado, socioId });

    if (!codPrestamo || !montoSolicitado) {
      return res
        .status(400)
        .json({ error: "Codigo, cuota y monto solicitado son requeridos." });
    }

    //reemplazamos la coma por punto para convertirlo a numero
    const montoSolicitadoFormatted = montoSolicitado.replace(",", ".");
    if (isNaN(montoSolicitadoFormatted) || +montoSolicitadoFormatted <= 0) {
      return res
        .status(400)
        .json({ error: "Monto solicitado debe ser un numero positivo" });
    }

    if (!cuotas) {
      return res
        .status(400)
        .json({ error: "El número de cuotas es requerido." });
    }

    this.prestamoService
      .solicitaRefinanciamiento(
        socioId,
        codPrestamo,
        montoSolicitadoFormatted,
        cuotas,
      )
      .then((prestamo) => res.json(prestamo))
      .catch((error) => this.handleError(error, res));
  };

  //* solicitar amortizacion de prestamo
  solicitaAmortizacion = (req: Request, res: Response) => {
    const { codPrestamo, montoAmortizar } = req.body;
    const socioId = req.body.user.socio_id;
    console.log(req.body);
    const file = req.file;

    if (!codPrestamo || !montoAmortizar) {
      return res
        .status(400)
        .json({ error: "Codigo y monto a amortizar son requeridos." });
    }

    //reemplazamos la coma por punto para convertirlo a numero
    const montoAmortizarFormatted = montoAmortizar.replace(",", ".");
    if (isNaN(montoAmortizarFormatted) || +montoAmortizarFormatted <= 0) {
      return res
        .status(400)
        .json({ error: "Monto a amortizar debe ser un numero positivo" });
    }

    if (!file) {
      return res.status(400).json({ error: "Debe adjuntar un archivo." });
    }

    this.prestamoService
      .solicitaAmortizacion(socioId, codPrestamo, montoAmortizarFormatted, file)
      .then((prestamo) => res.json(prestamo))
      .catch((error) => this.handleError(error, res));
  };
}
