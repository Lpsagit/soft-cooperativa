import { regularExps } from "../../../config";

export class LoginUserDto {
  private constructor(
    public userName: string,
    public password: string,
  ) {}
  static create(object: { [key: string]: any }): [string?, LoginUserDto?] {
    const { userName, password } = object;

    if (!userName) {
      return ["Nombre de usuario es requerido", undefined];
    }

    if (!password) {
      return ["Contraseña es requerida", undefined];
    }
    if (password.length < 5) {
      return ["Contraseña es requerida", undefined];
    }

    return [undefined, new LoginUserDto(userName, password)];
  }
}
