import { Pool } from "pg";
import { CustomError } from "../../domain";
import { PostgresDatabase } from "../../data";
import { bcryptAdapter, envs } from "../../config";
import { listenerCount } from "process";

const RRHH_API_URL = envs.RRHH_API_URL;

interface SociosFromExcel {
  nombre: string;
  ci: string;
  numCuenta: string;
  totalAporte: string;
}

export interface PrestamosFromExcel {
  nombre: string;
  ci: string;
  cuotas: Cuota[];
  total: string;
}
export interface Cuota {
  nro: number;
  monto: string;
  mes: string;
  anio: string;
}

export class MigrationService {
  private readonly pool: Pool;
  // ID
  constructor() {
    this.pool = PostgresDatabase.getPool();
  }

  public async cargaSocios(sociosList: SociosFromExcel[]) {
    const fechaActual = new Date();
    // consultamos en server rrhh al empleado
    const client = await this.pool.connect();

    //?suma el total de los ahorros
    const sumaTotalAhorros = Number(
      sociosList
        .reduce((acc, item) => acc + Number(item.totalAporte || 0), 0)
        .toFixed(2),
    );

    //* obtnemos datos generales de las cuentas contables, cuentas auxiliares y cuenta bancaria de la cooperativa
    // obtenemos cuentas que intervendran en el detalle asiento banco y ahorros por pagar socios
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

    await client.query("BEGIN");

    try {
      //recorremos la lista de socios socioslist
      for (const socio of sociosList) {
        const ci = String(socio.ci);

        const response = await fetch(
          `${RRHH_API_URL}/export_personal_data_single_cooperativa_by_ci.php`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ci }),
          },
        );

        if (!response.ok) {
          console.log(
            `Error al intentar obtener informacion del empleado, intente nuevamente. ${ci}`,
          );
          console.log(response);
          continue;
        }

        const data = await response.json();
        if (!data.data) {
          console.log(
            `Error al intentar obtener informacion del empleado, intente nuevamente. ${ci}`,
          );
          continue;
        }

