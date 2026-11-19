import { Request, Response } from "express";
import { CustomError } from "../../domain";
import ExcelJS from "exceljs";

import {
  Cuota,
  MigrationService,
  PrestamosFromExcel,
} from "../services/migration.service";
import { generateCuotas } from "../helpers/generateCuotas";
import Decimal from "decimal.js";
export class MigrationController {
  // Constructor
  constructor(public readonly migrationService: MigrationService) {}

  // para el manejo de errores
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  //* migrar socios y sus ahorros desde excel

  cargaSocios = (req: Request, res: Response) => {
    //* recibimos el excel y convertimos a json
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
            nombre: row.getCell(1).value,
            ci: String(row.getCell(2).value),
            numCuenta: String(row.getCell(3).value),
            totalAporte: Number(row.getCell(4).value),
          });
        });

        if (!data.length) {
          throw new CustomError(400, "El archivo Excel está vacío");
        }

        return this.migrationService.cargaSocios(data);
      })

      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  //* migrar socios desde excel

  cargarPrestamos = (req: Request, res: Response) => {
    //* recibimos el excel y convertimos a json
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

        const dataPrestamo: PrestamosFromExcel[] = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // saltar encabezado

          const nombre = row.getCell(1).value;
          const ci = String(row.getCell(2).value);

          if (!nombre || !ci) return;

          const cuotas: Cuota[] = [];

          // recorrer columnas desde la 3 en adelante y calcular el mes y el año automáticamente en formato mes = 01 , anio = 2026
          const now = new Date();
          //! OJO QUE ESTAMOS COMENZANDO DESDE EL MES ACTUAL
          let currentMonth = now.getMonth() + 1; // getMonth() devuelve 0-11, sumamos 1
          let currentYear = now.getFullYear();

          for (let i = 3; i <= row.cellCount; i++) {
            let valor: any = row.getCell(i).value;

            // manejar celdas con fórmula
            if (
              typeof valor === "object" &&
              valor !== null &&
              "result" in valor
            ) {
              valor = valor.result;
            }

            // solo números válidos
            if (typeof valor === "number") {
              const mesFormato = String(currentMonth).padStart(2, "0");

              const monto = new Decimal(valor)
                .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
                .toFixed(2);

              cuotas.push({
                nro: Number(cuotas.length + 1),
                monto: monto,
                mes: mesFormato,
                anio: String(currentYear),
              });

              // Incrementar el mes para la siguiente cuota
              currentMonth++;
              if (currentMonth > 12) {
                currentMonth = 1;
                currentYear++;
              }
            }
          }

          // calcular total

          const total = cuotas
            .reduce(
              (acc, c) => acc.plus(new Decimal(String(c.monto || 0))),
              new Decimal(0),
            )
            .toFixed(2);

          dataPrestamo.push({
            nombre: String(nombre),
            ci: String(ci),
            cuotas: cuotas,
            total: total,
          });
        });

        if (!dataPrestamo.length) {
          throw new CustomError(400, "El archivo Excel está vacío");
        }

        // enviar al service (ahora incluye cuotas y total)
        return this.migrationService.cargarPrestamos(dataPrestamo);
      })
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };

  updateUserSocios = (req: Request, res: Response) => {
    this.migrationService
      .updateUserSocios()
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };
}

//* se utiliza si el monto viene calculado como por ejemplo en el de prestamos
/*
          const cellValue = row.getCell(4).value;

            if (
              typeof cellValue === "object" &&
              cellValue !== null &&
              "result" in cellValue
            ) {
              monto = parseMonto(cellValue.result);
            } else {
              monto = parseMonto(cellValue);
            }
          */
