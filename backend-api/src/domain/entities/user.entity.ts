import { CustomError } from "../errors/custom.error";

export class UserEntity {
  constructor(
    public id: string,
    public user_name: string,
    public is_active: boolean,
    public pass_hash: string,
    public socio_id: string,
    public exp_token?: string,
    public user_token?: string,
  ) {}

  static fromObject(object: { [key: string]: any }) {
    const {
      id,
      user_name,
      is_active,
      pass_hash,
      socio_id,
      exp_token,
      user_token,
    } = object;

    if (!id) {
      throw CustomError.badRequest("id es requerido");
    }
    if (!user_name) {
      throw CustomError.badRequest("nombre de usuario es requerido");
    }
    if (is_active === undefined) {
      throw CustomError.badRequest("activo es requerido");
    }
    if (!pass_hash) {
      throw CustomError.badRequest("passHash es requerido");
    }
    if (!socio_id) {
      throw CustomError.badRequest("socioId es requerido");
    }

    return new UserEntity(
      id,
      user_name,
      is_active,
      pass_hash,
      socio_id,
      exp_token,
      user_token,
    );
  }
}
