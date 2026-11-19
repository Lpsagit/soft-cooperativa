import { regularExps } from "../../../config";

export class SocioUpdateDto {
  private constructor(
    public id: number,
    public codSocio: string,
    public email: string,
    public celular: string,
    public numReferencia: string,
    public direccion: string,
    public cuentaBancaria: string,
  ) {}
  static create(object: { [key: string]: any }): [string?, SocioUpdateDto?] {
    const {
      id,
      codSocio,
      email,
      celular,
      numReferencia,
      direccion,
      cuentaBancaria,
    } = object;

    if (!id) {
      return ["ID es requerido", undefined];
    }
    if (!codSocio) {
      return ["Código de socio es requerido", undefined];
    }
    if (codSocio.length > 10) {
      return ["Codigo demasiado largo", undefined];
    }

    if (!regularExps.email.test(email)) {
      return ["Email incorrecto", undefined];
    }
    if (!celular) {
      return ["Celular es requerido", undefined];
    }
    if (!regularExps.phone.test(celular)) {
      return ["Celular inválido", undefined];
    }
    if (!numReferencia) {
      return ["Número de referencia es requerido", undefined];
    }
    if (numReferencia.length > 100) {
      return ["Referencia demasiado larga", undefined];
    }
    if (!direccion) {
      return ["Dirección es requerida", undefined];
    }
    if (direccion.length > 150) {
      return ["La dirección es demasiado larga", undefined];
    }
    if (!cuentaBancaria) {
      return ["Cuenta bancaria es requerida", undefined];
    }

    return [
      undefined,
      new SocioUpdateDto(
        id,
        codSocio,
        email,
        celular,
        numReferencia,
        direccion,
        cuentaBancaria,
      ),
    ];
  }
}
