import { CustomError } from "../../domain";
import { PostgresDatabase } from "../../data";
import { Pool } from "pg";
import { bcryptAdapter, envs, UuidAdapter } from "../../config";
import { StorageService } from "./storage.service";
import { LocalStorageAdapter } from "../../adapters/local-storage.adapter";
const RRHH_API_URL = envs.RRHH_API_URL;
export class AhorroService {
  private readonly pool: Pool;
  private readonly storageService: StorageService;
  // ID
  constructor() {
    this.pool = PostgresDatabase.getPool();
    this.storageService = new StorageService(new LocalStorageAdapter());
  }

  // cargar ahorros por lote
  public async uploadAhorro(rows: any[], periodo: string, fecha: string) {
    const fechaAsiento = new Date(`${fecha}T12:00:00`);

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      // obtenemos cuentas que intervendran en el detalle asiento banco y cuentas por PAGAR socios
      const sqlCuentaContable = await client.query(
        `SELECT cc.id
       FROM unnest(ARRAY[$1, $2]) 
       WITH ORDINALITY AS orden(codigo, seq)
       INNER JOIN cuenta_contable cc 
         ON cc.codigo = orden.codigo
       ORDER BY orden.seq`,
        ["111001", "212001"],
      );
      const cuentaBancoId = sqlCuentaContable.rows[0].id;
      const cuentaPagarId = sqlCuentaContable.rows[1].id;
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

        //validamos que el socio no sea nulo y que el monto sea mayor a cero
        if (cod_socio === "SOC-null" || monto <= 0) {
          throw CustomError.badRequest(
            "Existe un registro que no tiene datos (num_emp o monto)",
          );
        }

        //obtenemos datos del socio y de su cuenta de ahorros para verificar que esten activas
        const sqlSocio = await client.query(
          `SELECT s.id as socio_id, c.id as ahorro_id, ca.id as cuenta_aux_socio
           FROM socio s 
           INNER JOIN cuenta_ahorro c ON s.id = c.socio_id 
           inner join cuenta_auxiliar ca on c.id = ca.referencia_id 
           WHERE s.cod_socio = $1 and s.is_active = $2 and c.is_active = $3 and ca.referencia_tabla = $4 `,
          [cod_socio, true, true, "cuenta_ahorro"],
        );
        if (sqlSocio.rows.length === 0) {
          throw CustomError.badRequest(
            `El socio con el numero de empleado ${cod_socio} no existe o fue dado de baja. Retirelo de la lista Excel e intente nuevamente`,
          );
        }

        const { socio_id, ahorro_id, cuenta_aux_socio } = sqlSocio.rows[0];
        console.log({ ahorro_id }, { socio_id });

        //verificar que no se registren dos en la misma fecha
        const existe = await client.query(
          `SELECT 1
           FROM movimiento_ahorro
           WHERE ahorro_id = $1
             AND created_at >= CURRENT_DATE
             AND created_at < CURRENT_DATE + INTERVAL '1 day'
           LIMIT 1
           `,
          [ahorro_id],
        );

        if (existe.rows.length > 0) {
          throw CustomError.badRequest(
            "Ya se realizó el registro de depósitos de ahorros en la fecha actual.",
          );
        }
        // insertamos datos del moviento de la cuenta de ahorro
        const insertAhorro = await client.query(
          `INSERT INTO movimiento_ahorro( ahorro_id, tipo_operacion, monto, fecha, sentido, periodo )
         VALUES( $1, $2, $3, $4, $5, $6 )`,
          [
            ahorro_id,
            "DESCUENTO PLANILLA",
            monto,
            fechaAsiento,
            "AUMENTA",
            periodo,
          ],
        );

        //actualizamos saldo de cuenta de ahorro
        const updateAhorro = await client.query(
          `UPDATE cuenta_ahorro SET saldo_actual = (saldo_actual + $1), updated_at = NOW() where id = $2`,
          [monto, ahorro_id],
        );

        //--PARTE CONTABLE
        const insertAsiento = await client.query(
          `INSERT INTO asiento_contable ( fecha, glosa, referencia ) VALUES( $1, $2, $3 ) RETURNING id`,
          [
            fechaAsiento,
            `Ahorro ordinario descontado por planilla - Socio ${cod_socio} - en fecha ${fechaAsiento.toLocaleDateString("es-ES")}`,
            `AHORRO - Importacion Excel`,
          ],
        );

        const asiento_id = insertAsiento.rows[0].id;

        // insertar datos a detalle asiento
        // para el debe el ahorro ingresa al banco
        const insertDetAsientoDebe = await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [asiento_id, cuentaBancoId, cuentaAuxBanco, monto, 0],
        );
        // para el haber el cuentas por cobrar aumenta el haber
        const insertDetAsientoHaber = await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [asiento_id, cuentaPagarId, cuenta_aux_socio, 0, monto],
        );
      }

      await client.query("COMMIT");
      return {
        message: "Ahorros registrados con exito.",
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

  //* cargar ahorro INDIVIDUAL

  public async uploadAhorroIndividual(
    codCtaAhorro: string,
    monto: number,
    file?: Express.Multer.File,
  ) {
    console.log("carga de ahorro individual");
    console.log({ codCtaAhorro, monto });
    const fechaActual = new Date();

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      // obtenemos cuentas que intervendran en el detalle asiento banco y cuentas por cobrar socios
      const sqlCuentaContable = await client.query(
        `SELECT cc.id
       FROM unnest(ARRAY[$1, $2]) 
       WITH ORDINALITY AS orden(codigo, seq)
       INNER JOIN cuenta_contable cc 
         ON cc.codigo = orden.codigo
       ORDER BY orden.seq`,
        ["111001", "212001"],
      );
      const cuentaBancoId = sqlCuentaContable.rows[0].id;
      const cuentaPagarId = sqlCuentaContable.rows[1].id;
      // ontenemos id de la cuenta auxiliar para el banco
      const sqlCuentaAuxBanco = await client.query(
        `select ca.id , cb.id as cuenta_bancaria_id
         from cuenta_bancaria cb 
         inner join cuenta_auxiliar ca on cb.id = ca.referencia_id 
         where ca.referencia_tabla = $1 and cb.is_active = $2`,
        ["cuenta_bancaria", true],
      );

      const cuentaAuxBanco = sqlCuentaAuxBanco.rows[0].id;
      const cuentaBancariaId = sqlCuentaAuxBanco.rows[0].cuenta_bancaria_id;

      //validamos que el socio no sea nulo y que el monto sea mayor a cero
      if (codCtaAhorro === "null" || monto < 50) {
        throw CustomError.badRequest(
          "El monto minimo es de Bs. 50, por favor intente nuevamente",
        );
      }

      //obtenemos datos del socio y de su cuenta de ahorros para verificar que esten activas
      const sqlSocio = await client.query(
        `SELECT s.id as socio_id, c.id as ahorro_id, ca.id as cuenta_aux_socio
           FROM socio s 
           INNER JOIN cuenta_ahorro c ON s.id = c.socio_id 
           inner join cuenta_auxiliar ca on c.id = ca.referencia_id 
           WHERE c.codigo = $1 and s.is_active = $2 and c.is_active = $3 and ca.referencia_tabla = $4`,
        [codCtaAhorro, true, true, "cuenta_ahorro"],
      );
      if (sqlSocio.rows.length === 0) {
        throw CustomError.badRequest(
          `La cuenta de ahorro con el codigo ${codCtaAhorro} no existe o fue dado de baja.`,
        );
      }

      const { socio_id, ahorro_id, cuenta_aux_socio } = sqlSocio.rows[0];
      console.log({ ahorro_id }, { socio_id });

      //  insertamos datos del moviento de la cuenta de ahorro
      const insertAhorro = await client.query(
        `INSERT INTO movimiento_ahorro( ahorro_id, tipo_operacion, monto, fecha, sentido, descripcion )
         VALUES( $1, $2, $3, NOW(),$4, $5 )`,
        [
          ahorro_id,
          "TRANSFERENCIA BANCARIA",
          monto,
          "AUMENTA",
          "Deposito de ahorro mediante transferencia bancaria",
        ],
      );

      //actualizamos saldo de cuenta de ahorro
      const updateAhorro = await client.query(
        `UPDATE cuenta_ahorro SET saldo_actual = (saldo_actual + $1), updated_at = NOW() where id = $2`,
        [monto, ahorro_id],
      );

      //*--PARTE CONTABLE
      const insertAsiento = await client.query(
        `INSERT INTO asiento_contable ( fecha, glosa, referencia, cuenta_bancaria_id ) VALUES( $1, $2, $3, $4 ) RETURNING id`,
        [
          fechaActual,
          `Ahorro extraordinario mediante transferencia bancaria - Cuenta Ahorro ${codCtaAhorro} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
          `AHORRO - deposito extraordinario`,
          cuentaBancariaId,
        ],
      );

      const asiento_id = insertAsiento.rows[0].id;

      // insertar datos a detalle asiento
      // para el debe el ahorro ingresa al banco
      const insertDetAsientoDebe = await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [asiento_id, cuentaBancoId, cuentaAuxBanco, monto, 0],
      );
      // para el haber el cuentas por cobrar aumenta el haber
      const insertDetAsientoHaber = await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [asiento_id, cuentaPagarId, cuenta_aux_socio, 0, monto],
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
      // console.log(`Comprobante name is: ${urlImage}`);

      await client.query(
        `
        INSERT INTO movimiento_bancario(cuenta_bancaria_id, asiento_contable_id,fecha, monto, tipo_operacion, categoria, comprobante, detalle, sentido) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          cuentaBancariaId,
          asiento_id,
          fechaActual,
          monto,
          "DEPOSITO",
          "AHORRO",
          urlImage,
          `Depósito mediante transferencia bancaria a Cuenta Ahorro ${codCtaAhorro}`,
          "AUMENTA",
        ],
      );

      await client.query("COMMIT");
      return {
        message: "Ahorro registrado con exito.",
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

  //* para retirar cerrar cuenta
  public async retiroAhorro(
    codCtaAhorro: string,
    monto: number,
    file?: Express.Multer.File,
  ) {
    // validamos datos
    if (codCtaAhorro === "null" || monto <= 0) {
      throw CustomError.badRequest(
        "Existe un error en los datos proporcionados por favor asegurese que el monto sea mayor a 0",
      );
    }

    const fechaActual = new Date();

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // obtenemos cuentas que intervendran en el detalle asiento banco y cuentas por cobrar socios
      const sqlCuentaContable = await client.query(
        `SELECT cc.id
       FROM unnest(ARRAY[$1, $2]) 
       WITH ORDINALITY AS orden(codigo, seq)
       INNER JOIN cuenta_contable cc 
         ON cc.codigo = orden.codigo
       ORDER BY orden.seq`,
        ["111001", "212001"],
      );
      const cuentaBancoId = sqlCuentaContable.rows[0].id;
      const cuentaPagarId = sqlCuentaContable.rows[1].id;
      // ontenemos id de la cuenta auxiliar para el banco
      const sqlCuentaAuxBanco = await client.query(
        `select ca.id , cb.id as cuenta_bancaria_id
         from cuenta_bancaria cb 
         inner join cuenta_auxiliar ca on cb.id = ca.referencia_id 
         where ca.referencia_tabla = $1 and cb.is_active = $2`,
        ["cuenta_bancaria", true],
      );
      const cuentaAuxBanco = sqlCuentaAuxBanco.rows[0].id;
      const cuentaBancariaId = sqlCuentaAuxBanco.rows[0].cuenta_bancaria_id;

      //obtenemos datos del socio y de su cuenta de ahorros para verificar que esten activas
      const sqlSocio = await client.query(
        `SELECT s.id as socio_id, c.id as ahorro_id, ca.id as cuenta_aux_socio, c.saldo_actual
           FROM socio s 
           INNER JOIN cuenta_ahorro c ON s.id = c.socio_id 
           inner join cuenta_auxiliar ca on c.id = ca.referencia_id 
           WHERE c.codigo = $1 and s.is_active = $2 and c.is_active = $3 and ca.referencia_tabla = $4`,
        [codCtaAhorro, true, true, "cuenta_ahorro"],
      );
      if (sqlSocio.rows.length === 0) {
        throw CustomError.badRequest(
          `La cuenta de ahorro ${codCtaAhorro} o es socio no estan activos`,
        );
      }

      const { socio_id, ahorro_id, cuenta_aux_socio, saldo_actual } =
        sqlSocio.rows[0];

      //verificamos que el monto a retiraar no supere el saldo_actrual
      if (monto > saldo_actual) {
        throw CustomError.badRequest(
          `El monto a retirar supera el saldo actual por favor revise e intente nuevamente`,
        );
      }
      //console.log({ ahorro_id }, { socio_id });

      //  insertamos datos del moviento de la cuenta de ahorro
      const insertAhorro = await client.query(
        `INSERT INTO movimiento_ahorro( ahorro_id, tipo_operacion, monto, fecha, sentido, descripcion )
         VALUES( $1, $2, $3, NOW(),$4, $5 )`,
        [
          ahorro_id,
          "RETIRO",
          monto,
          "DISMINUYE",
          "Retiro de ahorro mediante transferencia bancaria",
        ],
      );

      //actualizamos saldo de cuenta de ahorro

      const updateAhorro = await client.query(
        `UPDATE cuenta_ahorro SET saldo_actual = (saldo_actual - $1), updated_at = NOW() where id = $2 RETURNING saldo_actual`,
        [monto, ahorro_id],
      );

      const newSaldoActual = updateAhorro.rows[0].saldo_actual;

      //--PARTE CONTABLE
      const insertAsiento = await client.query(
        `INSERT INTO asiento_contable ( fecha, glosa, referencia, cuenta_bancaria_id ) VALUES( $1, $2, $3, $4) RETURNING id`,
        [
          fechaActual,
          `Retiro de ahorro ordinario - Cuenta Ahorro ${codCtaAhorro} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
          `AHORRO - retiro`,
          cuentaBancariaId,
        ],
      );

      const asiento_id = insertAsiento.rows[0].id;

      // insertar datos a detalle asiento
      // para el haber el ahorro sale al banco
      const insertDetAsientoHaber = await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [asiento_id, cuentaBancoId, cuentaAuxBanco, 0, monto],
      );
      // para el debe cuentas por cobrar aumenta el debe
      const insertDetAsientoDebe = await client.query(
        `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
        [asiento_id, cuentaPagarId, cuenta_aux_socio, monto, 0],
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
          monto,
          "RETIRO",
          "AHORRO",
          urlImage,
          `Retiro de ahorro mediante transferencia bancaria de Cuenta Ahorro ${codCtaAhorro}`,
          "DISMINUYE",
        ],
      );

      await client.query("COMMIT");
      return {
        message: "Ahorro retirado con exito.",
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

  //* crea nueva cuenta de ahorro
  public async newCount(num_emp: number) {
    // consultamos en server rrhh al empleado
    const response = await fetch(
      `${RRHH_API_URL}/export_personal_data_single_cooperativa.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ num_emp }),
      },
    );

    if (!response.ok) {
      console.log(response);
      throw CustomError.badRequest(
        `Error al intentar obtener informacion del empleado, intente nuevamente.`,
      );
    }

    const data = await response.json();
    if (!data.data) {
      throw CustomError.badRequest(
        "El numero de empleado fue dado de baja o no existe.",
      );
    }

    const client = await this.pool.connect();

    // consultamos si el socio ya esta registrado
    const codSocio = "SOC-" + num_emp;
    const resultSocio = await client.query(
      ` select nom_completo from socio where cod_socio = $1`,
      [codSocio],
    );
    if (resultSocio.rows.length > 0) {
      throw CustomError.badRequest(
        `El empleado ${resultSocio.rows[0].nom_completo} ya es socio de la cooperativa.`,
      );
    }

    try {
      await client.query("BEGIN");
      const sqlInsert = await client.query(
        `INSERT INTO socio ( cod_socio, planta_id, nom_completo, ci, extencion_ci, num_referencia, foto, is_active, celular,
                   direccion, cuenta_bancaria, sexo, fecha_naci )
                   VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
        [
          codSocio,
          data.data.planta_id,
          data.data.nom_completo,
          data.data.ci,
          data.data.extencion_ci ?? "-",
          data.data.num_referencia,
          data.data.foto,
          true,
          data.data.celular,
          data.data.direccion,
          data.data.nro_cuenta,
          data.data.sexo,
          data.data.fecha_naci,
        ],
      );
      const socioId = sqlInsert.rows[0].id;

      const password = bcryptAdapter.hash(data.data.ci);

      const sqlinsertUser = await client.query(
        `INSERT INTO usuario ( user_name, pass_hash, socio_id ) 
                VALUES( $1, $2, $3 )`,
        [data.data.user_name, password, socioId],
      );

      // obtenemos id de la cuota de ahorro
      const sqlCuotaAhorro = await client.query(
        `SELECT id FROM cuota_ahorro WHERE is_active = true`,
      );
      const cuotaAhorroId = sqlCuotaAhorro.rows[0].id;

      //* insertamos la nueva cuenta de ahorro
      const sqlInsertCtaAhorro = await client.query(
        `INSERT INTO cuenta_ahorro ( socio_id, numero_cuenta, fecha_operacion, codigo )
        values($1, $2, CURRENT_DATE, $3) RETURNING id `,
        [socioId, num_emp, `CTA-AHO-${num_emp}`],
      );
      const cuentaAhorroId = sqlInsertCtaAhorro.rows[0].id;

      //registramos la cuenta de ahorro y la cuota de ahorro vigente
      await client.query(
        `INSERT INTO cuota_cuenta_ahorro (cuota_ahorro_id, cuenta_ahorro_id) values($1, $2)`,
        [cuotaAhorroId, cuentaAhorroId],
      );
      // registramos la nueva cuenta en cuentas auxiliares para conta
      const insertCuentaExtra = await client.query(
        `INSERT INTO cuenta_auxiliar ( referencia_id, referencia_tabla, referencia_cod )
        VALUES( $1, $2, $3 )`,
        [cuentaAhorroId, "cuenta_ahorro", `CTA-AHO-${num_emp}`],
      );

      await client.query("COMMIT");
      return {
        message: "Cuenta creada exitosamente.!",
        status: "ok",
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

  // envia lista de socios y sus cuentas de ahorro
  public async getCuentasAhorro() {
    try {
      const result = await this.pool.query(
        `select s.id as socio_id, s.cod_socio ,s.nom_completo ,ca.id as cuenta_ahorro_id ,ca.codigo ,ca.estado ,ca.fecha_operacion ,ca.saldo_actual ,ca.saldo_inicial 
         from socio s
         inner join cuenta_ahorro ca on s.id = ca.socio_id `,
      );
      return {
        status: "ok",
        message: "lista de socios y cuentas de ahorro",
        cuentasAhorro: result.rows,
      };
    } catch (error) {
      console.log({ error });
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  // obtiene lista de movimientos de una CUENTA en especifico

  public async getMovimientosBySocio(
    codCuenta: string,
    rol: string,
    socioId: number,
  ) {
    try {
      //SEGURIDAD PARA QUE EN CASO DE SOLICITAR LOS MOVIMIENTOS SOLO SE LE MUESTRE SI LA CUENTA PERTENECE AL SOCIO
      let cuentaAhorroId = "";
      if (rol === "SOC-NORMAL") {
        const verifySoc = await this.pool.query(
          `select id from cuenta_ahorro where socio_id = $1 and codigo = $2`,
          [socioId, codCuenta],
        );
        cuentaAhorroId = verifySoc.rows[0].id;
        if (verifySoc.rows.length === 0) {
          throw CustomError.badRequest("Error la cuenta no le pertenece");
        }
      } else {
        const verifyCuenta = await this.pool.query(
          `select id from cuenta_ahorro where codigo = $1`,
          [codCuenta],
        );
        cuentaAhorroId = verifyCuenta.rows[0].id;
        if (verifyCuenta.rows.length === 0) {
          throw CustomError.badRequest("Error la cuenta no existe");
        }
      }

      // const result = await this.pool.query(
      //   `select
      //     ma.id as movimiento_id,
      //       ca.codigo,
      //       ca.numero_cuenta,
      //       ma.fecha,
      //       ma.tipo_operacion,
      //       ma.monto,
      //       ma.motivo,
      //       SUM(
      //         CASE
      //           WHEN ma.sentido = 'AUMENTA' THEN ma.monto
      //           WHEN ma.sentido = 'DISMINUYE' THEN -ma.monto
      //         END
      //       ) OVER (
      //         ORDER BY ma.fecha, ma.id
      //       ) AS saldo
      //     FROM cuenta_ahorro ca
      //     INNER JOIN movimiento_ahorro ma
      //       ON ca.id = ma.ahorro_id
      //     WHERE ca.codigo = $1
      //     ORDER BY ma.fecha, ma.id`,
      //   [codCuenta],
      // );

      const result = await this.pool.query(
        `
        SELECT
           fecha,
           created_at,
           descripcion,
           tipo_operacion,
           periodo,
       
           -- INGRESO: aumenta los ahorros del socio
           CASE
               WHEN sentido = 'AUMENTA' THEN monto
               ELSE NULL
           END AS ingreso,
       
           -- RETIRO: disminuye los ahorros del socio
           CASE
               WHEN sentido = 'DISMINUYE' THEN monto
               ELSE NULL
           END AS retiro,
       
           -- SALDO ACUMULADO DEL AHORRO
           SUM(
               CASE
                   WHEN sentido = 'AUMENTA' THEN monto
                   WHEN sentido = 'DISMINUYE' THEN -monto
                   ELSE 0
               END
           ) OVER (
               PARTITION BY ahorro_id
               ORDER BY fecha ASC, id ASC
               ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
           ) AS saldo_ahorro
       
       FROM movimiento_ahorro
       
       WHERE ahorro_id = $1
       
       ORDER BY fecha ASC, id ASC;
        `,
        [cuentaAhorroId],
      );
      // si es socio normal
      if (rol === "SOC-NORMAL") {
        return {
          status: "ok",
          message: "Movimientos de la cuenta de ahorro ",
          movimientos: result.rows,
        };
      }
      // si es el admin
      const ctaAhorroSql = await this.pool.query(
        `select s.nom_completo , s.foto , ca.*
         from cuenta_ahorro ca 
         inner join socio s on ca.socio_id = s.id
         where ca.codigo = $1
         `,
        [codCuenta],
      );

      return {
        status: "ok",
        message: "Movimientos de la cuenta de ahorro ",
        ctaAhorro: ctaAhorroSql.rows[0] ?? null,
        movimientos: result.rows,
      };
    } catch (error) {
      console.log({ error });
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async getSaldoByCodSocio(codSocio: string) {
    try {
      const result = await this.pool.query(
        `select s.id as socio_id, s.cod_socio ,ca.codigo ,ca.estado ,ca.saldo_actual 
         from socio s
         inner join cuenta_ahorro ca on s.id = ca.socio_id 
         where s.cod_socio = $1`,
        [codSocio],
      );
      if (result.rows.length === 0) {
        throw CustomError.badRequest(
          "El socio no tiene cuenta de ahorro o fue dado de baja",
        );
      }
      return {
        status: "ok",
        message: "Saldo y codigo de ahorro del socio",
        ctaAhorro: result.rows[0],
      };
    } catch (error) {
      console.log({ error });
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }
}
