import { CustomError } from "../../domain";
import { PostgresDatabase } from "../../data";
import { Pool } from "pg";
import { bcryptAdapter, envs, JwtAdapter } from "../../config";

const RRHH_API_URL = envs.RRHH_API_URL;

export class UsuariosService {
  private readonly pool: Pool;
  // ID
  constructor() {
    this.pool = PostgresDatabase.getPool();
  }
  //** obtiene lista de ussuarios */
  public async getUsuarios(planta_id: string) {
    try {
      const result = await this.pool.query(
        ` select p.num_emp, p.nom_completo, p.ci, p.cargo, p.foto, p.activo, u.rol_user
           from socio p 
           left join usuarios_admin u on p.num_emp = u.num_emp
           where p.planta_id = $1 `,
        [planta_id],
      );
      return {
        status: "ok",
        message: "lista de usuarios ",
        usuarios: result.rows,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

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

  public async asignarRol(num_emp: string, tipo: string, rol_user: string) {
    if (!num_emp || isNaN(+num_emp) || num_emp.length > 6) {
      throw CustomError.badRequest("El numero de empleado es requerido");
    }
    if (!tipo || tipo.trim() === "" || tipo.length > 8) {
      throw CustomError.badRequest("El rol es requerido");
    }
    if (tipo !== "global" && tipo !== "planta") {
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
      if (tipo === "planta" && rol_user === "admin-global") {
        //actualizar el rol
        const consult = await this.pool.query(
          `UPDATE usuarios_admin SET rol_user = $1, pass_hash = $2, updated_at = NOW(), user_token = null 
           WHERE usuario = $3 RETURNING *`,
          ["admin-regional", password, num_emp],
        );

        if (consult.rows.length === 0) {
          await this.pool.query(
            `insert into usuarios_admin( num_emp , usuario, pass_hash, rol_user )
                  values( $1, $2, $3, $4 )`,
            [num_emp, num_emp, password, "admin-regional"],
          );
        }
      } else if (tipo === "global" && rol_user === "admin-global") {
        const consult = await this.pool.query(
          `UPDATE usuarios_admin SET rol_user = $1, pass_hash = $2, updated_at = NOW(), user_token = null 
           WHERE usuario = $3 RETURNING *`,
          ["admin-global", password, num_emp],
        );

        if (consult.rows.length === 0) {
          await this.pool.query(
            `insert into usuarios_admin( num_emp , usuario, pass_hash, rol_user )
                  values( $1, $2, $3, $4 )`,
            [num_emp, num_emp, password, "admin-global"],
          );
        }
      } else {
        throw CustomError.badRequest(
          "Accion denegada, no tiene permiso para realizar esta accion",
        );
      }
      return {
        status: "ok",
        message: "Rol asignado exitosamente!",
      };
    } catch (error) {
      console.log(error);
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  //** actualizar datos del personal
  public async updateListUsers(num_emp: number, planta_id: string) {
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

  //** obtiene datos de un empleado para agregar nuevo socio */
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
}
