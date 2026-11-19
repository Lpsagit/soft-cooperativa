import { regularExps } from "../../../config";

export class SocioCreateDto {
  private constructor(
    public numEmp: string,
    public nombre: string,
    public apellido: string,
    public email: string,
    public celular: string,
    public ci: string,
    public numReferencia: string,
    public direccion: string,
    public cuentaBancaria: string,
    public plantaId: string,
  ) {}

  static create(object: { [key: string]: any }): [string?, SocioCreateDto?] {
    const {
      numEmp,
      nombre,
      apellido,
      email,
      celular,
      ci,
      numReferencia,
      direccion,
      cuentaBancaria,
      plantaId,
    } = object;

    // Normalización
    const trim = (value: unknown): string | undefined =>
      typeof value === "string" ? value.trim() : undefined;

    const numEmpTrimmed = trim(numEmp);
    const nombreTrimmed = trim(nombre);
    const apellidoTrimmed = trim(apellido);
    const emailTrimmed = trim(email);
    const celularTrimmed = trim(celular);
    const ciTrimmed = trim(ci);
    const numReferenciaTrimmed = trim(numReferencia);
    const direccionTrimmed = trim(direccion);
    const cuentaBancariaTrimmed = trim(cuentaBancaria);
    const plantaIdTrimmed = trim(plantaId);

    // Validaciones
    if (!numEmpTrimmed) {
      return ["Número de empleado es requerido", undefined];
    }

    if (numEmpTrimmed.length > 5) {
      return ["Número de empleado demasiado largo", undefined];
    }

    if (!nombreTrimmed) {
      return ["Nombre es requerido", undefined];
    }

    if (!apellidoTrimmed) {
      return ["Apellido es requerido", undefined];
    }

    if (!plantaIdTrimmed) {
      return ["Planta es requerida", undefined];
    }

    if (!ciTrimmed) {
      return ["Cédula de identidad es requerida", undefined];
    }

    if (ciTrimmed.length > 10) {
      return ["Cédula de identidad demasiado larga", undefined];
    }

    if (!celularTrimmed) {
      return ["Celular es requerido", undefined];
    }

    if (!regularExps.phone.test(celularTrimmed)) {
      return ["Celular inválido", undefined];
    }

    return [
      undefined,
      new SocioCreateDto(
        numEmpTrimmed,
        nombreTrimmed,
        apellidoTrimmed,
        emailTrimmed ?? "",
        celularTrimmed,
        ciTrimmed,
        numReferenciaTrimmed ?? "",
        direccionTrimmed ?? "",
        cuentaBancariaTrimmed ?? "",
        plantaIdTrimmed,
      ),
    ];
  }
}
