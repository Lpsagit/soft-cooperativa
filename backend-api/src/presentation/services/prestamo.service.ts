import { CustomError } from "../../domain";
import { PostgresDatabase } from "../../data";
import { Pool } from "pg";
import { bcryptAdapter, envs, JwtAdapter } from "../../config";
import {
  generateCuotas,
  generateCuotasPorMontoMensual,
} from "../helpers/generateCuotas";

import Decimal from "decimal.js";
import { StorageService } from "./storage.service";
import { LocalStorageAdapter } from "../../adapters/local-storage.adapter";
import { emailService } from "./email.service";

const RRHH_API_URL = envs.RRHH_API_URL;

export class PrestamoService {
  private readonly pool: Pool;
  private readonly storageService: StorageService;
  private meses: string[];
  // ID
  constructor() {
    this.pool = PostgresDatabase.getPool();

    this.storageService = new StorageService(new LocalStorageAdapter());
    this.meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Setiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
  }
  //* ADMINISTRADOR
  // cargar aportes de descuento de prestamos por lote
  public async uploadPrestamo(rows: any[], periodo: string, fecha: string) {
    const fechaAsiento = new Date(`${fecha}T12:00:00`);

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      // obtenemos cuentas que intervendran en el detalle asiento banco y cuentas por COBRAR socios
      const sqlCuentaContable = await client.query(
        `SELECT cc.id
       FROM unnest(ARRAY[$1, $2]) 
       WITH ORDINALITY AS orden(codigo, seq)
       INNER JOIN cuenta_contable cc 
         ON cc.codigo = orden.codigo
       ORDER BY orden.seq`,
        ["111001", "112001"],
      );
      const cuentaBancoId = sqlCuentaContable.rows[0].id;
      const cuentaCobrarId = sqlCuentaContable.rows[1].id;
      // ontenemos id de la cuenta auxiliar para el banco
      const sqlCuentaAuxBanco = await client.query(
        `select ca.id 
         from cuenta_bancaria cb 
         inner join cuenta_auxiliar ca on cb.id = ca.referencia_id 
         where ca.referencia_tabla = $1 and cb.is_active = $2`,
        ["cuenta_bancaria", true],
      );
      const cuentaAuxBanco = sqlCuentaAuxBanco.rows[0].id;

      for (const row of rows) {
        const { cod_socio, monto } = row;
        console.log({ cod_socio, monto });
        //validamos que el socio no sea nulo y que el monto sea mayor a cero
        if (cod_socio === "SOC-null" || monto <= 0) {
          throw CustomError.badRequest(
            "Existe un registro que no tiene datos (num_emp o monto)",
          );
        }
        //obtenemos datos del socio y de su cuenta de ahorros para verificar que esten activas
        const sqlSocio = await client.query(
          `SELECT s.id as socio_id , p.id as prestamo_id, ca.id as cuenta_aux_prestamo_id
           from socio s
           inner join prestamo p on s.id = p.socio_id 
           inner join cuenta_auxiliar ca on p.id = ca.referencia_id 
           where s.cod_socio = $1 and p.is_active = $2 and ca.referencia_tabla = $3`,
          [cod_socio, true, "prestamo"],
        );
        const { socio_id, prestamo_id, cuenta_aux_prestamo_id } =
          sqlSocio.rows[0];
        if (sqlSocio.rows.length === 0) {
          throw CustomError.badRequest(
            `El socio con el codigo ${cod_socio} no existe o fue dado de baja. Retirelo de la lista Excel e intente nuevamente`,
          );
        }

        //verificar que no se registren dos en la misma fecha
        const existe = await client.query(
          `SELECT 1
           FROM movimiento_prestamo
           WHERE prestamo_id = $1
             AND created_at >= CURRENT_DATE
             AND created_at < CURRENT_DATE + INTERVAL '1 day'
           LIMIT 1
           `,
          [prestamo_id],
        );

        if (existe.rows.length > 0) {
          throw CustomError.badRequest(
            "Ya se realizó el registro de depósitos de prestamos en la fecha actual.",
          );
        }

        // para el numero de cuota
        const sqlPrestamoMov = await client.query(
          `SELECT count(*) as cuotas_pagadas  
           FROM movimiento_prestamo
           WHERE prestamo_id = $1 and tipo_movimiento = $2  `,
          [prestamo_id, "DESCUENTO PLANILLA"],
        );
        const cuotasPagadas = sqlPrestamoMov.rows[0].cuotas_pagadas;
        const nroCuota = +cuotasPagadas + 1;

        // insertamos datos del moviento del prestamo
        const insertPrestamo = await client.query(
          `INSERT INTO movimiento_prestamo( prestamo_id, tipo_movimiento, monto, fecha, sentido, nro_cuota, periodo )
           VALUES( $1, $2, $3, $4, $5, $6, $7 )`,
          [
            prestamo_id,
            "DESCUENTO PLANILLA",
            monto,
            fechaAsiento,
            "DISMINUYE",
            nroCuota,
            periodo,
          ],
        );

        //actualizamos saldo de cuenta de prestamo
        const updatePrestamo = await client.query(
          `UPDATE prestamo SET saldo_actual = (saldo_actual - $1), updated_at = NOW(), estado = $2  where id = $3`,
          [monto, "APROBADO", prestamo_id],
        );

        //--PARTE CONTABLE
        const insertAsiento = await client.query(
          `INSERT INTO asiento_contable ( fecha, glosa, referencia ) VALUES( $1, $2, $3 ) RETURNING id`,
          [
            fechaAsiento,
            `Pago de cuota ${nroCuota} por descuento de planilla - Socio ${cod_socio} - en fecha ${fechaAsiento.toLocaleDateString("es-ES")}`,
            `PRESTAMO - Importacion Excel`,
          ],
        );

        const asiento_id = insertAsiento.rows[0].id;

        // insertar datos a detalle asiento
        // para el debe BANCO +
        const insertDetAsientoDebe = await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [asiento_id, cuentaBancoId, cuentaAuxBanco, monto, 0],
        );
        // para el haber el cuentas por cobrar -
        const insertDetAsientoHaber = await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [asiento_id, cuentaCobrarId, cuenta_aux_prestamo_id, 0, monto],
        );
      }

      // ponemos en mora a los que no han pagado

      await client.query("COMMIT");
      return {
        status: "ok",
        list: rows,
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

  //* aprobar o rechazar prestamo
  public async apruebaRechazaPrestamo(
    codPrestamo: string,
    estado: string,
    obs?: string,
    file?: Express.Multer.File,
  ) {
    const client = await this.pool.connect();
    if (!["APROBADO", "RECHAZADO"].includes(estado)) {
      throw CustomError.badRequest("Estado no permitido");
    }

    //*variable para retornar la respuesta
    let respuesta;

    try {
      await client.query("BEGIN");
      if (estado === "APROBADO") {
        const fechaActual = new Date();
        // CONTROLAMOS QUE No se cree dos veces si ya fue aprobado
        const aqlPrestamo = await client.query(
          `SELECT estado, monto_solicitado, num_cuotas FROM prestamo WHERE codigo = $1`,
          [codPrestamo],
        );
        const estadoDb = aqlPrestamo.rows[0].estado;
        const montoSolicitado = aqlPrestamo.rows[0].monto_solicitado;
        if (estadoDb === "APROBADO") {
          throw CustomError.badRequest("Este Prestamo ya fue aprobado.");
        }
        //obtenemos el numero de cuotas para generar su cronograma de cuotas
        const nroCuotas = aqlPrestamo.rows[0].num_cuotas;

        //modificamos el prestamo e insertamos en cuenta aux
        const updatePrestamo = await client.query(
          `UPDATE prestamo 
          SET monto_otorgado = monto_solicitado, saldo_actual = monto_solicitado, fecha_otorgado = CURRENT_DATE, estado_soli = 'SIN SOLICITUD', estado = $1, updated_at = NOW()
          WHERE codigo = $2 returning id`,
          [estado, codPrestamo],
        );
        const prestamoId = updatePrestamo.rows[0].id;

        //? generarmos movimiento de desembolso
        //Insertar en movimiento prestamo para registrar el monto otorgado con el tipo movimiento DESEMBOLSO
        await client.query(
          `INSERT INTO movimiento_prestamo ( prestamo_id,  monto, tipo_movimiento, sentido, descripcion ) VALUES ( $1, $2, $3, $4, $5 )`,
          [
            prestamoId,
            +montoSolicitado,
            "DESEMBOLSO",
            "AUMENTA",
            "Desembolso de préstamo",
          ],
        );

        // ligamos con cuenta auxiliar
        const insertCuentaAux = await client.query(
          `INSERT INTO cuenta_auxiliar (referencia_id, referencia_tabla, referencia_cod)
          VALUES ($1, $2, $3) RETURNING id`,
          [prestamoId, "prestamo", codPrestamo],
        );
        const cuentaAuxPrestamo = insertCuentaAux.rows[0].id;

        // ontenemos id de la cuenta auxiliar DEL banco
        const sqlCuentaAuxBanco = await client.query(
          `select ca.id ,cb.id as cuenta_bancaria_id
           from cuenta_bancaria cb 
           inner join cuenta_auxiliar ca on cb.id = ca.referencia_id 
           where ca.referencia_tabla = $1 and cb.is_active = $2`,
          ["cuenta_bancaria", true],
        );

        const cuentaAuxBanco = sqlCuentaAuxBanco.rows[0].id;

        // de la tabla de la cuenta del banco de la cooperativa
        const cuentaBancariaId = sqlCuentaAuxBanco.rows[0].cuenta_bancaria_id;

        // obtenemos las cuentas que intervienen
        // obtenemos cuentas que intervendran en el detalle asiento banco y cuentas por cobrar socios
        const sqlCuentaContable = await client.query(
          `SELECT cc.id
       FROM unnest(ARRAY[$1, $2]) 
       WITH ORDINALITY AS orden(codigo, seq)
       INNER JOIN cuenta_contable cc 
         ON cc.codigo = orden.codigo
       ORDER BY orden.seq`,
          ["111001", "112001"],
        );
        const cuentaBancoId = sqlCuentaContable.rows[0].id;
        const cuentaCobrarId = sqlCuentaContable.rows[1].id;

        //--PARTE CONTABLE
        const insertAsiento = await client.query(
          `INSERT INTO asiento_contable ( fecha, glosa, referencia, cuenta_bancaria_id ) VALUES( $1, $2, $3, $4 ) RETURNING id`,
          [
            fechaActual,
            `Aprobación y desembolso de préstamo - Prestamo ${codPrestamo} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
            `PRESTAMO - aprobado`,
            cuentaBancariaId,
          ],
        );

        const asiento_id = insertAsiento.rows[0].id;

        // insertar datos a detalle asiento
        // para el debe cuentas por cobrar +
        const insertDetAsientoDebe = await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [asiento_id, cuentaCobrarId, cuentaAuxPrestamo, montoSolicitado, 0],
        );
        // para el haber el banco -
        const insertDetAsientoHaber = await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [asiento_id, cuentaBancoId, cuentaAuxBanco, 0, montoSolicitado],
        );

        //*GUARDAR EL COMPROBANTE Y REGISTRAR EL MOVIMIENTO EN MOVIMIENTO BANCARIO DE LA COOPERATIVA
        let urlImage: string | null = null;
        if (file) {
          urlImage = file
            ? await this.storageService.uploadFile(file, "comprobantes")
            : null;
        } else {
          urlImage = null;
        }

        await client.query(
          `
        INSERT INTO movimiento_bancario(cuenta_bancaria_id, asiento_contable_id,fecha, monto, tipo_operacion, categoria, comprobante, detalle, sentido) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            cuentaBancariaId,
            asiento_id,
            fechaActual,
            montoSolicitado,
            "RETIRO",
            "PRESTAMO",
            urlImage,
            `Retiro mediante transferencia bancaria por desembolso de Préstamo ${codPrestamo}`,
            "DISMINUYE",
          ],
        );

        // GENERAR LAS CUOTAS DEL PRESTAMO
        const cuotas = generateCuotas(montoSolicitado, nroCuotas);

        for (const cuota of cuotas) {
          await client.query(
            `INSERT INTO cuota_prestamo (prestamo_id, num_cuota, monto, mes, anio)
            VALUES ($1, $2, $3, $4, $5)`,
            [
              prestamoId,
              cuota.nro_cuota,
              cuota.monto,
              `${cuota.mes}`,
              `${cuota.anio}`,
            ],
          );
        }
      } else {
        const updatePrestamo = await client.query(
          `UPDATE prestamo 
          SET estado = $1, updated_at = NOW(), obs = $2, is_active = false , estado_soli = 'SIN SOLICITUD'
          WHERE codigo = $3 `,
          [estado, obs, codPrestamo],
        );
      }
      await client.query("COMMIT");

      console.log(
        `Nuevo prestamo aprobado en fecha ${new Date()} - codigo: ${codPrestamo}`,
      );

      respuesta = {
        status: "ok",
        message: `El Prestamo fue ${estado}.`,
        messageEmail: "",
        obs,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    } finally {
      client.release();
    }

    //* ENVIAR CORRREO DE CONFIRMACION
    const aqlPrestamo = await this.pool.query(
      `SELECT s.nom_completo,s.email, p.estado, p.monto_solicitado FROM prestamo p inner join socio s on p.socio_id = s.id WHERE p.codigo = $1`,
      [codPrestamo],
    );
    const montoSolicitado = aqlPrestamo.rows[0].monto_solicitado;
    const email = aqlPrestamo.rows[0].email;
    const nombreSocio = aqlPrestamo.rows[0].nom_completo;
    const estadoPrestamo = aqlPrestamo.rows[0].estado;

    if (email && email.trim() !== "") {
      try {
        if (estadoPrestamo === "APROBADO") {
          //? obtenemos datos del socio para enviar el correo
          console.log("Enviando correo de aprobación...");
          await emailService.enviarPrestamoAprobado(
            email,
            nombreSocio,
            montoSolicitado,
          );
          respuesta.messageEmail += " Se envió correo de aprobación al socio.";
        } else {
          await emailService.enviarPrestamoRechazado(email, nombreSocio, obs);
          respuesta.messageEmail += " Se envió correo de rechazo al socio.";
        }
      } catch (error) {
        console.error("Error al enviar correo:", error);
        respuesta.messageEmail += " No se pudo enviar el correo de aprobación.";
      }
    }

    return respuesta;
  }

  //* obtener prestamos de todos los usuarios
  public async getPrestamos() {
    try {
      const sqlPrestamos = await this.pool.query(
        `SELECT p.id, p.codigo,p.fecha_otorgado,p.monto_otorgado,p.saldo_actual, p.estado,p.estado_soli , s.nom_completo, s.cod_socio, s.id as socio_id
         FROM prestamo p
         inner join socio s on p.socio_id = s.id 
         ORDER BY p.estado_soli DESC , p.created_at DESC`,
      );
      const prestamos = sqlPrestamos.rows;

      return {
        message: "Listado de prestamos",
        status: "ok",
        prestamos,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //* obtener detalle de un prestamo en especifico
  public async getPrestamoSocio(codPrestamo: string) {
    try {
      const sqlPrestamo = await this.pool.query(
        `SELECT p.*, s.nom_completo, s.cod_socio, s.foto
         FROM prestamo p
         inner join socio s on p.socio_id = s.id
         WHERE p.codigo = $1`,
        [codPrestamo],
      );
      if (sqlPrestamo.rows.length <= 0) {
        throw CustomError.badRequest("El codigo del prestamo es incorrecto");
      }
      //console.log(sqlPrestamo.rows[0]);
      const prestamo = sqlPrestamo.rows[0];
      const prestamoId = sqlPrestamo.rows[0].id;

      //buscamos datos de amortizacion
      const sqlAmortizacion = await this.pool.query(
        `select * from amortizacion a where a.prestamo_id  = $1 and estado = 'EN REVISION'`,
        [prestamoId],
      );

      // buscamos datos de refinanciamiento

      const sqlRefinanciacion = await this.pool.query(
        `select * from refinanciamiento r where r.prestamo_origen_id  = $1 and estado = 'EN REVISION'`,
        [prestamoId],
      );

      //buscamos datos de cuotasList

      const sqlCuotasPrestamo = await this.pool.query(
        `select * from cuota_prestamo where prestamo_id = $1 and is_pay = false and is_active = true`,
        [prestamoId],
      );

      //buscamos datos de movimientos

      const sqlMovimientos = await this.pool.query(
        `SELECT
           fecha,
           created_at,
           descripcion,
           tipo_movimiento,
           periodo,
           nro_cuota,
       
           -- ABONO: disminuye la deuda del socio
           CASE
               WHEN sentido = 'DISMINUYE' THEN monto
               ELSE NULL
           END AS abono,
       
           -- CARGO: aumenta la deuda del socio
           CASE
               WHEN sentido = 'AUMENTA' THEN monto
               ELSE NULL
           END AS cargo,
       
           -- SALDO ACUMULADO DEL PRÉSTAMO
           SUM(
               CASE
                   WHEN sentido = 'AUMENTA' THEN monto
                   WHEN sentido = 'DISMINUYE' THEN -monto
                   ELSE 0
               END
           ) OVER (
               PARTITION BY prestamo_id
               ORDER BY fecha ASC, id ASC
               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
           ) AS saldo_capital
       
       FROM movimiento_prestamo
       WHERE prestamo_id = $1
       ORDER BY fecha ASC, id ASC;`,
        [prestamoId],
      );

      return {
        message: "Prestamo del socio",
        status: "ok",
        prestamo: {
          ...prestamo,
          cuotasRestates: +sqlCuotasPrestamo.rows.length,
          totalPagado: (
            +sqlPrestamo.rows[0].monto_otorgado -
            +sqlPrestamo.rows[0].saldo_actual
          ).toFixed(2),
          amortizado: sqlAmortizacion.rows[0] ?? null,
          refinanciado: sqlRefinanciacion.rows[0] ?? null,
          cuotasList: sqlCuotasPrestamo.rows ?? [],
          movimientos: sqlMovimientos.rows ?? [],
        },
      };
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //* APRUEBA O RECHAZA REFINANCIAMIENTO DE PRESTAMOS

  public async apruebaRechazaRefinancimiento(
    codPrestamo: string,
    cuota: string,
    montoSolicitado: string,
    refinanciamientoId: string | null,
    estado: string,
    file?: Express.Multer.File,
  ) {
    //* si el estado es rechazado solo actualizamos el estado del refinanciamiento a rechazado y ya esta
    //? revisar luego
    if (estado === "RECHAZADO") {
      const updateRefinanciamiento = await this.pool.query(
        `UPDATE refinanciamiento SET estado = $1, updated_at = NOW() WHERE id = $2 `,
        [estado, refinanciamientoId],
      );
      return {
        status: "ok",
        message: `El Refinanciamiento fue ${estado}.`,
      };
    }

    //? resultado de la transaccion

    let resultado;

    //validar que mi montoSolicitado solo contengo numeros , puntos y comas
    if (!/^[\d.,]+$/.test(montoSolicitado)) {
      throw CustomError.badRequest(
        "El monto solicitado solo debe contener números, puntos o comas",
      );
    }

    //* si el prestamo fue aprobado */

    const client = await this.pool.connect();
    //* comprobar si el prestamo existe y esta activo
    const sqlPrestamo = await client.query(
      `SELECT p.id,p.saldo_actual, p.socio_id , ca.id as cuenta_auxiliar_id , REGEXP_REPLACE(s.cod_socio, '\\D', '', 'g') AS num_emp
       FROM prestamo p 
       inner join cuenta_auxiliar ca on p.id = ca.referencia_id 
       inner join socio s on p.socio_id = s.id 
       WHERE p.codigo = $1 and p.is_active = true and ca.referencia_tabla = $2`,
      [codPrestamo, "prestamo"],
    );
    if (sqlPrestamo.rows.length <= 0) {
      throw CustomError.badRequest(
        "El codigo del prestamo es incorrecto o no se encuentra activo",
      );
    }
    const socioId = sqlPrestamo.rows[0].socio_id;
    const numEmpSocio = sqlPrestamo.rows[0].num_emp;
    const prestamoOldId = sqlPrestamo.rows[0].id;
    const cuentaAuxiliarPrestamoOldId = sqlPrestamo.rows[0].cuenta_auxiliar_id;

    const saldoActual = sqlPrestamo.rows[0].saldo_actual;

    // monto nuevo para el prestamo nuevo
    const montoTotal = new Decimal(montoSolicitado).plus(
      new Decimal(saldoActual),
    );
    //monto solicitado
    const montoSolicitadoDecimal = new Decimal(montoSolicitado);

    //* verificamos que el montoTotal no supere los 10000
    if (montoTotal.gt(10000)) {
      throw CustomError.badRequest(
        "El monto total del refinanciamiento no puede superar los 10,000",
      );
    }

    //? veridicamos que el prestamo no renga amortizacion en revision
    const sqlAmortizacion = await client.query(
      `SELECT * FROM amortizacion WHERE prestamo_id = $1 and estado = 'EN REVISION'`,
      [prestamoOldId],
    );
    if (sqlAmortizacion.rows.length > 0) {
      throw CustomError.badRequest(
        "El prestamo tiene una solicitud de amortización en revisión, no se puede realizar el refinanciamiento",
      );
    }

    //* obtenemos las cuentas contables que intervendran en las transacciones
    // ontenemos id de la cuenta auxiliar DEL banco
    const sqlCuentaAuxBanco = await client.query(
      `select ca.id ,cb.id as cuenta_bancaria_id
           from cuenta_bancaria cb 
           inner join cuenta_auxiliar ca on cb.id = ca.referencia_id 
           where ca.referencia_tabla = $1 and cb.is_active = $2`,
      ["cuenta_bancaria", true],
    );

    const cuentaAuxBanco = sqlCuentaAuxBanco.rows[0].id;

    // de la tabla de la cuenta del banco de la cooperativa
    const cuentaBancariaId = sqlCuentaAuxBanco.rows[0].cuenta_bancaria_id;

    // obtenemos las cuentas que intervienen
    // obtenemos cuentas que intervendran en el detalle asiento banco , cuentas por cobrar socios y Cuenta transitoria de refinanciamiento
    const sqlCuentaContable = await client.query(
      `SELECT cc.id
       FROM unnest(ARRAY[$1, $2, $3]) 
       WITH ORDINALITY AS orden(codigo, seq)
       INNER JOIN cuenta_contable cc 
         ON cc.codigo = orden.codigo
       ORDER BY orden.seq`,
      ["111001", "112001", "112002"],
    );
    const cuentaBancoId = sqlCuentaContable.rows[0].id;
    const cuentaCobrarId = sqlCuentaContable.rows[1].id;
    const cuentaTransitoriaId = sqlCuentaContable.rows[2].id;

    try {
      await client.query("BEGIN");
      const fechaActual = new Date();

      //* actualizamos los datos del prestamo viejo refinanciado
      //? actualizamos datos del prestamo como tal y ponemos saldo en cero
      const updatePrestamo = await client.query(
        `UPDATE prestamo 
         SET estado = 'REFINANCIADO', updated_at = NOW(), estado_soli = 'SIN SOLICITUD', is_active = false, is_refinanciado = true, saldo_actual = 0
         WHERE codigo = $1 `,
        [codPrestamo],
      );
      //? actualizamos sus cuotas
      const updateCuotas = await client.query(
        `UPDATE cuota_prestamo SET is_active = false, updated_at = NOW() WHERE prestamo_id = $1 `,
        [prestamoOldId],
      );

      //* CONTABLEMENTE MATAMOS EL PRESTAMO VIEJO
      //? insertamos asiento
      const insertAsiento = await client.query(
        `INSERT INTO asiento_contable ( fecha, glosa, referencia, cuenta_bancaria_id ) VALUES( $1, $2, $3, $4 ) RETURNING id`,
        [
          fechaActual,
          `Traslado de saldo pendiente a cuenta transitoria por refinanciamiento. - Prestamo ${codPrestamo} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
          `PRESTAMO - refinanciado`,
          cuentaBancariaId,
        ],
      );

      const asiento_id = insertAsiento.rows[0].id;

      // insertar datos a detalle asiento
      // cuenta por cobrar - se disminuye el saldo del prestamo viejo - haber
      const insertDetAsientoHaber = await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [
          asiento_id,
          cuentaCobrarId,
          cuentaAuxiliarPrestamoOldId,
          0,
          saldoActual,
        ],
      );
      // cuenta transitoria - se aumenta el saldo - debe
      const insertDetAsientoDebe = await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [asiento_id, cuentaTransitoriaId, null, saldoActual, 0],
      );

      //* REGISTRAMOS NUEVO PRESTAMO APROBADO POR REFINANCIAMIENTO
      //? generamos las cutas y creamos nuevo codigo
      const cuotas = generateCuotas(
        Number(montoTotal.toFixed(2)),
        Number(cuota),
      );

      const primeraCuota = cuotas[0];
      const ultimaCuota = cuotas.at(-1);

      // para el codigo del prestamo
      const sqlCodigo = await client.query(
        `SELECT count(*)as total_prestamos FROM prestamo WHERE socio_id = $1`,
        [socioId],
      );
      const totalPrestamos = sqlCodigo.rows[0].total_prestamos;

      const codPrestamoNew = `PRE-${+totalPrestamos + 1}-${numEmpSocio}`;

      //* insertamos nuevo prestamo
      const insertNuevoPrestamo = await client.query(
        `INSERT INTO prestamo ( socio_id, num_cuotas, cuota_mensual, ultima_cuota, codigo, monto_solicitado, monto_otorgado, saldo_actual, estado, fecha_otorgado, estado_soli, nuevo_prestamo ) 
         VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, $10 , $11 ) RETURNING id`,
        [
          socioId,
          cuota,
          primeraCuota.monto,
          ultimaCuota!.monto,
          codPrestamoNew,
          montoTotal.toFixed(2),
          montoTotal.toFixed(2),
          montoTotal.toFixed(2),
          "APROBADO",
          "SIN SOLICITUD",
          false,
        ],
      );

      const nuevoPrestamoId = insertNuevoPrestamo.rows[0].id;

      //* insertamos prestamo en cuenta auxiliar
      const insertCuentaAux = await client.query(
        `INSERT INTO cuenta_auxiliar (referencia_id, referencia_tabla, referencia_cod)
          VALUES ($1, $2, $3) RETURNING id`,
        [nuevoPrestamoId, "prestamo", codPrestamoNew],
      );
      const cuentaAuxPrestamoNewId = insertCuentaAux.rows[0].id;

      //* registramos nuevas cuotas dekl nuevo prestamo
      for (const cuota of cuotas) {
        await client.query(
          `INSERT INTO cuota_prestamo (prestamo_id, num_cuota, monto, mes, anio)
          VALUES ($1, $2, $3, $4, $5)`,
          [
            nuevoPrestamoId,
            cuota.nro_cuota,
            cuota.monto,
            `${cuota.mes}`,
            `${cuota.anio}`,
          ],
        );
      }
      //* REGISTRO DE MOVIMIENTO DE PRESTAMO ANTIGUO Y LO PONEMOS EN CERO PARA LLEVAR EL SALDO AL NUEVO PRESTAMO
      //? registramos el movimiento para cerrar el VIEJO PRESTAMO y llevar el saldo a cero
      await client.query(
        `INSERT INTO movimiento_prestamo (prestamo_id, tipo_movimiento, monto, sentido, descripcion)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          prestamoOldId,
          "REFINANCIAMIENTO",
          saldoActual,
          "DISMINUYE",
          `Traspaso de saldo a nuevo préstamo ${codPrestamoNew} por refinanciamiento`,
        ],
      );

      //? registramos el traspaso de dinero que vieje del viejo prestamo HACIA EL NUEVO PRESTAMO POR REFINANCIAMIENTO
      await client.query(
        `INSERT INTO movimiento_prestamo (prestamo_id, tipo_movimiento, monto, sentido, descripcion)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          nuevoPrestamoId,
          "SALDO INICIAL",
          //montoTotal.toFixed(2),
          saldoActual,
          "AUMENTA",
          `Saldo proveniente del préstamo ${codPrestamo}`,
        ],
      );

      //? registramos el DESEMBOLSO DEL NUEVO PRESTAMO POR REFINANCIAMIENTO
      await client.query(
        `INSERT INTO movimiento_prestamo (prestamo_id, tipo_movimiento, monto, sentido, descripcion)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          nuevoPrestamoId,
          "DESEMBOLSO",
          montoSolicitadoDecimal.toFixed(2),
          "AUMENTA",
          `Desembolso adicional correspondiente al refinanciamiento del préstamo`,
        ],
      );

      //* REGISTAMOS PARTE CONTABLE PARA ESTE NUEVO PRESTAMO CON EL DESEMBOLSO POR REFINANCIAMIENTO
      //? insertamos asiento
      const glosa = `Registro de nuevo préstamo por refinanciamiento del préstamo N° ${codPrestamo}, por Bs ${montoTotal} (Bs ${saldoActual} refinanciado + Bs ${montoSolicitado} desembolsado) - Prestamo ${codPrestamoNew} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`;
      const insertAsientoRefi = await client.query(
        `INSERT INTO asiento_contable ( fecha, glosa, referencia, cuenta_bancaria_id ) VALUES( $1, $2, $3, $4 ) RETURNING id`,
        [
          fechaActual,
          glosa,
          `PRESTAMO - desembolso por refinanciamiento`,
          cuentaBancariaId,
        ],
      );

      const asientoRefiId = insertAsientoRefi.rows[0].id;

      // insertar datos a detalle asiento
      //? para el debe cuentas por cobrar +
      const insertDetAsientoDebeRefi = await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [
          asientoRefiId,
          cuentaCobrarId,
          cuentaAuxPrestamoNewId,
          montoTotal.toFixed(2),
          0,
        ],
      );
      //? para el haber el banco -
      const insertDetAsientoHaberRefi = await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [asientoRefiId, cuentaBancoId, cuentaAuxBanco, 0, montoSolicitado],
      );
      //? para el haber el cuenta transitoria -
      const insertDetAsientoHaberRefiTransi = await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [asientoRefiId, cuentaTransitoriaId, null, 0, saldoActual],
      );

      //* registamos el movimiento bancario por el desembolso del refinanciamiento
      //*GUARDAR EL COMPROBANTE Y REGISTRAR EL MOVIMIENTO EN MOVIMIENTO BANCARIO DE LA COOPERATIVA
      let urlImage: string | null = null;
      if (file) {
        urlImage = file
          ? await this.storageService.uploadFile(file, "comprobantes")
          : null;
      } else {
        urlImage = null;
      }

      await client.query(
        `
        INSERT INTO movimiento_bancario(cuenta_bancaria_id,fecha, monto, tipo_operacion, categoria, comprobante, detalle, sentido) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          cuentaBancariaId,
          fechaActual,
          montoSolicitado,
          "RETIRO",
          "PRESTAMO",
          urlImage,
          `Retiro mediante transferencia bancaria por desembolso de Préstamo por Refinanciamiento ${codPrestamoNew}`,
          "DISMINUYE",
        ],
      );

      //* registramos el refinanciamiento en su tabla
      if (refinanciamientoId !== "0") {
        //aqui ya existe el refinanciemiento solo lo actualizamos
        await client.query(
          `UPDATE refinanciamiento SET estado = 'APROBADO', prestamo_nuevo_id = $1, saldo_original = $2,monto_solicitado = $3, monto_aprobado = $4, cuotas = $5, updated_at = NOW() WHERE id = $6 `,
          [
            nuevoPrestamoId,
            saldoActual,
            montoSolicitado,
            montoTotal.toFixed(2),
            cuotas.length,
            refinanciamientoId,
          ],
        );
      } else {
        await client.query(
          `INSERT INTO refinanciamiento (prestamo_origen_id, prestamo_nuevo_id, saldo_original, monto_solicitado, monto_aprobado, cuotas, estado) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            prestamoOldId,
            nuevoPrestamoId,
            saldoActual,
            montoSolicitado,
            montoTotal.toFixed(2),
            cuotas.length,
            "APROBADO",
          ],
        );
      }

      await client.query("COMMIT");

      console.log(
        `Refinanciamiento aprobado y prestamo generado correctamente. ${codPrestamo} -> ${codPrestamoNew} en fecha ${new Date()}`,
      );

      resultado = {
        message: "Refinanciemiento aprobado y prestamo generado correctamente.",
        status: "ok",
        messageEmail: "",
        data: {
          codPrestamo,
          codPrestamoNew,
          cuota,
          montoSolicitado,
          saldoActual,
          montoTotal,
          estado,
          cuotas,
        },
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    } finally {
      client.release();
    }

    //* ENVIAR CORRREO DE CONFIRMACION
    const aqlPrestamo = await this.pool.query(
      `SELECT s.nom_completo,s.email, p.estado, p.monto_solicitado FROM prestamo p inner join socio s on p.socio_id = s.id WHERE p.codigo = $1`,
      [codPrestamo],
    );
    const email = aqlPrestamo.rows[0].email;
    const nombreSocio = aqlPrestamo.rows[0].nom_completo;

    if (email && email.trim() !== "") {
      try {
        //? obtenemos datos del socio para enviar el correo
        console.log(
          `Enviando correo de aprobación refinanciamiento... ${codPrestamo}`,
        );
        await emailService.enviarRefinanciamientoAprobado(
          email,
          nombreSocio,
          saldoActual,
          montoSolicitado,
          montoTotal.toFixed(2),
        );
        resultado.messageEmail += " Se envió correo de aprobación al socio.";
      } catch (error) {
        console.error("Error al enviar correo:", error);
        resultado.messageEmail += " No se pudo enviar el correo de aprobación.";
      }
    }

    return resultado;
  }

  //* acepta o rechaza amorizacion prestamo
  //el codigo de ahorro vendra en caso de que se amortize utilizando sus ahorros
  public async apruebaRechazaAmortizacion(
    codPrestamo: string,
    montoAmortizar: string,
    estado: string,
    amortizacionId: number | null,
    codAhorro: string | null,
    file?: Express.Multer.File,
  ) {
    //* si el estado es rechazado solo actualizamos el estado de la amortizacion a rechazado y ya esta
    //? revisar luego es posible que se pueda introducir la obs
    if (estado === "RECHAZADO") {
      const updateRefinanciamiento = await this.pool.query(
        `UPDATE amortizacion SET estado = $1, updated_at = NOW() WHERE id = $2 `,
        [estado, amortizacionId],
      );
      return {
        status: "ok",
        message: `La Amortizacion fue ${estado}.`,
      };
    }
    //* si es aprobado realizamos toda la logica
    let respuesta;
    //?verificamos que el monto solo contega numeros comas y puntos
    if (!/^[\d.,]+$/.test(montoAmortizar)) {
      throw CustomError.badRequest(
        "El monto solicitado solo debe contener números, puntos o comas",
      );
    }

    //? creamos variable general para la conexion
    const client = await this.pool.connect();

    //* comprobar si el prestamo existe y esta activo
    const sqlPrestamo = await client.query(
      `SELECT p.id,p.saldo_actual, p.socio_id , ca.id as cuenta_auxiliar_id , REGEXP_REPLACE(s.cod_socio, '\\D', '', 'g') AS num_emp
       FROM prestamo p 
       inner join cuenta_auxiliar ca on p.id = ca.referencia_id 
       inner join socio s on p.socio_id = s.id 
       WHERE p.codigo = $1 and p.is_active = true and ca.referencia_tabla = $2`,
      [codPrestamo, "prestamo"],
    );
    if (sqlPrestamo.rows.length <= 0) {
      throw CustomError.badRequest(
        "El codigo del prestamo es incorrecto o no se encuentra activo",
      );
    }
    const socioId = sqlPrestamo.rows[0].socio_id;
    const numEmpSocio = sqlPrestamo.rows[0].num_emp;
    const prestamoId = sqlPrestamo.rows[0].id;
    const cuentaAuxiliarPrestamoId = sqlPrestamo.rows[0].cuenta_auxiliar_id;

    const saldoActual = sqlPrestamo.rows[0].saldo_actual;

    const nuevoSaldo = new Decimal(saldoActual).minus(
      new Decimal(montoAmortizar),
    );

    // pregunta si el saldo es menor a cero
    if (nuevoSaldo.lessThan(0)) {
      throw CustomError.badRequest(
        "El monto a amortizar supera el saldo actual del préstamo.",
      );
    }

    //?verificamos que no tenga refinanciamiento en revision
    const sqlRefinanciamiento = await client.query(
      `select * from refinanciamiento r where r.prestamo_origen_id  = $1 and estado = 'EN REVISION'`,
      [prestamoId],
    );
    if (sqlRefinanciamiento.rows.length > 0) {
      throw CustomError.badRequest(
        "El prestamo tiene un refinanciamiento en revision, no se puede realizar la amortizacion.",
      );
    }

    //* datos GENERALES PARA LA TRANSACCION

    //* obtenemos las cuentas contables que intervendran en las transacciones
    // ontenemos id de la cuenta auxiliar DEL banco
    const sqlCuentaAuxBanco = await client.query(
      `select ca.id ,cb.id as cuenta_bancaria_id
           from cuenta_bancaria cb 
           inner join cuenta_auxiliar ca on cb.id = ca.referencia_id 
           where ca.referencia_tabla = $1 and cb.is_active = $2`,
      ["cuenta_bancaria", true],
    );

    const cuentaAuxBanco = sqlCuentaAuxBanco.rows[0].id;

    // de la tabla de la cuenta del banco de la cooperativa
    const cuentaBancariaId = sqlCuentaAuxBanco.rows[0].cuenta_bancaria_id;

    // obtenemos las cuentas que intervienen
    //* obtenemos cuentas que intervendran en los diferentes tipos de amortizacion
    const sqlCuentaContable = await client.query(
      `SELECT cc.id
       FROM unnest(ARRAY[$1, $2, $3]) 
       WITH ORDINALITY AS orden(codigo, seq)
       INNER JOIN cuenta_contable cc 
         ON cc.codigo = orden.codigo
       ORDER BY orden.seq`,
      ["111001", "112001", "212001"],
    );
    //? cuentas contables
    const cuentaContBancoId = sqlCuentaContable.rows[0].id;
    const cuentaContCobrarId = sqlCuentaContable.rows[1].id;
    const cuentaContAhorroSociosId = sqlCuentaContable.rows[2].id;

    try {
      await client.query("BEGIN");
      const fechaActual = new Date();
      //? invalidamos todas las cuotas que no hayan sido pagadas
      await client.query(
        `UPDATE cuota_prestamo SET is_active = false, updated_at = NOW() WHERE prestamo_id = $1 AND is_pay = false`,
        [prestamoId],
      );

      //? obtenemos el monto de la cuota que estaba proxima a cobrarse y generamos nuevas cuotas

      const sqlCuotaMensual = await client.query(
        `select monto, num_cuota from cuota_prestamo where is_pay = false and prestamo_id = $1 order by num_cuota asc limit 1    
          `,
        [prestamoId],
      );
      const cuotaMensual = new Decimal(sqlCuotaMensual.rows[0].monto);
      const numCuotaMensual = Number(sqlCuotaMensual.rows[0].num_cuota);
      //console.log(Number(nuevoSaldo.toFixed(2)), Number(cuotaMensual));

      const nuevasCuotas = generateCuotasPorMontoMensual(
        Number(nuevoSaldo.toFixed(2)),
        Number(cuotaMensual.toFixed(2)),
        numCuotaMensual,
      );
      // registramos nuevas cuotas
      for (const cuota of nuevasCuotas) {
        await client.query(
          `INSERT INTO cuota_prestamo (prestamo_id, num_cuota, monto, mes, anio)
            VALUES ($1, $2, $3, $4, $5)`,
          [
            prestamoId,
            cuota.nro_cuota,
            cuota.monto,
            `${cuota.mes}`,
            `${cuota.anio}`,
          ],
        );
      }
      //? actualizamos prestamo
      if (nuevoSaldo.equals(0)) {
        await client.query(
          `
            UPDATE prestamo SET saldo_actual = $1, num_cuotas = $2, cuota_mensual = $3, ultima_cuota = $4, updated_at = NOW(), estado_soli = $5, estado = $6, is_active = $7 WHERE id = $8
          `,
          [
            nuevoSaldo.toFixed(2),
            0,
            0,
            0,
            "SIN SOLICITUD",
            "CANCELADO",
            false,
            prestamoId,
          ],
        );
      } else {
        await client.query(
          `
            UPDATE prestamo SET saldo_actual = $1, num_cuotas = $2, cuota_mensual = $3, ultima_cuota = $4, updated_at = NOW(), estado_soli = $5, estado = $6 WHERE id = $7
          `,
          [
            nuevoSaldo.toFixed(2),
            nuevasCuotas[nuevasCuotas.length - 1].nro_cuota,
            nuevasCuotas[0].monto,
            nuevasCuotas[nuevasCuotas.length - 1].monto,
            "SIN SOLICITUD",
            "AMORTIZADO",
            prestamoId,
          ],
        );
      }

      //* preguntamos si la amortizacion sera por ahorros o amortizacion extraordinaria
      if (!codAhorro) {
        //* NO SE REALIZARA LA AMORTIZACION CON AHORROS
        //? registramos movimiento prestamo
        await client.query(
          `
          INSERT INTO movimiento_prestamo (prestamo_id, tipo_movimiento, monto, sentido, descripcion)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [
            prestamoId,
            "AMORTIZACION",
            montoAmortizar,
            "DISMINUYE",
            `Amortizacion extraordinaria mediante transferencia bancaria`,
          ],
        );

        //? registramos movimiento bancario
        //*GUARDAR EL COMPROBANTE
        let urlImage: string | null = null;
        if (file) {
          urlImage = file
            ? await this.storageService.uploadFile(file, "comprobantes")
            : null;
        } else {
          urlImage = null;
        }

        //*REGISTRAMOS LA AMORTIZACION COMO TAL

        if (amortizacionId) {
          //log para el comentario de la actualizacion de la amortizacion
          console.log("actualizando amortizacion con id: ", amortizacionId);
          //aqui ya existe la amortizacion solo la actualizamos
          await client.query(
            `UPDATE amortizacion SET estado = 'APROBADO', monto = $1, saldo_original = $2, nuevo_saldo = $3,  updated_at = NOW(), is_active = false WHERE id = $4 `,
            [
              montoAmortizar,
              saldoActual,
              nuevoSaldo.toFixed(2),
              amortizacionId,
            ],
          );
          //* OBTENEMOS EL COMPROBANTE DE LA AMORTIZACION PARA REGISTRARLO EN MOVIMIENTO BANCARIO
          const sqlComprobante = await client.query(
            `SELECT comprobante FROM amortizacion WHERE id = $1`,
            [amortizacionId],
          );
          urlImage = sqlComprobante.rows[0].comprobante;
        } else {
          console.log("insertando amortizacion con id: ", amortizacionId);
          await client.query(
            `INSERT INTO amortizacion (prestamo_id, monto, saldo_original, nuevo_saldo, estado, is_active, comprobante) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              prestamoId,
              montoAmortizar,
              saldoActual,
              nuevoSaldo.toFixed(2),
              "APROBADO",
              false,
              urlImage,
            ],
          );
        }
        //* REGISTRAR EL MOVIMIENTO EN MOVIMIENTO BANCARIO DE LA COOPERATIVA
        await client.query(
          `
          INSERT INTO movimiento_bancario(cuenta_bancaria_id, fecha, monto, tipo_operacion, categoria, comprobante, detalle, sentido)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            cuentaBancariaId,
            new Date(),
            montoAmortizar,
            "DEPOSITO",
            "PRESTAMO",
            urlImage,
            `Deposito mediante transferencia bancaria por amortizacion de Préstamo ${codPrestamo}`,
            "AUMENTA",
          ],
        );

        //* REGISTRO DE LA PARTE CONTABLE
        //? insertamos asiento
        const insertAsiento = await client.query(
          `INSERT INTO asiento_contable (glosa, referencia, cuenta_bancaria_id ) values ($1, $2, $3) RETURNING id`,
          [
            `Amortizacion extraordinaria aplicada al capital - Prestamo ${codPrestamo} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
            `PRESTAMO - amortizacion extraordinaria`,
            cuentaBancariaId,
          ],
        );
        //? insertamos detalle asiento
        const asiento_id = insertAsiento.rows[0].id;

        // para el debe cuentas por cobrar -
        await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [
            asiento_id,
            cuentaContCobrarId,
            cuentaAuxiliarPrestamoId,
            0,
            montoAmortizar,
          ],
        );
        // para el haber el banco +
        await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [asiento_id, cuentaContBancoId, cuentaAuxBanco, montoAmortizar, 0],
        );
      } else {
        //* SE AMORTIZARA CON AHORROS

        //? verificamos que la cuenta del socio exista
        const sqlCtaAhorro = await client.query(
          `select ca.saldo_actual, ca.id ,ca2.id as id_cuenta_auxiliar, ca.codigo 
         from cuenta_ahorro ca 
         inner join cuenta_auxiliar ca2 on ca.id = ca2.referencia_id 
         where ca.socio_id = $1 and ca.codigo = $2 and ca2.referencia_tabla = 'cuenta_ahorro'`,
          [socioId, codAhorro],
        );
        if (sqlCtaAhorro.rows.length <= 0) {
          throw CustomError.badRequest("El socio no tiene cuenta de ahorro.");
        }
        const saldoAhorro = sqlCtaAhorro.rows[0].saldo_actual;
        const cuentaAhorroId = sqlCtaAhorro.rows[0].id;
        const cuentaAuxAhorroId = sqlCtaAhorro.rows[0].id_cuenta_auxiliar;
        const codCtaAhorro = sqlCtaAhorro.rows[0].codigo;

        //? verificamos que el monto a amortizar no supere el saldo de la cuenta de ahorro
        if (new Decimal(montoAmortizar).gt(new Decimal(saldoAhorro))) {
          throw CustomError.badRequest(
            "El monto a amortizar supera el saldo de la cuenta de ahorro del socio.",
          );
        }

        //? actualizamos el saldo de la cuenta de ahorro
        const nuevoSaldoAhorro = new Decimal(saldoAhorro).minus(
          new Decimal(montoAmortizar),
        );
        await client.query(
          `UPDATE cuenta_ahorro SET saldo_actual = $1, updated_at = NOW() WHERE id = $2`,
          [nuevoSaldoAhorro.toFixed(2), cuentaAhorroId],
        );
        //? actualizamos movimiento ahorro
        await client.query(
          `INSERT INTO movimiento_ahorro (ahorro_id, tipo_operacion, monto, sentido, descripcion) VALUES ($1, $2, $3, $4, $5)`,
          [
            cuentaAhorroId,
            "RETIRO",
            montoAmortizar,
            "DISMINUYE",
            `Retiro de ahorro por compensación de préstamo ${codPrestamo}`,
          ],
        );

        //? registramos movimiento prestamo
        await client.query(
          `
          INSERT INTO movimiento_prestamo (prestamo_id, tipo_movimiento, monto, sentido, descripcion)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [
            prestamoId,
            "AMORTIZACION",
            montoAmortizar,
            "DISMINUYE",
            `Amortizacion extraordinaria con la cuenta de ahorro ${codCtaAhorro}`,
          ],
        );

        //* REGISTRO DE LA PARTE CONTABLE
        //? insertamos asiento
        const insertAsiento = await client.query(
          `INSERT INTO asiento_contable (glosa, referencia, cuenta_bancaria_id ) values ($1, $2, $3) RETURNING id`,
          [
            `Amortización de préstamo mediante compensación con la cuenta de ahorro ${codCtaAhorro} - Prestamo ${codPrestamo} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
            `PRESTAMO - amortizacion extraordinaria con ahorros`,
            cuentaBancariaId,
          ],
        );
        //? insertamos detalle asiento
        const asiento_id = insertAsiento.rows[0].id;

        // para el haber cuentas por cobrar -
        await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [
            asiento_id,
            cuentaContCobrarId,
            cuentaAuxiliarPrestamoId,
            0,
            montoAmortizar,
          ],
        );
        // para el debe la cuenta de ahorro del socio -
        await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [
            asiento_id,
            cuentaContAhorroSociosId,
            cuentaAuxAhorroId,
            montoAmortizar,
            0,
          ],
        );

        //*REGISTRAMOS LA AMORTIZACION COMO TAL
        if (amortizacionId) {
          //aqui ya existe la amortizacion solo la actualizamos
          await client.query(
            `UPDATE amortizacion SET estado = 'APROBADO', monto = $1, saldo_original = $2, nuevo_saldo = $3, is_amort_ahorros = true, ahorro_cod = $4, updated_at = NOW() WHERE id = $5 `,
            [
              montoAmortizar,
              saldoActual,
              nuevoSaldo.toFixed(2),
              codCtaAhorro,
              amortizacionId,
            ],
          );
        } else {
          await client.query(
            `INSERT INTO amortizacion (prestamo_id, monto, saldo_original, nuevo_saldo, estado, is_amort_ahorros, ahorro_cod, is_active, comprobante) VALUES ($1, $2, $3, $4, $5, true, $6, false, $7)`,
            [
              prestamoId,
              montoAmortizar,
              saldoActual,
              nuevoSaldo.toFixed(2),
              "APROBADO",
              codCtaAhorro,
              "uploads/img/amortizado_con_ahorros.jpeg", // COMPLETAR CON EL NOMBRE DEL ARCHIVO SI SE SUBE
            ],
          );
        }
      }

      await client.query("COMMIT");
      console.log(
        `Amortizacion aprobada por admin insertada en fecha ${new Date()} - codigo: ${codPrestamo}`,
      );
      respuesta = {
        message: "respuesta desde amortizacion",
        status: "ok",
        messageEmail: "",
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    } finally {
      client.release();
    }

    //* ENVIAR CORRREO DE CONFIRMACION
    const aqlPrestamo = await this.pool.query(
      `SELECT s.nom_completo,s.email, p.estado, p.monto_solicitado FROM prestamo p inner join socio s on p.socio_id = s.id WHERE p.codigo = $1`,
      [codPrestamo],
    );
    const email = aqlPrestamo.rows[0].email;
    const nombreSocio = aqlPrestamo.rows[0].nom_completo;

    if (email && email.trim() !== "") {
      try {
        //? obtenemos datos del socio para enviar el correo
        console.log(
          `Enviando correo de aprobación amortización... ${codPrestamo}`,
        );
        await emailService.enviarAmortizacionAprobado(
          email,
          nombreSocio,
          saldoActual,
          montoAmortizar,
          nuevoSaldo.toFixed(2),
        );
        respuesta.messageEmail += " Se envió correo de aprobación al socio.";
      } catch (error) {
        console.error("Error al enviar correo:", error);
        respuesta.messageEmail += " No se pudo enviar el correo de aprobación.";
      }
    }

    return respuesta;
  }

  //******* USUARIO NORMAL ********//

  //* solicitar prestamo
  public async solicitaPrestamo(
    socioId: number,
    monto: number,
    nroCuotas: number,
  ) {
    //variable para la respuesta del servicio
    let response: any = {};

    const client = await this.pool.connect();
    // Controlamos que monto no sea mayor a 10000
    if (monto > 10000) {
      throw CustomError.badRequest(
        "El monto del prestamo no puede superar los Bs. 10000, por favor  introduzca otra cantidad",
      );
    }
    if (monto < 999) {
      throw CustomError.badRequest(
        "El monto del prestamo no puede ser menor a 1000",
      );
    }
    //solo permitir nroCuotas este entre 4,6,10,14
    if (
      nroCuotas != 4 &&
      nroCuotas != 6 &&
      nroCuotas != 10 &&
      nroCuotas != 12 &&
      nroCuotas != 14
    ) {
      throw CustomError.badRequest(
        "La cantidad de cuotas no esta dentro del rango permitido",
      );
    }

    //obtenemos el array de cuotas
    const cuotas = generateCuotas(monto, nroCuotas);
    //obtenemos primera y ultima cuota
    //console.log({ cuotas });
    const primeraCuota = cuotas[0];
    const ultimaCuota = cuotas.at(-1);

    // verificamos si tiene un prestamo activo para que no pueda solicitar otro
    const sqlPrestamo = await client.query(
      `SELECT is_active, estado FROM prestamo WHERE socio_id = $1 order by id desc limit 1`,
      [socioId],
    );

    const isActive = sqlPrestamo.rows[0]?.is_active ?? false;
    const estado = sqlPrestamo.rows[0]?.estado;

    if (isActive) {
      throw CustomError.badRequest(
        "No puede solicitar un nuevo préstamo mientras tenga un préstamo activo vigente.",
      );
    }

    // para el codigo del prestamo
    const sqlCodigo = await client.query(
      `SELECT count(*)as total_prestamos FROM prestamo WHERE socio_id = $1`,
      [socioId],
    );
    const totalPrestamos = sqlCodigo.rows[0].total_prestamos ?? 0;

    // obtenemos num_emp del socio para el codigo del prestamo
    const socioSql = await client.query(
      `SELECT REGEXP_REPLACE(cod_socio, '\\D', '', 'g') AS num_emp FROM socio WHERE id = $1
      `,
      [socioId],
    );
    const numEmp = socioSql.rows[0].num_emp;

    const codPrestamo = `PRE-${+totalPrestamos + 1}-${numEmp}`;

    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE prestamo SET is_active = false WHERE socio_id = $1 `,
        [socioId],
      );

      const insertPrestamo = await client.query(
        `INSERT INTO prestamo ( socio_id, num_cuotas, cuota_mensual, ultima_cuota, codigo, monto_solicitado, saldo_actual )
                     values ( $1, $2, $3, $4, $5, $6, $7 ) RETURNING * `,
        [
          socioId,
          nroCuotas,
          primeraCuota.monto,
          ultimaCuota!.monto,
          codPrestamo,
          monto,
          monto,
        ],
      );

      //una vez registrdo dejara a los demas en false

      await client.query("COMMIT");

      console.log(
        `Solicitud de prestamo insertada en fecha ${new Date()} - codigo: ${codPrestamo}`,
      );

      response = {
        status: "ok",
        message: "Solicitud enviada con exito",
        prestamo: insertPrestamo.rows[0],
        messageEmail: "",
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    } finally {
      client.release();
    }

    //* ENVIAR CORRREO DE CONFIRMACION
    const sqlPrestamoEmail = await this.pool.query(
      `SELECT s.nom_completo FROM prestamo p inner join socio s on p.socio_id = s.id WHERE p.codigo = $1`,
      [codPrestamo],
    );

    const nombreSocio = sqlPrestamoEmail.rows[0].nom_completo;

    try {
      //? obtenemos datos del socio para enviar el correo
      console.log(
        `Enviando correo de solicitud de nuevo prestamo... ${codPrestamo}`,
      );
      await emailService.enviarSolicitudPrestamo(
        nombreSocio,
        monto.toFixed(2),
        nroCuotas,
      );
      response.messageEmail +=
        " Se envió correo de solicitud al administrador.";
    } catch (error) {
      console.error("Error al enviar correo:", error);
      response.messageEmail +=
        " No se pudo enviar el correo de solicitud de nuevo prestamo.";
    }

    return response;
  }

  //* SOLICITAR REFINANCIAMIENTO DE PRESTAMO
  public async solicitaRefinanciamiento(
    socioId: number,
    codPrestamo: string,
    montoSolicitado: string,
    cuotas: string,
  ) {
    const client = await this.pool.connect();
    //? validamos cuotas
    if (!cuotas) {
      throw CustomError.badRequest("El número de cuotas es requerido.");
    } else if (
      cuotas != "4" &&
      cuotas != "6" &&
      cuotas != "10" &&
      cuotas != "12" &&
      cuotas != "14"
    ) {
      throw CustomError.badRequest("El número de cuotas incorrecto.");
    }

    //?controlamos que el monto solicitado supere los 1000 y no supere los 10.000
    const montoSolicitadoDecimal = new Decimal(montoSolicitado);
    let saldoActual = new Decimal(0);
    let montoTotal = new Decimal(0);

    if (montoSolicitadoDecimal.lessThan(1000)) {
      throw CustomError.badRequest(
        "El monto solicitado no puede ser menor a Bs. 1000.",
      );
    }
    if (montoSolicitadoDecimal.greaterThan(10000)) {
      throw CustomError.badRequest(
        "El monto solicitado no puede ser mayor a Bs. 10000.",
      );
    }

    // variable para el retorno de respuesta
    let response: any = {};

    try {
      await client.query("BEGIN");

      //? verificamos que el prestamo exista , este activo y pertenezca al socio
      const sqlPrestamo = await client.query(
        `SELECT * FROM prestamo WHERE codigo = $1 AND socio_id = $2 AND is_active = true`,
        [codPrestamo, socioId],
      );

      if (sqlPrestamo.rows.length <= 0) {
        throw CustomError.badRequest(
          "No se encontró ningún préstamo activo para este socio.",
        );
      }
      const prestamo = sqlPrestamo.rows[0];

      //? verificamos que el prestamo no tenga una solicitud de amortizacion pendiente
      const sqlAmortizacion = await client.query(
        `SELECT * FROM amortizacion WHERE prestamo_id = $1 AND estado = 'EN REVISION' and is_active = true`,
        [prestamo.id],
      );

      if (sqlAmortizacion.rows.length > 0) {
        throw CustomError.badRequest(
          "Ya existe una solicitud de amortización pendiente para este préstamo.",
        );
      }

      //? verificamos que el prestamo no tenga un refinanciamiento pendiente
      const sqlRefinanciamiento = await client.query(
        `SELECT * FROM refinanciamiento WHERE prestamo_origen_id = $1 AND estado = 'EN REVISION' and is_active = true`,
        [prestamo.id],
      );

      if (sqlRefinanciamiento.rows.length > 0) {
        throw CustomError.badRequest(
          "Ya existe una solicitud de refinanciamiento pendiente para este préstamo.",
        );
      }

      //? verificamos que el montoSolicitado mas el saldo actual no supere a 10000
      saldoActual = new Decimal(prestamo.saldo_actual);
      montoTotal = saldoActual.plus(montoSolicitadoDecimal);

      if (montoTotal.greaterThan(10000)) {
        throw CustomError.badRequest(
          "El monto total del préstamo refinanciado no puede superar los Bs. 10000.",
        );
      }

      //? generar cuotas
      const totalCuotas = generateCuotas(
        Number(montoTotal.toFixed(2)),
        Number(cuotas),
      );

      //? insertamos la solicitud de refinanciamiento
      await client.query(
        `INSERT INTO refinanciamiento (prestamo_origen_id, prestamo_nuevo_id, saldo_original, monto_solicitado, cuotas) VALUES ($1, $2, $3, $4, $5)`,
        [
          prestamo.id,
          prestamo.id,
          saldoActual.toFixed(2),
          montoSolicitadoDecimal.toFixed(2),
          totalCuotas.length,
        ],
      );

      //? actualizamos estado del prestamo
      await client.query(
        `UPDATE prestamo SET estado_soli = 'REFINANCIAMIENTO', updated_at = NOW() WHERE id = $1`,
        [prestamo.id],
      );

      await client.query("COMMIT");
      console.log(
        `Solicitud de refinanciamiento insertada en fecha ${new Date()} - codigo: ${prestamo.codigo}`,
      );

      response = {
        message: "Solicitud de refinanciamiento enviada con exito",
        status: "ok",
        prestamo,
        montoSolicitado,
        codPrestamo,
        socioId,
        messageEmail: "",
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    } finally {
      client.release();
    }

    //ENVIO DE CORREO DE CONFIRMACION
    const sqlPrestamoEmail = await this.pool.query(
      `SELECT s.nom_completo FROM prestamo p inner join socio s on p.socio_id = s.id WHERE p.codigo = $1`,
      [codPrestamo],
    );

    const nombreSocio = sqlPrestamoEmail.rows[0].nom_completo;

    try {
      //? obtenemos datos del socio para enviar el correo
      console.log(
        `Enviando correo de solicitud de refinanciamiento... ${codPrestamo}`,
      );
      await emailService.enviarSolicitudRefinanciamiento(
        nombreSocio,
        codPrestamo,
        saldoActual.toFixed(2),
        montoSolicitadoDecimal.toFixed(2),
        montoTotal.toFixed(2),
      );
      response.messageEmail +=
        " Se envió correo de solicitud al administrador.";
    } catch (error) {
      console.error("Error al enviar correo:", error);
      response.messageEmail +=
        " No se pudo enviar el correo de solicitud de Refinanciamiento.";
    }

    return response;
  }

  //* SOLICITA AMORTIZACION DE PRESTAMO POR EL SOCIO
  public async solicitaAmortizacion(
    socioId: number,
    codPrestamo: string,
    montoAmortizar: string,
    file?: Express.Multer.File,
  ) {
    //? verificamos que el monto solo contega numeros comas y puntos
    if (!/^[\d.,]+$/.test(montoAmortizar)) {
      throw CustomError.badRequest(
        "El monto solicitado solo debe contener números, puntos o comas",
      );
    }
    //variable para el retorno de respuesta
    let response: any = {};

    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      //? verificamos que el prestamo exista , este activo y pertenezca al socio
      const sqlPrestamo = await client.query(
        `SELECT * FROM prestamo WHERE codigo = $1 AND socio_id = $2 AND is_active = true`,
        [codPrestamo, socioId],
      );

      if (sqlPrestamo.rows.length <= 0) {
        throw CustomError.badRequest(
          "No se encontró ningún préstamo activo para este socio.",
        );
      }
      const prestamo = sqlPrestamo.rows[0];

      //? verificamos que el prestamo no tenga una solicitud de amortizacion pendiente
      const sqlAmortizacion = await client.query(
        `SELECT * FROM amortizacion WHERE prestamo_id = $1 AND estado = 'EN REVISION' and is_active = true`,
        [prestamo.id],
      );

      if (sqlAmortizacion.rows.length > 0) {
        throw CustomError.badRequest(
          "Ya existe una solicitud de amortización pendiente para este préstamo.",
        );
      }

      //? verificamos que el prestamo no tenga un refinanciamiento pendiente
      const sqlRefinanciamiento = await client.query(
        `SELECT * FROM refinanciamiento WHERE prestamo_origen_id = $1 AND estado = 'EN REVISION' and is_active = true`,
        [prestamo.id],
      );

      if (sqlRefinanciamiento.rows.length > 0) {
        throw CustomError.badRequest(
          "Ya existe una solicitud de refinanciamiento pendiente para este préstamo.",
        );
      }

      //? verificamos que el monto a amortizar no supere el saldo actual
      const saldoActual = new Decimal(prestamo.saldo_actual);
      const montoAmortizarDecimal = new Decimal(montoAmortizar);

      if (montoAmortizarDecimal.greaterThan(saldoActual)) {
        throw CustomError.badRequest(
          "El monto a amortizar no puede superar el saldo actual del préstamo.",
        );
      }

      //*GUARDAR EL COMPROBANTE
      let urlImage: string | null = null;
      if (file) {
        urlImage = file
          ? await this.storageService.uploadFile(file, "comprobantes")
          : null;
      } else {
        urlImage = null;
      }

      //? insertamos la solicitud de amortizacion
      await client.query(
        `INSERT INTO amortizacion (prestamo_id, monto, saldo_original, nuevo_saldo, comprobante) VALUES ($1, $2, $3, $4, $5)`,
        [
          prestamo.id,
          montoAmortizarDecimal.toFixed(2),
          saldoActual.toFixed(2),
          saldoActual.minus(montoAmortizarDecimal).toFixed(2),
          urlImage,
        ],
      );

      //? actualizamos estado del prestamo
      await client.query(
        `UPDATE prestamo SET estado_soli = 'AMORTIZACION', updated_at = NOW() WHERE id = $1`,
        [prestamo.id],
      );

      await client.query("COMMIT");

      console.log(
        `Solicitud de amortizacion insertada en fecha ${new Date()} - codigo: ${prestamo.codigo}`,
      );

      response = {
        message: "Solicitud de amortización enviada con exito",
        status: "ok",
        prestamo,
        montoAmortizar,
        codPrestamo,
        socioId,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    } finally {
      client.release();
    }

    //ENVIO DE CORREO DE CONFIRMACION
    const sqlPrestamoEmail = await this.pool.query(
      `SELECT s.nom_completo FROM prestamo p inner join socio s on p.socio_id = s.id WHERE p.codigo = $1`,
      [codPrestamo],
    );

    const nombreSocio = sqlPrestamoEmail.rows[0].nom_completo;

    try {
      //? obtenemos datos del socio para enviar el correo
      console.log(
        `Enviando correo de solicitud de amortizacion... ${codPrestamo}`,
      );
      await emailService.enviarSolicitudAmortizacion(
        nombreSocio,
        codPrestamo,
        montoAmortizar,
      );
      response.messageEmail +=
        " Se envió correo de solicitud al administrador.";
    } catch (error) {
      console.error("Error al enviar correo:", error);
      response.messageEmail +=
        " No se pudo enviar el correo de solicitud de amortizacion.";
    }

    return response;
  }

  //* OBTENER PRESTAMO ACTUAL VIGENTE
  public async getPrestamo(socioId: number) {
    const client = await this.pool.connect();

    try {
      const sqlPrestamo = await client.query(
        `SELECT * FROM prestamo WHERE socio_id = $1 AND is_active = true order by id desc limit 1`,
        [socioId],
      );
      const prestamo = sqlPrestamo.rows[0];

      if (!prestamo) {
        throw CustomError.badRequest(
          "No se encontró ningún préstamo activo para este socio.",
        );
      }

      //todo: obtener las cuotas y movimientos par los socios
      // const sqlCuotas = await client.query(
      //   `SELECT * FROM movimiento_prestamo WHERE prestamo_id = $1 ORDER BY nro_cuota ASC`,
      //   [prestamo.id],
      // );
      // const cuotas = sqlCuotas.rows;

      return {
        message: "Prestamos del socio",
        status: "ok",
        prestamo,
        cuotas: [],
        movimientos: [],
      };
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    } finally {
      client.release();
    }
  }
}
