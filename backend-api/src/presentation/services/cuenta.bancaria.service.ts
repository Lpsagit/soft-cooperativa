import { CustomError } from "../../domain";
import { PostgresDatabase } from "../../data";
import { Pool } from "pg";
import Decimal from "decimal.js";
import { StorageService } from "./storage.service";
import { LocalStorageAdapter } from "../../adapters/local-storage.adapter";

export class CuentaBancariaService {
  private readonly pool: Pool;
  private readonly storageService: StorageService;
  // ID
  constructor() {
    this.pool = PostgresDatabase.getPool();
    this.storageService = new StorageService(new LocalStorageAdapter());
  }

  //* para enviar datos de la cuentqa bancaria de la cooperativa vigente
  public async getDataCtaBancaria() {
    //? obtnemos datos generales de la cuenta bancaria de la cooperativa
    const dataCtaBancaria = await this.pool.query(
      `select s.nom_completo , s.cod_socio , cb.* 
       from cuenta_bancaria cb 
       inner join socio s on cb.socio_id = s.id 
       where cb.is_active = true`,
    );

    const idCtaBancaria = dataCtaBancaria.rows[0].id;

    //? obtenemos movimientos de la cuenta bancaria de la cooperativa

    const movimientosCtaBancaria = await this.pool.query(
      `select * from movimiento_bancario mb where mb.cuenta_bancaria_id = $1 order by mb.id desc`,
      [idCtaBancaria],
    );

    //? obtnemos el saldo de la cuenta bancaria de la cooperativa
    const saldoCtaBancaria = await this.pool.query(
      `SELECT
    COALESCE(
        SUM(
            CASE
                WHEN sentido = 'AUMENTA' THEN monto
                        WHEN sentido = 'DISMINUYE' THEN -monto
                    END
                ),
                0
            ) AS saldo
        FROM movimiento_bancario
        WHERE cuenta_bancaria_id = $1;
`,
      [idCtaBancaria],
    );

    return {
      status: "ok",
      message: "Datos de la cuenta bancaria general de la cooperativa",
      ctaBancaria: {
        ...dataCtaBancaria.rows[0],
        saldoActual: saldoCtaBancaria.rows[0].saldo,
      },
      movimientos: movimientosCtaBancaria.rows,
    };
  }

  //* actualiza el saldo fisico o el saldo en safi de la cuenta bancaria de la cooperativa segun el TIPO que venga
  public async setSaldoFisicoAndSafi(
    monto: string,
    tipo: string,
    ctaBancariaId: number,
  ) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      if (tipo === "safi") {
        await client.query(
          `update cuenta_bancaria set safi = $1 , updated_at = NOW() where id = $2`,
          [monto, ctaBancariaId],
        );
      }
      if (tipo === "saldoFisico") {
        await client.query(
          `update cuenta_bancaria set saldo_fisico = $1 , updated_at = NOW() where id = $2`,
          [monto, ctaBancariaId],
        );
      }

      await client.query("COMMIT");