        const num_emp = data.data.num_emp;
        // consultamos si el socio ya esta registrado
        const codSocio = "SOC-" + num_emp;
        const resultSocio = await client.query(
          ` select nom_completo from socio where cod_socio = $1`,
          [codSocio],
        );
        if (resultSocio.rows.length > 0) {
          console.log(
            `El empleado ${resultSocio.rows[0].ci} ya es socio de la cooperativa.`,
          );
          continue;
        }

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
        values($1, $2, CURRENT_DATE, $3) RETURNING id, codigo `,
          [socioId, num_emp, `CTA-AHO-${num_emp}`],
        );
        const cuentaAhorroId = sqlInsertCtaAhorro.rows[0].id;
        const cuentaAhorroCodigo = sqlInsertCtaAhorro.rows[0].codigo;

        //registramos la cuenta de ahorro y la cuota de ahorro vigente
        await client.query(
          `INSERT INTO cuota_cuenta_ahorro (cuota_ahorro_id, cuenta_ahorro_id) values($1, $2)`,
          [cuotaAhorroId, cuentaAhorroId],
        );
        // registramos la nueva cuenta en cuentas auxiliares para conta
        const insertCuentaExtra = await client.query(
          `INSERT INTO cuenta_auxiliar ( referencia_id, referencia_tabla, referencia_cod )
        VALUES( $1, $2, $3 ) RETURNING id`,
          [cuentaAhorroId, "cuenta_ahorro", `CTA-AHO-${num_emp}`],
        );

        const cuentaAuxAhorroSocio = insertCuentaExtra.rows[0].id;

        //* insertamo sus ahorros en movimientos ahorros y la parte contable

        const sqlMovimientoAhorro = await client.query(
          `INSERT INTO movimiento_ahorro ( ahorro_id,tipo_operacion, monto, sentido, descripcion )
          values ( $1, $2, $3, $4, $5 )`,
          [
            cuentaAhorroId,
            "SALDO INICIAL",
            +socio.totalAporte,
            "AUMENTA",
            "Saldo al 31 de Agosto de 2026",
          ],
        );
        //* actualizamos saldo en cuenta_ahorro
        await client.query(
          `UPDATE cuenta_ahorro SET saldo_actual = $1 WHERE id = $2`,
          [+socio.totalAporte, cuentaAhorroId],
        );

        //* PARTE CONTABLE

        const insertAsiento = await client.query(
          `INSERT INTO asiento_contable (  glosa, referencia, cuenta_bancaria_id ) VALUES( $1, $2, $3 ) RETURNING id`,
          [
            `Saldo al 31 de Agosto de 2026 - Cuenta Ahorro ${cuentaAhorroCodigo} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
            `AHORRO - Saldo Inicial`,
            cuentaBancariaId,
          ],
        );

        const asiento_id = insertAsiento.rows[0].id;

        // insertar datos a detalle asiento
        // para el debe el ahorro ingresa al banco
        const insertDetAsientoDebe = await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [asiento_id, cuentaBancoId, cuentaAuxBanco, +socio.totalAporte, 0],
        );
        // para el haber el cuentas por cobrar aumenta el haber
        const insertDetAsientoHaber = await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [
            asiento_id,
            cuentaPagarId,
            cuentaAuxAhorroSocio,
            0,
            +socio.totalAporte,
          ],
        );
      }

      //* sumar todos los introducidos y luego insertar como uno solo en movimiento bancario
      const insertMovimientoBancario = await client.query(
        `INSERT INTO movimiento_bancario(cuenta_bancaria_id,fecha, monto, tipo_operacion, categoria, comprobante, detalle, sentido) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          cuentaBancariaId,
          fechaActual,
          +sumaTotalAhorros,
          "DEPOSITO",
          "AHORRO",
          "",
          `Saldo Ahorros de Socios a 31 de Agosto de 2026 `,
          "AUMENTA",
        ],
      );
      await client.query("COMMIT");
      return {
        message: "Cuentas creadas exitosamente.!",
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

  public async cargarPrestamos(prestamosList: PrestamosFromExcel[]) {
    // return { prestamosList };

    const fechaActual = new Date();
    const client = await this.pool.connect();

    //* obtenemos las cuentas para la parte contable
    // banco y cuentas por cobrar socios
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
      `select ca.id , cb.id as cuenta_bancaria_id
         from cuenta_bancaria cb 
         inner join cuenta_auxiliar ca on cb.id = ca.referencia_id 
         where ca.referencia_tabla = $1 and cb.is_active = $2`,
      ["cuenta_bancaria", true],
    );

    const cuentaAuxBanco = sqlCuentaAuxBanco.rows[0].id;
    const cuentaBancariaId = sqlCuentaAuxBanco.rows[0].cuenta_bancaria_id;

    await client.query("BEGIN");

    try {
      for (const prestamo of prestamosList) {
        const ci = String(prestamo.ci);
        const sqlSocio = await client.query(
          `SELECT id, cod_socio FROM socio WHERE ci = $1`,
          [ci],
        );
        if (sqlSocio.rows.length === 0) {
          console.log(
            `No se encontró un socio con CI ${ci} para el préstamo de ${prestamo.nombre}.`,
          );
          continue;
        }
        const socioId = sqlSocio.rows[0].id;
        const socioCod = sqlSocio.rows[0].cod_socio;
        const numEmp = socioCod.replace("SOC-", "");
        const totalPrestamo = prestamo.total;
        const numCuotas = prestamo.cuotas.length;
        const codPrestamo = `PRE-1-${numEmp}`;

        // Insertar el préstamo
        const sqlInsertPrestamo = await client.query(
          `INSERT INTO prestamo ( socio_id, monto_otorgado, monto_solicitado, num_cuotas, fecha_solicitud, fecha_otorgado, cuota_mensual, ultima_cuota, estado , saldo_actual, codigo, estado_soli) 
           VALUES ( $1, $2, $3, $4, CURRENT_DATE , CURRENT_DATE , $5, $6, $7, $8, $9, $10 ) RETURNING id`,
          [
            socioId,
            totalPrestamo,
            totalPrestamo,
            numCuotas,
            prestamo.cuotas[0].monto,
            prestamo.cuotas[numCuotas - 1].monto,
            "APROBADO",
            totalPrestamo,
            codPrestamo,
            "SIN SOLICITUD",
          ],
        );
        const prestamoId = sqlInsertPrestamo.rows[0].id;
        //Insertar en movimiento prestamo para registrar el monto otorgado con el tipo movimiento DESEMBOLSO
        await client.query(
          `INSERT INTO movimiento_prestamo ( prestamo_id,  monto, tipo_movimiento, sentido, descripcion) VALUES ( $1, $2, $3, $4, $5 )`,
          [
            prestamoId,
            +totalPrestamo,
            "SALDO INICIAL",
            "AUMENTA",
            "Saldo pendiente al 31 de Agosto de 2026",
          ],
        );

        // ligamos con cuenta auxiliar
        const insertCuentaAux = await client.query(
          `INSERT INTO cuenta_auxiliar (referencia_id, referencia_tabla, referencia_cod)
          VALUES ($1, $2, $3) RETURNING id`,
          [prestamoId, "prestamo", codPrestamo],
        );
        const cuentaAuxPrestamo = insertCuentaAux.rows[0].id;

        // Insertar las cuotas del préstamo
        for (const cuota of prestamo.cuotas) {
          await client.query(
            `INSERT INTO cuota_prestamo (prestamo_id, num_cuota, monto, mes, anio)
        VALUES ($1, $2, $3, $4, $5)`,
            [prestamoId, cuota.nro, cuota.monto, cuota.mes, cuota.anio],
          );
        }

        //*parte contable
        const insertAsiento = await client.query(
          `INSERT INTO asiento_contable ( fecha, glosa, referencia, cuenta_bancaria_id ) VALUES( $1, $2, $3, $4 ) RETURNING id`,
          [
            fechaActual,
            `Préstamo saldo a 31 de Agosto - Prestamo ${codPrestamo} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
            `PRESTAMO - saldo inicial`,
            cuentaBancariaId,
          ],
        );

        const asiento_id = insertAsiento.rows[0].id;

        // insertar datos a detalle asiento
        // para el debe cuentas por cobrar +
        const insertDetAsientoDebe = await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [asiento_id, cuentaCobrarId, cuentaAuxPrestamo, totalPrestamo, 0],
        );
        // para el haber el banco -
        const insertDetAsientoHaber = await client.query(
          `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
          [asiento_id, cuentaBancoId, cuentaAuxBanco, 0, totalPrestamo],
        );
      }
      //sumar total de prestamos migrados y luego insertar como uno solo en movimiento bancario
      const sumaTotalPrestamos = prestamosList
        .reduce((acc, item) => acc + Number(item.total || 0), 0)
        .toFixed(2);

      const insertMovimientoBancario = await client.query(
        `INSERT INTO movimiento_bancario(cuenta_bancaria_id,fecha, monto, tipo_operacion, categoria, comprobante, detalle, sentido) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          cuentaBancariaId,
          fechaActual,
          +sumaTotalPrestamos,
          "RETIRO",
          "PRESTAMO",
          "",
          `Saldo Prestamos de Socios a 31 de Agosto de 2026 `,
          "DISMINUYE",
        ],
      );

      await client.query("COMMIT");

      return {
        status: "ok",
        message: "Préstamos migrados exitosamente.!",
        prestamosList,
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

  // funcion para actualizar los usuarios de los socios con su numero de empleado
  public async updateUserSocios() {
    const client = await this.pool.connect();
    try {
      const sqlSocios = await client.query(
        `select id, cod_socio, regexp_replace(cod_socio,'SOC-','')as num_emp from socio  `,
      );
      for (const socio of sqlSocios.rows) {
        const sqlUpdateUser = await client.query(
          `UPDATE usuario SET user_name = $1 WHERE socio_id = $2`,
          [socio.num_emp, socio.id],
        );
      }
      return {
        status: "ok",
        message: "Nombres de usuarios actualizadas exitosamente.!",
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
