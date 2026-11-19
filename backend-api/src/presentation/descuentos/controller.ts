import { Request, Response } from "express";
import { CustomError } from "../../domain";
import ExcelJS from "exceljs";
import { DescuentoService } from "../services/descuento.service";
export class DescuentoController {
  // Constructor
  constructor(public readonly descuentoService: DescuentoService) {}

  // para el manejo de errores
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  //** admin **/
  //* obtiene informacion del periodo descuento planilla segun anio y mes
  getPeriodoDescuentoPlanilla = (req: Request, res: Response) => {
    const { anio, mes } = req.body;

    if (!anio || !mes) {
      return res.status(400).json({ error: "Anio y Mes son requeridos" });
    }

    this.descuentoService
      .getPeriodoDescuentoPlanilla(anio, mes)
      .then((descuento) => res.json(descuento))
      .catch((error) => this.handleError(error, res));
  };

  // cargar aportes de descuento de prestamos por lote
  //? NOFUNCIONAL
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
        return;
        //return this.prestamoService.uploadPrestamo(data, periodo, fecha);
      })
      .then((document) => res.json(document))
      .catch((error) => this.handleError(error, res));
  };

  //* para generar la lista de descuentos
  generateListDescuento = (req: Request, res: Response) => {
    const { idDescuentoPlanilla } = req.body;

    if (!idDescuentoPlanilla) {
      return res.status(400).json({ error: "Id de descuento es requerido" });
    }

    this.descuentoService
      .generateListDescuento(+idDescuentoPlanilla)
      .then((document) => res.json(document))
      .catch((error) => this.handleError(error, res));
  };

  //* para enviar al servicio el id del la lista de descuentos paragenerar excel
  exportExcelDescuentoPlanilla = (req: Request, res: Response) => {
    const { idDescuentoPlanilla } = req.body;

    if (!idDescuentoPlanilla) {
      return res.status(400).json({ error: "Id de descuento es requerido" });
    }

    this.descuentoService
      .exportExcelDescuentoPlanilla(idDescuentoPlanilla)
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

  //* para enviar al servicio que recibe el excel y el idDescuentoPlanilla
  uploadDescuentos = (req: Request, res: Response) => {
    const { idDescuentoPlanilla } = req.body;
    if (!idDescuentoPlanilla) {
      return res.status(400).json({ error: "Id de descuento es requerido" });
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
            codSocio: "SOC-" + row.getCell(1).value,
            nombre: row.getCell(2).value,
            montoAhorro: row.getCell(3).value,
            montoPrestamo: row.getCell(4).value,
            montoTotal: row.getCell(5).value,
          });
        });

        if (!data.length) {
          throw new CustomError(400, "El archivo Excel está vacío");
        }

        return this.descuentoService.uploadDescuentos(
          idDescuentoPlanilla,
          data,
        );
      })

      .then((document) => res.json(document))
      .catch((error) => this.handleError(error, res));
  };
}