      return {
        status: "ok",
        message: `Se actualizó ${tipo} correctamente: ${monto}`,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    } finally {
      client.release();
    }
  }

  //* para registro de rc/iva e intereses
  public async registroRcIvaIntereses(
    montoRcIva: string,
    montoInteres: string,
    ctaBancariaId: number,
    fechaRegistro: string,
  ) {
    const client = await this.pool.connect();
    const fechaActual = new Date();

    //* calculamos el neto que entra a la cuenta bancaria con decimal.js
    const totalNeto = new Decimal(montoInteres).minus(new Decimal(montoRcIva));

    try {
      await client.query("BEGIN");
      //*verificamos que la cuenta este activa y obtenemos la cuenta auxiliar del banco

      const ctaBancaria = await client.query(
        `select ca.id as cuenta_auxiliar_id ,cb.id , cb.codigo
           from cuenta_bancaria cb 
           inner join cuenta_auxiliar ca on cb.id = ca.referencia_id 
           where ca.referencia_tabla = $1 and cb.is_active = $2 and cb.id = $3`,
        ["cuenta_bancaria", true, ctaBancariaId],
      );

      const cuentaAuxBanco = ctaBancaria.rows[0].cuenta_auxiliar_id;
      const cuentaBancariaCod = ctaBancaria.rows[0].codigo;

      //* obtenemos las cuentas contanbles que intervendran
      const sqlCuentaContable = await client.query(
        `SELECT cc.id
       FROM unnest(ARRAY[$1, $2, $3]) 
       WITH ORDINALITY AS orden(codigo, seq)
       INNER JOIN cuenta_contable cc 
         ON cc.codigo = orden.codigo
       ORDER BY orden.seq`,
        ["111001", "510001", "410001"],
      );
      //? cuentas contables
      const cuentaContBancoId = sqlCuentaContable.rows[0].id;
      const cuentaContRetencionRcIva = sqlCuentaContable.rows[1].id;
      const cuentaContInteresesBancarios = sqlCuentaContable.rows[2].id;

      if (ctaBancaria.rowCount === 0) {
        throw CustomError.notFound(
          `La cuenta bancaria de la cooperativa con ID ${ctaBancariaId} no está activa o no existe`,
        );
      }

      //* registramos el movimiento de RC/IVA e Intereses en la cuenta bancaria de la cooperativa
      // obtener mes y año de la fecha de registro mm/yyyy
      const fecha = new Date(fechaRegistro);
      const mes = fecha.getMonth() + 1; // Los meses en JavaScript son base 0
      const anio = fecha.getFullYear();
      const mesAnio = `${mes.toString().padStart(2, "0")}/${anio}`;

      //? rc/iva
      await client.query(
        `insert into movimiento_bancario (cuenta_bancaria_id, fecha, monto, tipo_operacion, categoria, comprobante, detalle, sentido ) 
         values ($1, $2, $3, $4, $5, $6, $7 ,$8)`,
        [
          ctaBancariaId,
          fechaRegistro,
          montoRcIva,
          "RETIRO",
          "RC_IVA",
          "",
          `Pago de RC-IVA correspondiente al período ${mesAnio}`,
          "DISMINUYE",
        ],
      );

      //? intereses
      await client.query(
        `insert into movimiento_bancario (cuenta_bancaria_id, fecha, monto, tipo_operacion, categoria, comprobante, detalle, sentido ) 
         values ($1, $2, $3, $4, $5, $6, $7 ,$8)`,
        [
          ctaBancariaId,
          fechaRegistro,
          montoInteres,
          "DEPOSITO",
          "INTERESES",
          "",
          `Abono por intereses bancarios al período ${mesAnio}`,
          "AUMENTA",
        ],
      );

      //* parte contable
      //? insertamos asiento
      const insertAsiento = await client.query(
        `INSERT INTO asiento_contable (glosa, referencia, cuenta_bancaria_id ) values ($1, $2, $3) RETURNING id`,
        [
          `Devengamiento de intereses bancarios y retención de RC/IVA correspondiente al período ${mesAnio} - BANCO ${cuentaBancariaCod} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
          `BANCO - Intereses y RC/IVA `,
          ctaBancariaId,
        ],
      );
      //? insertamos detalle asiento
      const asiento_id = insertAsiento.rows[0].id;

      // para el debe banco +
      await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [
          asiento_id,
          cuentaContBancoId,
          cuentaAuxBanco,
          totalNeto.toFixed(2),
          0,
        ],
      );
      // para el debe egreso RC/IVA +
      await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [asiento_id, cuentaContRetencionRcIva, cuentaAuxBanco, montoRcIva, 0],
      );
      // para el haber ingreso intereses +
      await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [
          asiento_id,
          cuentaContInteresesBancarios,
          cuentaAuxBanco,
          0,
          montoInteres,
        ],
      );

      await client.query("COMMIT");

      return {
        status: "ok",
        message: `Se registro con exito el registro de rc/iva e intereses de la cuenta bancaria de la cooperativa`,
        montoRcIva,
        montoInteres,
        ctaBancariaId,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    } finally {
      client.release();
    }
  }

  //* para actualizar el codigo QR de la cuenta bancaria de la cooperativa
  public async updateCodQR(ctaBancariaId: number, file: Express.Multer.File) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      //* guardamos la imagen

      if (file) {
        const urlImage = await this.storageService.uploadFile(
          file,
          "qr-cuenta-bancaria",
        );

        await client.query(
          `update cuenta_bancaria set ruta_qr = $1 , updated_at = NOW() where id = $2`,
          [urlImage, ctaBancariaId],
        );
      } else {
        await client.query("ROLLBACK");
        throw CustomError.badRequest("Imagen QR es requerido");
      }

      await client.query("COMMIT");

      return {
        status: "ok",
        message: `Se actualizó el código QR correctamente`,
        ctaBancariaId,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    } finally {
      client.release();
    }
  }
}
