export class GetAhorroSocioDto {
  private constructor(public readonly socioId: number) {}
  static create(props: { [key: string]: any }): [string?, GetAhorroSocioDto?] {
    const { socioId } = props;
    if (isNaN(+socioId)) {
      return ["error en los datos proporcionados"];
    }

    return [undefined, new GetAhorroSocioDto(socioId)];
  }
}
