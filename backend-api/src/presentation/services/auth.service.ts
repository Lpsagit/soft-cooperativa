import {
  CustomError,
  LoginUserDto,
  ChangePassUserDto,
  UserEntity,
} from "../../domain";
import { PostgresDatabase } from "../../data";
import { bcryptAdapter, JwtAdapter } from "../../config";
import { Pool } from "pg";

export class AuthService {
  private readonly pool: Pool;
  // ID
  constructor() {
    this.pool = PostgresDatabase.getPool();
  }

  // ** para cambio de contraseña
  public async changePassUser(changePassUserDto: ChangePassUserDto) {
    const findUser = await this.pool.query(
      "SELECT * FROM usuario WHERE user_name = $1 and is_active = true",
      [changePassUserDto.userName],
    );

    if (findUser.rows.length == 0) {
      throw CustomError.badRequest("El usuario y/o contraseña son incorrectos");
    }

    const isMatch = bcryptAdapter.compare(
      changePassUserDto.password,
      findUser.rows[0].pass_hash,
    );

    if (!isMatch) {
      throw CustomError.badRequest("El usuario y/o contraseña son incorrectos");
    }

    const { id, user_name } = findUser.rows[0];

    const token = await JwtAdapter.generateToken({ id: id, user: user_name });
    if (!token) {
      throw CustomError.internalServer("Error al generar el token");
    }

    try {
      const updateToken = await this.pool.query(
        "UPDATE usuario SET user_token = $1 WHERE id = $2 and user_name = $3",
        [token, id, user_name],
      );

      //encriptar la contraseña
      changePassUserDto.newPassword = bcryptAdapter.hash(
        changePassUserDto.newPassword,
      );

      //actualizar la contraseña
      const consult = await this.pool.query(
        "UPDATE usuario SET pass_hash = $1, updated_at = NOW(), user_token = null WHERE user_name = $2  ",
        [changePassUserDto.newPassword, changePassUserDto.userName],
      );

      const responseUser = {
        status: "ok",
        message: "Contraseña actualizada correctamente",
      };

      return responseUser;
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  // ** login socio funcional
  public async loginUser(loginUserDto: LoginUserDto) {
    const result = await this.pool.query(
      "SELECT * FROM usuario WHERE user_name = $1 and is_active = true",
      [loginUserDto.userName],
    );

    if (result.rows.length == 0) {
      console.log(
        `Intento de login fallido user en fecha: ${new Date()}`,
        loginUserDto,
      );
      throw CustomError.badRequest("El usuario y/o contraseña son incorrectos");
    }

    const isMatch = bcryptAdapter.compare(
      loginUserDto.password,
      result.rows[0].pass_hash,
    );

    if (!isMatch) {
      console.log(
        `Intento de login fallido password en fecha: ${new Date()}`,
        loginUserDto,
      );
      throw CustomError.badRequest("El usuario y/o contraseña son incorrectos");
    }

    const { id, user_name } = result.rows[0];

    const token = await JwtAdapter.generateToken({ id: id, user: user_name });
    if (!token) {
      throw CustomError.internalServer("Error al generar el token");
    }

    console.log(
      `Login aceptado en fecha: ${new Date()} - usuario: ${loginUserDto.userName}`,
    );

    try {
      // Actualizar el token en la base de datos
      const updateToken = await this.pool.query(
        "UPDATE usuario SET user_token = $1 WHERE id = $2 and user_name = $3",
        [token, id, user_name],
      );
      const dataUser = await this.pool.query(
        `SELECT  s.cod_socio, s.planta_id, s.nom_completo as nombre, s.ci, s.extencion_ci, s.num_referencia, s.foto, s.is_active, s.celular,
                 s.direccion, s.cuenta_bancaria, s.sexo, s.fecha_naci
        FROM socio s, usuario u 
        WHERE s.id = u.socio_id and u.user_name = $1`,
        [user_name],
      );

      const responseUser = {
        status: "ok",
        message: "Login successful",
        user: {
          id: result.rows[0].id,
          userName: result.rows[0].user_name,
          nombre: dataUser.rows[0].nombre,
          foto: dataUser.rows[0].foto,
          planta: dataUser.rows[0].planta_id,
          codSocio: dataUser.rows[0].cod_socio,
        },
        token: token,
      };

      return responseUser;
    } catch (error) {
      throw CustomError.internalServer(
        `Error al actualizar el token: ${error}`,
      );
    }
  }

  //** TOKEN/URL  valida token DESDE URL OJO REVISAR SI NOS SERVIRA LUEGO
  public async validateUser(token: string) {
    const payload = await JwtAdapter.validateToken(token);
    if (!payload) {
      throw CustomError.unauthorized("Token no valido");
    }
    const { id, user } = payload as { id: string; user: string };
    if (!user) {
      throw CustomError.internalServer("user no esta en token");
    }
    if (!id) {
      throw CustomError.internalServer("id no esta en token");
    }
    const result = await this.pool.query(
      "SELECT * FROM usuario WHERE id = $1 and user_name = $2",
      [id, user],
    );
    if (result.rows.length == 0) {
      throw CustomError.unauthorized("Token no valido");
    }
    return {
      isAuthorized: true,
    };
  }

  //** renovar token funcional
  public async checkAuthStatus(user: UserEntity) {
    //console.log("usuario logeado:" + user.user_name);
    const { id, user_name } = user;
    const token = await JwtAdapter.generateToken({ id: id, user: user_name });
    if (!token) {
      throw CustomError.internalServer("Error al generar el token");
    }
    try {
      const updateToken = await this.pool.query(
        "UPDATE usuario SET user_token = $1 WHERE id = $2 and user_name = $3",
        [token, id, user_name],
      );
      const dataUser = await this.pool.query(
        `SELECT  s.cod_socio, s.planta_id, s.nom_completo as nombre, s.ci, s.extencion_ci, s.num_referencia, s.foto, s.is_active, s.celular,
                 s.direccion, s.cuenta_bancaria, s.sexo, s.fecha_naci
        FROM socio s, usuario u 
        WHERE s.id = u.socio_id and u.user_name = $1`,
        [user_name],
      );

      const responseUser = {
        status: "ok",
        message: "Login successful",
        user: {
          id,
          userName: user_name,
          nombre: dataUser.rows[0].nombre,
          foto: dataUser.rows[0].foto,
          planta: dataUser.rows[0].planta_id,
          codSocio: dataUser.rows[0].cod_socio,
        },
        token: token,
      };

      return responseUser;
    } catch (error) {
      throw CustomError.internalServer(
        `Error al actualizar el token: ${error}`,
      );
    }
  }

  //** ADMINISTRADOR *//
  // ** login
  public async loginUserAdmin(loginUserDto: LoginUserDto) {
    const result = await this.pool.query(
      "SELECT * FROM usuario_admin WHERE user_name = $1 and is_active = true",
      [loginUserDto.userName],
    );

    if (result.rows.length == 0) {
      console.log(
        `Admin - Intento de login fallido user en fecha: ${new Date()}`,
        loginUserDto,
      );
      throw CustomError.badRequest("El usuario y/o contraseña son incorrectos");
    }

    const isMatch = bcryptAdapter.compare(
      loginUserDto.password,
      result.rows[0].pass_hash,
    );

    if (!isMatch) {
      console.log(
        `Admin - Intento de login fallido password en fecha: ${new Date()}`,
        loginUserDto,
      );
      throw CustomError.badRequest("El usuario y/o contraseña son incorrectos");
    }
    //console.log(result.rows[0]);

    const { id, user_name: usuario } = result.rows[0];

    const token = await JwtAdapter.generateToken({
      id: id,
      user: usuario,
    });
    if (!token) {
      throw CustomError.internalServer("Error al generar el token");
    }

    try {
      console.log(
        `Admin - Login aceptado en fecha: ${new Date()} - usuario: ${loginUserDto.userName}`,
      );

      // Actualizar el token en la base de datos
      const updateToken = await this.pool.query(
        "UPDATE usuario_admin SET user_token = $1 WHERE id = $2 and user_name = $3 ",
        [token, id, usuario],
      );

      const dataUser = await this.pool.query(
        `SELECT  s.cod_socio, s.nom_completo as nombre, s.ci, s.extencion_ci, s.foto, s.is_active, u.user_name
        FROM socio s, usuario_admin u 
        WHERE s.id = u.socio_id and u.user_name = $1`,
        [usuario],
      );

      const responseUser = {
        status: "ok",
        message: "Login successful",
        user: {
          id: result.rows[0].cod_socio,
          userName: result.rows[0].user_name,
          nombre: dataUser.rows[0].nombre,
          foto: dataUser.rows[0].foto,
          ci: dataUser.rows[0].ci + dataUser.rows[0].extencion_ci,
          is_active: dataUser.rows[0].is_active,
        },
        token: token,
      };

      return responseUser;
    } catch (error) {
      throw CustomError.internalServer(
        `Error al actualizar el token: ${error}`,
      );
    }
  } // COMPLETADO

  //** renovar token admin
  public async checkAuthStatusAdmin(user_name: string, id: string) {
    const token = await JwtAdapter.generateToken({ id: id, user: user_name });
    if (!token) {
      throw CustomError.internalServer("Error al generar el token");
    }
    try {
      const updateToken = await this.pool.query(
        "UPDATE usuario_admin SET user_token = $1 WHERE id = $2 and user_name = $3",
        [token, id, user_name],
      );
      const dataUser = await this.pool.query(
        `SELECT  s.cod_socio, s.planta_id, s.nom_completo as nombre, s.ci, s.extencion_ci, s.num_referencia, s.foto, s.is_active, s.celular,
                 s.direccion, s.cuenta_bancaria, s.sexo, s.fecha_naci
        FROM socio s, usuario_admin u 
        WHERE s.id = u.socio_id and u.user_name = $1`,
        [user_name],
      );

      const responseUser = {
        status: "ok",
        message: "Login successful",
        user: {
          id,
          userName: user_name,
          nombre: dataUser.rows[0].nombre,
          foto: dataUser.rows[0].foto,
          planta: dataUser.rows[0].planta_id,
          codSocio: dataUser.rows[0].cod_socio,
        },
        token: token,
      };

      return responseUser;
    } catch (error) {
      throw CustomError.internalServer(
        `Error al actualizar el token: ${error}`,
      );
    }
  } // completado

  public async changePassAdmin(user: string, pass: string) {
    //const pool = PostgresDatabase.getPool();
    const result = await this.pool.query(
      "SELECT * FROM usuarios_admin WHERE usuario = $1",
      [user],
    );
    if (result.rows.length == 0) {
      throw CustomError.badRequest("El nombre de usuario no existe");
    }

    try {
      //encriptar la contraseña
      pass = bcryptAdapter.hash(pass);

      //actualizar la contraseña
      const consult = await this.pool.query(
        "UPDATE usuarios_admin SET pass_hash = $1, updated_at = NOW(), user_token = null WHERE usuario = $2 RETURNING *",
        [pass, user],
      );

      const responseUser = {
        status: "ok",
        message: "Contraseña actualizada correctamente",
        pass: consult.rows[0],
      };

      return responseUser;
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
  // TODO: REVISAR
  public async changePassUserAdmin(changePassUserDto: ChangePassUserDto) {
    const findUser = await this.pool.query(
      "SELECT * FROM usuario_admin WHERE user_name = $1 and is_active = true",
      [+changePassUserDto.userName],
    );

    if (findUser.rows.length == 0) {
      throw CustomError.badRequest("El usuario y/o contraseña son incorrectos");
    }

    const isMatch = bcryptAdapter.compare(
      changePassUserDto.password,
      findUser.rows[0].pass_hash,
    );

    if (!isMatch) {
      throw CustomError.badRequest("El usuario y/o contraseña son incorrectos");
    }

    const { id, user_name } = findUser.rows[0];

    const token = await JwtAdapter.generateToken({ id: id, user: user_name });
    if (!token) {
      throw CustomError.internalServer("Error al generar el token");
    }

    try {
      const updateToken = await this.pool.query(
        "UPDATE usuario_admin SET user_token = $1 WHERE id = $2 and user_name = $3",
        [token, id, +user_name],
      );

      //encriptar la contraseña
      changePassUserDto.newPassword = bcryptAdapter.hash(
        changePassUserDto.newPassword,
      );

      //actualizar la contraseña
      const consult = await this.pool.query(
        "UPDATE usuario_admin SET pass_hash = $1, updated_at = NOW(), user_token = null WHERE user_name = $2  ",
        [changePassUserDto.newPassword, +changePassUserDto.userName],
      );

      const responseUser = {
        status: "ok",
        message: "Contraseña actualizada correctamente adm",
      };

      return responseUser;
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
