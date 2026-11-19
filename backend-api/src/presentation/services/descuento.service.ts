import { CustomError } from "../../domain";
import { PostgresDatabase } from "../../data";
import { Pool } from "pg";
import { buffer } from "stream/consumers";
import { generateExcelFromArray } from "../helpers/excelHelper";

interface DescuentoFromExcel {
  codSocio: string;
  nombre: string;
  montoAhorro: string;
  montoPrestamo: string;
  montoTotal: string;
}

export class DescuentoService {
  private readonly pool: Pool;
  // ID
  constructor() {
    this.pool = PostgresDatabase.getPool();
  }

  //* obtiene informacion del periodo descuento planilla segun anio y mes
  public async getPeriodoDescuentoPlanilla(anio: string, mes: string) {
    // console.log({ anio, mes });
    try {
      //consultamos si existe un descuento plantilla ya generado
      const periodoDescuento = await this.pool.query(
        `SELECT * FROM descuento_planilla WHERE anio = $1 and mes = $2`,
        [anio, mes],
      );
      // casos
      if (periodoDescuento.rows.length === 0) {
        // *caso1 no existe lo creamos DESCEUNTO PLANILLA y regresamos
        // creamos el descuento planilla
        const insertPlanillaDescuento = await this.pool.query(
          `INSERT INTO descuento_planilla (anio, mes) VALUES ($1, $2) RETURNING *`,
          [anio, mes],
        );

        return {
          status: "ok",
          message: "Descuento planilla generado",
          descuentoPlanilla: insertPlanillaDescuento.rows[0],
          listDescuento: [],
        };
      } else {
        //* CASO 2: si existe y no fue generada su lista solo lo regresamos descuento planilla
        const isGenerated = periodoDescuento.rows[0].is_generated;
        if (!isGenerated) {
          return {
            status: "ok",
            message: "Descuento planilla generado",
            descuentoPlanilla: periodoDescuento.rows[0],
            listDescuento: [],
          };
        } else {
          //* CASO 3: si fue generada su lista regresamos la lista completa
          //preparamos la lista para regresar
          const descuentoPlanillaId = periodoDescuento.rows[0].id;

          const listDescuentos =
            await this.getListaDescuentosPlanilla(descuentoPlanillaId);

          return {
            status: "ok",
            message: "Descuento planilla completo",
            descuentoPlanilla: periodoDescuento.rows[0],
            listDescuento: listDescuentos,
          };
        }
      }
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //* para generar la lista de descuentos es decir la tabla => descuento_planilla_socio
  public async generateListDescuento(idDescuentoPlanilla: number) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      //verificamos que el id exista
      const verifyExists = await client.query(
        "SELECT id, mes ,anio FROM descuento_planilla WHERE id = $1",
        [idDescuentoPlanilla],
      );
      if (verifyExists.rows.length === 0) {
        throw CustomError.badRequest("El id de descuento planilla no existe");
      }
      //? CONSULTAR LA TABLA descuento_planilla_socio CON EL idDescuentoPlanilla SI TIENE DATOS...
      //? ELIMINARLOS Y VOLVER A GENERAR LA LISTA POR QUE PUEDE HAVER OCURRIDO QUE UNA VEZ GENERARDO
      //? EL SOCIO SE HAYA RETIRADO Y COMUNICO A TIEMPO AL ADMINISTRADOR ANTES DE QUE ESTE ENVIE A RRHH
      const deletePrevios = await client.query(
        "DELETE FROM descuento_planilla_socio WHERE descuento_planilla_id = $1",
        [idDescuentoPlanilla],
      );

      const mes = verifyExists.rows[0].mes;
      const anio = verifyExists.rows[0].anio;

      //obtenemos lista de socios activos
      const sociosActivos = await client.query(
        "SELECT id, cod_socio FROM socio WHERE is_active = true",
      );

      for (const socio of sociosActivos.rows) {
        const ahorro = await client.query(
          `SELECT cua.monto, ca.id AS cuota_ahorro_id
     FROM cuota_cuenta_ahorro ca
     INNER JOIN cuota_ahorro cua
       ON cua.id = ca.cuota_ahorro_id
     INNER JOIN cuenta_ahorro ca2
       ON ca.cuenta_ahorro_id = ca2.id
     WHERE cua.is_active = true
       AND ca2.socio_id = $1`,
          [socio.id],
        );

        const prestamo = await client.query(
          `SELECT cp.monto, cp.id AS cuota_prestamo_id
     FROM prestamo p
     INNER JOIN cuota_prestamo cp
       ON p.id = cp.prestamo_id
     WHERE p.is_active = true
       AND p.socio_id = $1
       AND cp.is_active = true
       AND cp.is_pay = false
       AND p.nuevo_prestamo = false
     ORDER BY cp.num_cuota
     LIMIT 1`,
          [socio.id],
        );

        await client.query(
          `INSERT INTO descuento_planilla_socio (
       descuento_planilla_id,
       socio_id,
       cod_socio,
       cuota_ahorro_id,
       cuota_prestamo_id
     ) VALUES ($1, $2, $3, $4, $5)`,
          [
            idDescuentoPlanilla,
            socio.id,
            socio.cod_socio,
            ahorro.rows[0]?.cuota_ahorro_id ?? null,
            prestamo.rows[0]?.cuota_prestamo_id ?? null,
          ],
        );
      }

      //? actualizamos descuento_planila como generado
      await client.query(
        "UPDATE descuento_planilla SET is_generated = true WHERE id = $1",
        [idDescuentoPlanilla],
      );

      await client.query("COMMIT");

      return {
        status: "ok",
        message: "lista de descuentos generada correctamente",
        mes,
        anio,
        //idDescuentoPlanilla,
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

  //* generar documento excel de la lista de descuentos
  public async exportExcelDescuentoPlanilla(idDescuentoPlanilla: number) {
    try {
      //? verificamos que exista el id
      const verifyExists = await this.pool.query(
        "SELECT id, mes, anio FROM descuento_planilla WHERE id = $1",
        [idDescuentoPlanilla],
      );
      if (verifyExists.rows.length === 0) {
        throw CustomError.badRequest("El id de descuento planilla no existe");
      }
      const mes = verifyExists.rows[0].mes;
      const anio = verifyExists.rows[0].anio;

      //? obtenemos los datos de la lista de descuentos
      const listDescuentos =
        await this.getListaDescuentosPlanilla(idDescuentoPlanilla);

      //* preparamos el array para los campos del excel

      const dataExcel = listDescuentos.map((descuento) => ({
        "NUMERO EMPLEADO": descuento.num_emp,
        NOMBRE: descuento.socio_nombre,
        "DESCUENTO AHORRO": descuento.monto_ahorro,
        "DESCUENTO PRESTAMO": descuento.monto_prestamo,
        TOTAL: descuento.monto_total,
      }));

      return {
        status: "ok",
        message: "lista de descuentos",
        buffer: await generateExcelFromArray(dataExcel),
        name: `descuento_planilla_${mes}_${anio}`,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //* para cargar datos desde excel y verficar que los descuentos se hayan realizado con exito
  //TODO: ANIADIR LA FOTOGRAFIA DEL COMPROBANTE DE DESCUENTO PLANILLAS
  public async uploadDescuentos(
    idDescuentoPlantilla: number,
    data: DescuentoFromExcel[],
  ) {
    // variables para controlar los escuentos reales
    let totalDescontadoAhorro: number = 0;
    let totalDescontadoPrestamo: number = 0;

    // obtiene la fecha actual
    const fechaActual = new Date();
    const client = await this.pool.connect();

    const sqlDescuentos = await client.query(
      `SELECT dps.id, dps.socio_id, dps.cod_socio,dps.cuota_ahorro_id,dps.cuota_prestamo_id, mes , anio
        FROM descuento_planilla_socio dps
        inner join descuento_planilla dp on dps.descuento_planilla_id = dp.id
        where dp.id = $1
      `,
      [idDescuentoPlantilla],
    );
    if (sqlDescuentos.rows.length === 0) {
      throw CustomError.badRequest(
        "No se encontraron descuentos para la planilla",
      );
    }

    let estadoDescuento = "No Descontado"; //-- estados para controlar el estado del descuento 'Pendiente','Parcial','Descontado','No Descontado'
    let cuotasDescontadas = "Ninguna"; //-- estado para controlar si se descontado ahoro o prestamo o ambos o niguno 'Ninguna','Ahorro','Prestamo','Ambas'

    //* obtenemos las cuentas contables de tabla cuenta_contable
    //?cuentas contables para ahorros y prestamos
    // 111001 > banco
    // 212001 > Ahorros de socios - cuenta ahorro
    // 112001 > Cuentas por cobrar socios
    const sqlCuentaContable = await client.query(
      `SELECT cc.id
       FROM unnest(ARRAY[$1, $2, $3]) 
       WITH ORDINALITY AS orden(codigo, seq)
       INNER JOIN cuenta_contable cc 
         ON cc.codigo = orden.codigo
       ORDER BY orden.seq`,
      ["111001", "212001", "112001"],
    );
    const cuentaContableBancoId = sqlCuentaContable.rows[0].id;
    const cuentaContableAhorroSocioId = sqlCuentaContable.rows[1].id;
    const cuentaContableCtaPorCobrarId = sqlCuentaContable.rows[2].id;

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

    try {
      for (const descuento of sqlDescuentos.rows) {
        let ahorrosOk = 1; //. para controlar que todo saliio bien
        let prestamosOk = 1; // para controlar que todo salio bien
        await client.query("BEGIN");
        //console.log({ descuento });

        // variables para llenar el nuevo estado
        let obs = "";

        // obtenemos codigo del socio de la consulta a la tabla descuento_planilla_socio para verificar con el codigo de escel
        const codSocio = descuento.cod_socio;
        const cuotaAhorroId = descuento.cuota_ahorro_id; //* este id viene de cuota_cuenta_ahorro NO de cuota_ahorro
        const cuotaPrestamoId = descuento.cuota_prestamo_id;

        // buscar descuento del socio en el excel
        const descuentoExcel = data.find(
          (item: any) =>
            String(item.codSocio).trim() === String(codSocio).trim(),
        );

        // console.log({ descuentoExcel });
        //* verificamos si el cod_socio esta en la lista de excel
        if (!descuentoExcel) {
          // si no se encuentran registros modificamos obs y los dems se mantienen
          obs =
            "| Este Socio no tiene registro alguno en el archivo excel cargado!!!. Verifique el estado del empleado en RRHH.";
          //? actualizamos el registro
          await client.query(
            `UPDATE descuento_planilla_socio SET
              obs = $1,
              estado_descuento = $2,
              cuotas_descontadas = $3,
              updated_at = NOW()
              WHERE id = $4`,
            [obs, "No Descontado", "Ninguna", descuento.id],
          );
          await client.query("COMMIT");
          continue;
        }
        //* AHORRROS * //

        if (cuotaAhorroId === null) {
          obs = "No se aplico descuento de ahorro.";
        } else {
          //? controlamos que la cuota_ahorro este activa
          const sqlCuotaAhorro = await client.query(
            ` SELECT cua.monto, ca.cuenta_ahorro_id,ca2.codigo   FROM cuota_cuenta_ahorro ca
                INNER JOIN cuota_ahorro cua ON cua.id = ca.cuota_ahorro_id
                inner join cuenta_ahorro ca2 on ca.cuenta_ahorro_id = ca2.id 
                WHERE cua.is_active = true and ca.id = $1 `,
            [cuotaAhorroId],
          );
          //? controlamos existencia
          if (sqlCuotaAhorro.rows.length === 0) {
            ahorrosOk = 0;
            obs = "No se aplico descuento de ahorro, cuota-ahorro inactiva.";
          } else {
            const cuentaAhorroId = sqlCuotaAhorro.rows[0].cuenta_ahorro_id;
            const codCtaAhorro = sqlCuotaAhorro.rows[0].codigo;

            // obtenemos el id de la cuenta auxiliar de la cuenta de ahorro del socio
            const sqlCtaAuxAhorro = await client.query(
              `select id from cuenta_auxiliar where referencia_tabla = $1 and referencia_id = $2`,
              ["cuenta_ahorro", cuentaAhorroId],
            );
            const ctaAuxAhorroId = sqlCtaAuxAhorro.rows[0].id;

            //? verificamos que el monto de ahorro sea igual al del excel
            const montoAhorro = sqlCuotaAhorro.rows[0].monto;
            const montoAhorroExcel = descuentoExcel.montoAhorro;
            if (
              Math.round(Number(montoAhorro) * 100) !==
              Math.round(Number(montoAhorroExcel) * 100)
            ) {
              ahorrosOk = 0;
              obs =
                "No se aplico descuento de ahorro, monto generado es diferente al monto excel cargado.";
            } else {
              ahorrosOk = 1;
              //? TODO BIEN LISTO PARA REGISTRAR ?*//
              //? REGISTRO EN MOVIMIENTOS_AHORROS
              await client.query(
                `INSERT INTO movimiento_ahorro (ahorro_id, tipo_operacion, monto,sentido, periodo, descripcion)
                VALUES ( $1, $2, $3, $4, $5, $6 )`,
                [
                  cuentaAhorroId,
                  "DESCUENTO PLANILLA",
                  montoAhorro,
                  "AUMENTA",
                  `${descuento.mes}-${descuento.anio}`,
                  `Descuento de ahorro por planilla`,
                ],
              );
              //? ACTUALIZO SALDO EN CUENTA_AHORRO
              await client.query(
                `UPDATE cuenta_ahorro SET saldo_actual = saldo_actual + $1, updated_at = NOW() WHERE id = $2`,
                [montoAhorro, cuentaAhorroId],
              );

              //****PARTE CONTABLE *****
              //? REGISTRO DE ASIENTO
              const insertAsiento = await client.query(
                `INSERT INTO asiento_contable ( glosa, referencia, cuenta_bancaria_id ) VALUES( $1, $2, $3 ) RETURNING id`,
                [
                  `Ahorro mediante descuento planilla, periodo: ${descuento.mes}-${descuento.anio} - Cuenta Ahorro ${codCtaAhorro} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
                  `AHORRO - Descuento Planilla`,
                  cuentaBancariaId,
                ],
              );

              const asiento_id = insertAsiento.rows[0].id;

              //? insertar datos a detalle asiento
              // para el debe el ahorro ingresa al banco
              const insertDetAsientoDebe = await client.query(
                `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
                [
                  asiento_id,
                  cuentaContableBancoId,
                  cuentaAuxBanco,
                  montoAhorro,
                  0,
                ],
              );
              // para el haber el cuentas por cobrar aumenta el haber
              const insertDetAsientoHaber = await client.query(
                `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
                [
                  asiento_id,
                  cuentaContableAhorroSocioId,
                  ctaAuxAhorroId,
                  0,
                  montoAhorro,
                ],
              );

              //csontamos lo descontado por prestamo
              totalDescontadoAhorro += Math.round(+montoAhorro * 100);
            }
          }
        }
        //* PRESTAMOS
        // preguntamos si cuota_prestamo_id es null

        if (cuotaPrestamoId === null) {
          obs += "| No se aplico descuento de prestamo.";
        } else {
          // controlamos que la cuota_prestamo este activa
          const sqlCuotaPrestamo = await client.query(
            `select cp.monto, cp.prestamo_id, cp.is_pay, cp.num_cuota, p.codigo 
              from cuota_prestamo cp 
              inner join prestamo p on cp.prestamo_id = p.id
              where  cp.is_active = true and cp.id = $1`,
            [cuotaPrestamoId],
          );

          if (sqlCuotaPrestamo.rows.length === 0) {
            prestamosOk = 0;
            obs +=
              "| No se aplico descuento de prestamo, cuota-prestamo inactiva.";
          } else {
            // obtenemos prestamo_id
            const prestamoId = sqlCuotaPrestamo.rows[0].prestamo_id;
            //obtenemos numero de cuota
            const numCuota = sqlCuotaPrestamo.rows[0].num_cuota;
            // obtenemos el codigo del prestamo
            const codPrestamo = sqlCuotaPrestamo.rows[0].codigo;

            // obtenemos el id de la cuenta auxiliar del prestamo del socio
            const sqlCtaAuxPrestamo = await client.query(
              `select id from cuenta_auxiliar where referencia_tabla = $1 and referencia_id = $2`,
              ["prestamo", prestamoId],
            );
            const ctaAuxPrestamoId = sqlCtaAuxPrestamo.rows[0].id;

            //? verificamos que el monto sea igual al del excel
            const montoPrestamo = sqlCuotaPrestamo.rows[0].monto;
            const montoPrestamoExcel = descuentoExcel.montoPrestamo;
            if (
              Math.round(Number(montoPrestamo) * 100) !==
              Math.round(Number(montoPrestamoExcel) * 100)
            ) {
              prestamosOk = 0;
              obs +=
                "| No se aplico descuento de prestamo, monto generado es diferente al monto excel cargado.";
            } else {
              //? todo bien

              //! CONTROLAR LA PARETE CUANDO UN PRESTAMO SE CAMCELO POR COMPLETO, CAMBIAR EL ESTADO a cancelado

              prestamosOk = 1;

              //? REGISTRO DE MOVIMIENTO_PRESTAMO
              const sqlMovimeintoPrestamo = await client.query(
                `insert into movimiento_prestamo ( prestamo_id, monto, nro_cuota, tipo_movimiento, sentido, periodo, descripcion) 
                         values ( $1, $2, $3, $4, $5, $6, $7 )`,
                [
                  prestamoId,
                  montoPrestamo,
                  numCuota,
                  "DESCUENTO PLANILLA",
                  "DISMINUYE",
                  `${descuento.mes}-${descuento.anio}`,
                  `Descuento planilla Nro. Cuota ${numCuota}`,
                ],
              );

              //? PONEMOS CUOTA PRESTAMO COM PAGADA
              await client.query(
                `UPDATE cuota_prestamo SET is_pay = true, updated_at = NOW() WHERE id = $1`,
                [cuotaPrestamoId],
              );
              //? ACTUALIZAMOS SALDO EN TABLA PRESTAMO
              //todo: COMLETAR Y ACTUALIZAR EL ESTADO  --- IMPORTANTE!!!
              // EN LA CONSULTA DE ABAJO PODEMOS REGRESAR EL SALDO ACTUAL Y SI ES == A CERO ENTONCES QUIERE DECIR QUE PAGO SUS DEUDAS .
              const updatePrestamo = await client.query(
                `UPDATE prestamo SET saldo_actual = saldo_actual - $1, updated_at = NOW() WHERE id = $2 RETURNING saldo_actual`,
                [montoPrestamo, prestamoId],
              );
              const saldoActual = updatePrestamo.rows[0].saldo_actual;
              //preguntamos si saldo actual es igual a 0 y si lo es actualizamos estado
              if (Number(saldoActual) === 0) {
                await client.query(
                  `UPDATE prestamo SET estado = 'CANCELADO', is_active = false ,updated_at = NOW() WHERE id = $1`,
                  [prestamoId],
                );
              }

              //***** PARTE CONTABLE *****

              const insertAsientoPrestamo = await client.query(
                `INSERT INTO asiento_contable ( glosa, referencia, cuenta_bancaria_id ) VALUES( $1, $2, $3) RETURNING id`,
                [
                  `Pago de cuota ${numCuota} mediante descuento planilla - Prestamo ${codPrestamo} - en fecha ${fechaActual.toLocaleDateString("es-ES")}`,
                  `PRESTAMO - Descuento Planilla`,
                  cuentaBancariaId,
                ],
              );

              const asientoIdPrestamo = insertAsientoPrestamo.rows[0].id;

              //? insertar datos a detalle asiento
              // para el debe BANCO +
              const insertDetAsientoDebePrestamo = await client.query(
                `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
                [
                  asientoIdPrestamo,
                  cuentaContableBancoId,
                  cuentaAuxBanco,
                  montoPrestamo,
                  0,
                ],
              );
              // para el haber el cuentas por cobrar -
              const insertDetAsientoHaberPrestamo = await client.query(
                `INSERT INTO asiento_detalle ( asiento_id, cuenta_id, cuenta_aux_id, debe, haber ) values ($1, $2, $3, $4, $5)`,
                [
                  asientoIdPrestamo,
                  cuentaContableCtaPorCobrarId,
                  ctaAuxPrestamoId,
                  0,
                  montoPrestamo,
                ],
              );

              // sumamos lo descontado prestamos
              totalDescontadoPrestamo += Math.round(+montoPrestamo * 100);
            }
          }
        }
        //* REVISION PARA EL GUARDADO
        //* preguntamos si prestamoOk y ahorroOk son iguales a 1, si es asi realizamosel registro descuento y hacemos commit , caso contrario registramos el descuento indicando falla y lanzamos excepcion
        if (ahorrosOk === 1 && prestamosOk === 1) {
          estadoDescuento = "Descontado";
          cuotasDescontadas = "Ambas";

          await client.query("COMMIT");
        } else {
          estadoDescuento = "No Descontado";
          cuotasDescontadas = "Ninguna";
          await client.query("ROLLBACK");
        }
        //? registramos el descuento
        await client.query(
          `UPDATE descuento_planilla_socio SET
              obs = $1,
              estado_descuento = $2,
              cuotas_descontadas = $3,
              updated_at = NOW()
              WHERE id = $4`,
          [obs, estadoDescuento, cuotasDescontadas, descuento.id],
        );

        //console.log("socio confirmado:", codSocio);
      }

      //?

      //*ACTUALIZAR EL CAMPO DE DESCUENTO_PLANILLA -> is_duscounted = true
      await client.query(
        `UPDATE descuento_planilla SET is_discounted = true, updated_at = NOW() WHERE id = $1`,
        [idDescuentoPlantilla],
      );

      //*CALCULAR TOTAL PRESTAMOS Y TOTAL AHORROS
      const totalAhorros = data.reduce(
        (acc, item) => acc + Number(item.montoAhorro),
        0,
      );
      const totalPrestamos = data.reduce(
        (acc, item) => acc + Number(item.montoPrestamo),
        0,
      );

      //*INSERTAR POR SEPARADO EN MOVIMIENTO BANCARIO TOTAL PRESTAMOS Y TOTAL AHORROS
      const mes = sqlDescuentos.rows[0].mes;
      const anio = sqlDescuentos.rows[0].anio;
      //todo: no onvidar insertar el comprobante de descuento planilla en la tabla movimiento_bancario
      await client.query(
        `
        INSERT INTO movimiento_bancario(cuenta_bancaria_id,fecha, monto, tipo_operacion, categoria, comprobante, detalle, sentido)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          cuentaBancariaId,
          fechaActual,
          totalDescontadoAhorro / 100,
          "DEPOSITO",
          "AHORRO",
          "",
          `Depósito mensual de ahorros descontado por planilla correspondiente al perido ${mes}-${anio}`,
          "AUMENTA",
        ],
      );
      await client.query(
        `
        INSERT INTO movimiento_bancario(cuenta_bancaria_id,fecha, monto, tipo_operacion, categoria, comprobante, detalle, sentido)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          cuentaBancariaId,
          fechaActual,
          totalDescontadoPrestamo / 100,
          "DEPOSITO",
          "PRESTAMO",
          "",
          `Depósito mensual de préstamos descontado por planilla correspondiente al perido ${mes}-${anio}`,
          "AUMENTA",
        ],
      );

      //TODO: GUARDAR IMAGEN DEL COMPROBANTE

      //?Actualizamos el campo de nuevo prestamo a false para que e=se le pueda descontar en el siguiente mes
      await client.query(`UPDATE prestamo SET nuevo_prestamo = false `);

      await client.query("COMMIT");
      return {
        status: "ok",
        message: "descuentos registrados correctamente",
        totalAhorros,
        totalPrestamos,
        totalDescontadoAhorro: totalDescontadoAhorro / 100,
        totalDescontadoPrestamo: totalDescontadoPrestamo / 100,
        idDescuentoPlantilla,
        data,
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

  //* FUNCIONES
  //* funcion para regresar la lista de descutos por planilla

  private async getListaDescuentosPlanilla(id: number) {
    const listDescuentos = await this.pool.query(
      `SELECT
    dps.id,
    REGEXP_REPLACE(s.cod_socio, '\\D', '', 'g') AS num_emp,
    s.nom_completo AS socio_nombre,
    COALESCE(cua.monto, 0) AS monto_ahorro,
    COALESCE(cp.monto, 0) AS monto_prestamo,
    ( COALESCE(cua.monto, 0) + COALESCE(cp.monto, 0) ) AS monto_total,
    dps.estado_descuento,
    dps.cuotas_descontadas,
    dps.created_at,
    dps.obs
    FROM descuento_planilla_socio dps
    INNER JOIN socio s
        ON s.id = dps.socio_id
    LEFT JOIN cuota_cuenta_ahorro ca
        ON ca.id = dps.cuota_ahorro_id
    LEFT JOIN cuota_ahorro cua
        ON cua.id = ca.cuota_ahorro_id
    LEFT JOIN cuota_prestamo cp
        ON cp.id = dps.cuota_prestamo_id
    WHERE dps.descuento_planilla_id = $1;`,
      [id],
    );
    //recorremos la respuesta de la consulta para obtener el socio ,
    return listDescuentos.rows;
  }
}
