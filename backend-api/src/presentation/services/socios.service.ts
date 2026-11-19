import { CustomError } from "../../domain";
import { PostgresDatabase } from "../../data";
import { Pool } from "pg";
import { bcryptAdapter, envs, JwtAdapter } from "../../config";
import { SocioUpdateDto } from "../../domain/dtos/socio/socio-update.dto";
import { SocioCreateDto } from "../../domain/dtos/socio/socio-create.dto";

const RRHH_API_URL = envs.RRHH_API_URL;

export class SocioService {
  private readonly pool: Pool;
  // ID
  constructor() {
    this.pool = PostgresDatabase.getPool();
  }

  //* USUARIO NORMAL
  // obtiene datos del socio incluyendo ahorros y prestamos
  public async getSocioData(socioId: number) {
    try {
      const socioSql = await this.pool.query(
        `select * from socio where id = $1 and is_active = true`,
        [socioId],
      );
      // obtiene ahorros
      const ahorroSql = await this.pool.query(
        `select id,numero_cuenta,saldo_actual,estado,fecha_operacion,codigo from cuenta_ahorro where socio_id = $1 `,
        [socioId],
      );
      let ahorro = null;
      if (ahorroSql.rows.length > 0) {
        const ahorroId = ahorroSql.rows[0].id;
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
          [ahorroId],
        );

        ahorro = {
          numCuenta: ahorroSql.rows[0].numero_cuenta,
          saldo: ahorroSql.rows[0].saldo_actual,
          estado: ahorroSql.rows[0].estado,
          fechaApertura: ahorroSql.rows[0].fecha_operacion,
          codigo: ahorroSql.rows[0].codigo,
          movimientoAhorro: result.rows,
        };
      }
      //obtiene PRESTAMOS
      const prestamoSql = await this.pool.query(
        `select id, monto_otorgado,saldo_actual,cuota_mensual, ultima_cuota, num_cuotas, codigo, fecha_otorgado, estado,obs,monto_solicitado, estado_soli 
        from prestamo 
        where socio_id = $1 and is_active = true `,
        [socioId],
      );

      let prestamo = null;
      if (prestamoSql.rows.length > 0) {
        const prestamoId = prestamoSql.rows[0].id;
        //buscamos datos de cuotasList

        const sqlCuotasPrestamo = await this.pool.query(
          `select * from cuota_prestamo where prestamo_id = $1 and is_pay = false and is_active = true`,
          [prestamoId],
        );

        //? obtenemos movimientos del prestamo del socio

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

        // const prestamosSql = await this.pool.query(
        //   `SELECT
        //    fecha,
        //    created_at,

        //    -- Generamos la descripción automática fija según el tipo de movimiento
        //    CASE tipo_movimiento
        //        WHEN 'DESCUENTO PLANILLA' THEN 'Pago de Cuota Nro. ' || COALESCE(nro_cuota::text, '')
        //        WHEN 'AMORTIZACION' THEN 'Abono extraordinario (Amortización)'
        //        WHEN 'DESEMBOLSO' THEN 'Desembolso inicial de préstamo'
        //        WHEN 'AJUSTE' THEN 'Ajuste de cuenta'
        //        ELSE tipo_movimiento::text
        //    END AS descripcion,

        //    tipo_movimiento,
        //    periodo,
        //    nro_cuota ,
        //    -- Si el sentido disminuye el préstamo, para el socio es un ABONO (Ingreso)
        //    CASE WHEN sentido = 'DISMINUYE' THEN monto ELSE NULL END AS abono,

        //    -- Si el sentido aumenta el préstamo (como un ajuste en contra), es un CARGO (Egreso)
        //    CASE WHEN sentido = 'AUMENTA' THEN monto ELSE NULL END AS cargo,

        //    -- CALCULADORA DE SALDO PASO A PASO:
        //    SUM(CASE WHEN sentido = 'AUMENTA' THEN monto ELSE -monto END)
        //        OVER (PARTITION BY prestamo_id ORDER BY fecha ASC, id ASC) AS saldo_capital

        //    FROM movimiento_prestamo
        //    WHERE prestamo_id = $1
        //    ORDER BY fecha ASC, id ASC;`,
        //   [prestamoId],
        // );

        //? DATOS DEL AMORTIZACION SI ES QUE LO TUBIESE

        const sqlAmortizacion = await this.pool.query(
          `SELECT id, prestamo_id , monto, saldo_original , nuevo_saldo , estado , is_active 
           FROM amortizacion 
           WHERE prestamo_id = $1 order by id desc limit 1`,
          [prestamoId],
        );

        //? datos de refinanciamiewnto si lo tuviese
        const sqlRefinanciamiento = await this.pool.query(
          `SELECT id, prestamo_origen_id, prestamo_nuevo_id, saldo_original, monto_solicitado, cuotas
           FROM refinanciamiento
           WHERE prestamo_origen_id = $1 AND estado = 'EN REVISION' AND is_active = true`,
          [prestamoId],
        );

        prestamo = {
          id: prestamoSql.rows[0].id,
          montoOtorgado: prestamoSql.rows[0].monto_otorgado,
          montoSolicitado: prestamoSql.rows[0].monto_solicitado,
          fechaOtorgado: prestamoSql.rows[0].fecha_otorgado,
          estado: prestamoSql.rows[0].estado,
          estadoSoli: prestamoSql.rows[0].estado_soli,
          saldo: prestamoSql.rows[0].saldo_actual,
          cuotaMensual: prestamoSql.rows[0].cuota_mensual,
          ultimaCuota: prestamoSql.rows[0].ultima_cuota,
          fecha: prestamoSql.rows[0].fecha_otorgado,
          codigo: prestamoSql.rows[0].codigo,
          obs: prestamoSql.rows[0].obs,
          cuotas: prestamoSql.rows[0].num_cuotas,
          cuotasRestates: +sqlCuotasPrestamo.rows.length,
          cuotasList: sqlCuotasPrestamo.rows ?? [],
          refinanciamiento: sqlRefinanciamiento.rows,
          amortizacion: sqlAmortizacion.rows,
          totalPagado: (
            +prestamoSql.rows[0].monto_otorgado -
            +prestamoSql.rows[0].saldo_actual
          ).toFixed(2),
          movimientoPrestamo: sqlMovimientos.rows,
        };
      }

      //? para obtener el link del qr para la transferencia de la cuenta bancaria de la cooperativa
      const sqlQr = await this.pool.query(
        `SELECT ruta_qr FROM cuenta_bancaria WHERE is_active = true`,
      );

      const socio = {
        id: socioSql.rows[0].id,
        codSocio: socioSql.rows[0].cod_socio,
        nombre: socioSql.rows[0].nom_completo,
        ci: socioSql.rows[0].ci,
        extencion_ci: socioSql.rows[0].extencion_ci,
        direccion: socioSql.rows[0].direccion,
        celular: socioSql.rows[0].celular,
        plantaId: socioSql.rows[0].planta_id,
        fechaIngreso: socioSql.rows[0].fecha_ingreso,
        isActive: socioSql.rows[0].is_active,
        numReferencia: socioSql.rows[0].num_referencia,
        cuentaBancaria: socioSql.rows[0].cuenta_bancaria,
        foto: socioSql.rows[0].foto,
        email: socioSql.rows[0].email,
        urlImageQrCoop: sqlQr.rows[0]?.ruta_qr || null,
        ahorro: ahorro,
        prestamo: prestamo,
      };

      return {
        status: "ok",
        message: "Informacion del socio",
        socio: socio,
      };
    } catch (error) {
      console.log({ error });
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //* actualiza datos del socio ojo que lo usa tambien el admin
  public async updateSocioData(socioUpdateDto: SocioUpdateDto) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      const sqlSocio = await client.query(
        `UPDATE socio 
        SET email = $1, celular = $2, num_referencia = $3, direccion = $4, cuenta_bancaria = $5, updated_at = NOW() 
        WHERE id = $6 and cod_socio = $7 RETURNING *`,
        [
          socioUpdateDto.email,
          socioUpdateDto.celular,
          socioUpdateDto.numReferencia,
          socioUpdateDto.direccion,
          socioUpdateDto.cuentaBancaria,
          socioUpdateDto.id,
          socioUpdateDto.codSocio,
        ],
      );
      await client.query("COMMIT");
      //log para el comentario de la actualizacion de datos del socio
      console.log(
        `Datos del socio actualizado en fecha ${new Date()} - codigo: `,
        socioUpdateDto.id,
      );
      return {
        status: "ok",
        message: "Datos del socio actualizados",
        //socio: socioUpdateDto,
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

  //* ADMINISTRADOR
  //obtiene lista de socios
  public async getSocios() {
    try {
      const result = await this.pool.query(` SELECT * FROM socio `);
      return {
        status: "ok",
        message: "lista de socios",
        socios: result.rows,
      };
    } catch (error) {
      console.log({ error });
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //todo: reestablecer password
  public async reestablecerPassword(
    num_emp: string,
    tipo: string,
    rol_user: string,
  ) {
    if (!num_emp || isNaN(+num_emp) || num_emp.length > 6) {
      throw CustomError.badRequest("El numero de empleado es requerido");
    }
    if (!tipo || tipo.trim() === "" || tipo.length > 6) {
      throw CustomError.badRequest("El tipo de cambio es requerido");
    }
    if (tipo !== "user" && tipo !== "adm") {
      throw CustomError.badRequest(
        "Accion denegada, no tiene permiso para realizar esta accion",
      );
    }

    const result = await this.pool.query(
      `select ci from personal where num_emp = $1`,
      [num_emp],
    );
    if (result.rows.length === 0) {
      throw CustomError.badRequest("El numero de empleado no existe");
    }
    const ci = result.rows[0].ci;
    //encriptar
    const password = bcryptAdapter.hash(ci);
    try {
      if (
        tipo === "user" &&
        (rol_user === "admin-regional" || rol_user === "admin-global")
      ) {
        //actualizar la contraseña
        const consult = await this.pool.query(
          "UPDATE usuarios SET pass_hash = $1, updated_at = NOW(), user_token = null WHERE user_name = $2 ",
          [password, num_emp],
        );
      } else if (tipo === "adm" && rol_user === "admin-global") {
        //actualizar la contraseña
        const consult = await this.pool.query(
          "UPDATE usuarios_admin SET pass_hash = $1, updated_at = NOW(), user_token = null WHERE num_emp = $2 RETURNING *",
          [password, num_emp],
        );
        if (consult.rows.length === 0) {
          throw CustomError.badRequest(
            "El usuario no pertenece al grupo de administradores",
          );
        }
      } else {
        throw CustomError.badRequest(
          "Accion denegada, no tiene permiso para realizar esta accion",
        );
      }
      return {
        status: "ok",
        message: "Contraseña restablecida exitosamente!",
      };
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //** actualizar datos socios
  public async updateListSocios(num_emp: number, planta_id: string) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const response = await fetch(
        `${RRHH_API_URL}/export_personal_data_to_api_cooperativa.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planta_id, num_emp }),
        },
      );

      if (!response.ok) {
        throw CustomError.badRequest(
          `Error al momento de actualizar, intente nuevamente.`,
        );
      }

      const data = await response.json();
      //console.log("TOTAL DESDE API:", data.data.length);

      //console.log(data.data);
      //recorremos el array y actualizamos datos en la tabla personal
      //let i = 0;
      for (const emp of data.data) {
        let codSocio = `SOC-${emp.num_emp}`;
        // i++;
        // console.log(
        //   `Procesando ${i}/${data.data.length}:`,
        //   emp.num_emp,
        //   codSocio,
        //  );
        if (emp.estado === "1") {
          //verificamos si el empleado es nuevo o ya existe
          const veryEmp = await client.query(
            `SELECT cod_socio FROM socio WHERE cod_socio = $1`,
            [codSocio],
          );
          // si no existe lo añadimos a socio y a usuario

          if (veryEmp.rows.length === 0) {
            const sqlInsert = await client.query(
              `INSERT INTO socio ( cod_socio, planta_id, nom_completo, ci, extencion_ci, num_referencia, foto, is_active, celular,
               direccion, cuenta_bancaria, sexo, fecha_naci )
               VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13 ) RETURNING id`,
              [
                codSocio,
                emp.planta_id,
                emp.nom_completo,
                emp.ci,
                emp.extencion_ci ?? "-",
                emp.num_referencia,
                emp.foto,
                true,
                emp.celular,
                emp.direccion,
                emp.nro_cuenta,
                emp.sexo,
                emp.fecha_naci,
              ],
            );
            const socioId = sqlInsert.rows[0].id;

            const password = bcryptAdapter.hash(emp.ci);

            const sqlinsertUser = await client.query(
              `INSERT INTO usuario ( user_name, pass_hash, socio_id ) 
            VALUES( $1, $2, $3 )`,
              [emp.num_emp, password, socioId],
            );
          } else {
            //si ya existe actualizamos
            let estado = true;
            if (emp.estado === "0") {
              estado = false;
            }

            const sqlUpdate = await client.query(
              `UPDATE socio SET
                planta_id        = $1,
                nom_completo     = $2,
                ci               = $3,
                extencion_ci     = $4,
                num_referencia   = $5,
                foto             = $6,
                is_active        = $7,
                celular          = $8,
                direccion        = $9,
                cuenta_bancaria  = $10,
                sexo             = $11,
                fecha_naci       = $12,
                updated_at       = NOW()
               WHERE cod_socio = $13 RETURNING id`,
              [
                emp.planta_id, // planta_id
                emp.nom_completo, // nom_completo
                emp.ci, // ci
                emp.extencion_ci ?? "-", // extencion_ci
                emp.num_referencia, // num_referencia
                emp.foto, // foto
                estado, // is_active
                emp.celular, // celular
                emp.direccion, // direccion
                emp.nro_cuenta, // cuenta_bancaria
                emp.sexo, // sexo
                emp.fecha_naci, // fecha_naci
                codSocio, // cod_socio
              ],
            );
            const socioId2 = sqlUpdate.rows[0]?.id;

            const sqlUpdateU = await client.query(
              `UPDATE usuario SET is_active = $1, updated_at = now()
               WHERE socio_id = $2`,
              [estado, socioId2],
            );
          }
        } else {
          const updateEmp = await client.query(
            `UPDATE socio SET is_active = $1 WHERE cod_socio = $2  RETURNING id`,
            [false, codSocio],
          );
          const socioId = updateEmp.rows[0]?.id;

          const updateUser = await client.query(
            `UPDATE usuario SET is_active = $1 WHERE socio_id = $2`,
            [false, socioId],
          );
          const updateUserAdmin = await client.query(
            `UPDATE usuario_admin SET is_active = $1 WHERE socio_id = $2`,
            [false, socioId],
          );
        }
      }
      const empleadosList = await client.query(`select * from socio`);
      await client.query("COMMIT");
      return {
        status: "ok",
        message: "Actualizacion exitosa.",
        planta_id,
        usuarios: empleadosList.rows,
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

  //* obtiene datos de un socio desde panel administrador
  public async getSocio(cod_socio: string) {
    if (!cod_socio || cod_socio.trim() === "") {
      throw CustomError.badRequest("El codigo de socio es requerido");
    }

    try {
      const sqlSocio = await this.pool.query(
        `select s.id, s.cod_socio ,s.cuenta_bancaria ,s.direccion ,s.email, s.extencion_ci ,s.num_referencia ,s.ci,s.fecha_ingreso ,s.foto ,s.celular,
         s.nom_completo ,s.is_active ,s.planta_id ,u.user_name as user_socio , 
          (select ua.user_name from usuario_admin ua where ua.socio_id = s.id) as user_admin
          from socio s inner join usuario u on s.id = u.socio_id and s.cod_socio = $1   `,
        [cod_socio],
      );
      if (sqlSocio.rows.length === 0)
        throw CustomError.badRequest("El codigo del socio no existe");

      return {
        status: "ok",
        message: "Datos del socio",
        socio: sqlSocio.rows[0],
      };
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //* update usuario del socio al igual que asigna admin

  public async updateUsuarioSocio(
    userName: string,
    codSocio: string,
    rol: string,
    idSocio: number,
  ) {
    console.log({ idSocio, rol, userName, codSocio });
    if (userName.length < 4)
      throw CustomError.badRequest(
        "La longitud del nombre de usuario debe ser mayor a 5",
      );
    if (rol.length === 0) throw CustomError.badRequest("Rol es requerido");

    const client = await this.pool.connect();

    // validamos nombre de usuraio que no se repita
    if (rol === "admin") {
      const sqlAdminValidate = await client.query(
        `
          select user_name from usuario_admin  where user_name = $1`,
        [userName],
      );
      if (sqlAdminValidate.rows.length > 0) {
        throw CustomError.badRequest("El nombre de usuario ya existe. ");
      }
    } else {
      // eliminamos de la lista de admin si viene con rol socio
      const sqlDeleteAdmin = await client.query(
        `delete from usuario_admin where user_name = $1`,
        [userName],
      );

      const sqlUserValidate = await client.query(
        `select user_name from usuario  where user_name = $1`,
        [userName],
      );
      if (sqlUserValidate.rows.length > 0) {
        throw CustomError.badRequest("El nombre de usuario ya existe. ");
      }
    }

    try {
      await client.query("BEGIN");
      if (rol === "admin") {
        const sqlUserAdmin = await client.query(
          `select s.ci,ua.id from usuario_admin ua inner join socio s on ua.socio_id =s.id 
          WHERE ua.socio_id = $1
          `,
          [idSocio],
        );

        if (sqlUserAdmin.rows.length === 0) {
          const sqlSocio = await client.query(
            `select s.ci from socio s  WHERE s.id = $1
          `,
            [idSocio],
          );
          //agregamos a los admin
          const ci = sqlSocio.rows[0].ci;
          //encriptar la contraseña

          const newPassword = bcryptAdapter.hash(ci);
          await client.query(
            `
            insert into usuario_admin (user_name,pass_hash,socio_id)values($1,$2,$3)
            `,
            [userName, newPassword, idSocio],
          );
        } else {
          //actualizamos
          await client.query(
            `
            update usuario_admin set user_name = $1 where socio_id = $2
            `,
            [userName, idSocio],
          );
        }
      }
      // actualizamos el usuario socio
      await client.query(
        `
          update usuario set user_name = $1 where socio_id = $2`,
        [userName, idSocio],
      );

      await client.query("COMMIT");
      return {
        message: "actualizado con exito",
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

  //* reestablecer contrasenia de un usuario socio normal
  public async resetPasswordSocio(idSocio: number) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const sqlSocio = await client.query(
        `SELECT ci FROM socio WHERE id = $1`,
        [idSocio],
      );
      //console.log("esta llegando", idSocio);
      const ci = sqlSocio.rows[0].ci;
      //encriptar la contraseña
      const newPassword = bcryptAdapter.hash(ci);

      await client.query(
        `
        update usuario set pass_hash = $1 , user_token = '' where socio_id = $2`,
        [newPassword, idSocio],
      );

      await client.query("COMMIT");
      return {
        status: "ok",
        message: "contraseńa reestablecida",
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

  //* para dar de baja a un socio y su usuario
  public async bajaSocio(codigoSocio: string, socioId: number) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      //? verificamos que el socio exista y este activo
      const sqlSocio = await client.query(
        `SELECT id, is_active FROM socio WHERE cod_socio = $1 AND id = $2`,
        [codigoSocio, socioId],
      );
      if (sqlSocio.rows.length === 0) {
        throw CustomError.badRequest("El socio no existe");
      }
      if (!sqlSocio.rows[0].is_active) {
        throw CustomError.badRequest("El socio ya esta dado de baja");
      }

      //?verificar si tiene prestamos activos
      const sqlPrestamo = await client.query(
        `SELECT id FROM prestamo WHERE socio_id = $1 AND is_active = true AND saldo_actual > 0`,
        [socioId],
      );
      if (sqlPrestamo.rows.length > 0) {
        throw CustomError.badRequest(
          "El socio tiene prestamos activos, no se puede dar de baja",
        );
      }

      //?verificar si tiene ahorros activos
      const sqlAhorro = await client.query(
        `SELECT id FROM cuenta_ahorro WHERE socio_id = $1 AND is_active = true AND saldo_actual > 0`,
        [socioId],
      );
      if (sqlAhorro.rows.length > 0) {
        throw CustomError.badRequest(
          "El socio tiene ahorros, no se puede dar de baja",
        );
      }

      //? damos de baja al socio
      await client.query(
        `UPDATE socio SET is_active = false, updated_at = NOW() WHERE id = $1`,
        [socioId],
      );

      //? damos de baja al usuario del socio
      await client.query(
        `UPDATE usuario SET is_active = false, updated_at = NOW() WHERE socio_id = $1`,
        [socioId],
      );

      //? damos de baja al usuario admin si existe
      await client.query(
        `UPDATE usuario_admin SET is_active = false, updated_at = NOW() WHERE socio_id = $1`,
        [socioId],
      );

      //? si tiene cuenta de ahorro lo damos de baja
      await client.query(
        `UPDATE cuenta_ahorro SET is_active = false, estado = $1, updated_at = NOW() WHERE socio_id = $2`,
        ["CERRADO", socioId],
      );

      await client.query("COMMIT");

      return {
        status: "ok",
        message: "Socio dado de baja exitosamente.",
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

  //*! obtiene datos de un empleado para agregar nuevo socio CORREGIR YA NO SE UTILIZARA*/
  public async findPersonalOnRRHH(num_emp: number) {
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
      throw CustomError.badRequest(
        `Error al momento de actualizar, intente nuevamente.`,
      );
    }

    const data = await response.json();
    console.log({ data });
  }

  //* NUEVA FUNCION PARA CREAR UN NUEVO SOCIO DESDE EL PANEL DE ADMINISTRACION
  public async createNewSocio(socioCreateDto: SocioCreateDto) {
    console.log({ socioCreateDto });
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      //? creamos nuevo codigo para el socio
      const codSocio = `SOC-${socioCreateDto.numEmp}`;
      //? verificamos que el socio no exista
      const sqlSocio = await client.query(
        `SELECT id FROM socio WHERE cod_socio = $1`,
        [codSocio],
      );
      if (sqlSocio.rows.length > 0) {
        throw CustomError.badRequest(
          "El numero de empleado ya existe verifique e intente nuevamente.",
        );
      }
      const nomCompleto =
        `${socioCreateDto.apellido}, ${socioCreateDto.nombre}`.toUpperCase();

      //? insertamos el nuevo socio en la tabla socio
      const sqlInsert = await client.query(
        `INSERT INTO socio ( cod_socio, planta_id, nom_completo, ci, num_referencia, celular, direccion, cuenta_bancaria, email )
          VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 ,$9 ) RETURNING id`,
        [
          codSocio,
          socioCreateDto.plantaId,
          nomCompleto,
          socioCreateDto.ci,
          socioCreateDto.numReferencia,
          socioCreateDto.celular,
          socioCreateDto.direccion,
          socioCreateDto.cuentaBancaria,
          socioCreateDto.email,
        ],
      );
      const socioId = sqlInsert.rows[0].id;

      //? encriptamos la contraseña del socio con su CI
      const password = bcryptAdapter.hash(socioCreateDto.ci);

      //? creamos el nombre de usuario a partir de la inicial del nombre y el primer apellido, y si ya existe le agregamos un numero al final
      // const userNameBase = (
      //   socioCreateDto.nombre.trim().charAt(0) +
      //   socioCreateDto.apellido.trim().split(/\s+/)[0]
      // ).toLowerCase();

      const userName = socioCreateDto.numEmp;

      const sqlUserExists = await client.query(
        `SELECT id
         FROM usuario
         WHERE user_name = $1
         LIMIT 1`,
        [userName],
      );

      if (sqlUserExists.rows.length > 0) {
        throw CustomError.badRequest(
          "El número de empleado ya existe, verifique e intente nuevamente.",
        );
      }

      //? insertamos el nuevo usuario en la tabla usuario
      const sqlinsertUser = await client.query(
        `INSERT INTO usuario ( user_name, pass_hash, socio_id )
            VALUES( $1, $2, $3 )`,
        [userName, password, socioId],
      );

      //? cramos nueva cuenta de ahorro para el socio
      // obtenemos id de la cuota de ahorro
      const sqlCuotaAhorro = await client.query(
        `SELECT id FROM cuota_ahorro WHERE is_active = true`,
      );
      const cuotaAhorroId = sqlCuotaAhorro.rows[0].id;

      //* insertamos la nueva cuenta de ahorro
      const sqlInsertCtaAhorro = await client.query(
        `INSERT INTO cuenta_ahorro ( socio_id, numero_cuenta, fecha_operacion, codigo )
        values($1, $2, CURRENT_DATE, $3) RETURNING id `,
        [socioId, socioCreateDto.numEmp, `CTA-AHO-${socioCreateDto.numEmp}`],
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
        [cuentaAhorroId, "cuenta_ahorro", `CTA-AHO-${socioCreateDto.numEmp}`],
      );

      await client.query("COMMIT");

      return {
        status: "ok",
        message: "Nuevo socio creado exitosamente",
        //socioData: socioCreateDto,
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
