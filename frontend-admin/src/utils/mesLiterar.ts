export const mesLiteral = (mes: string): string => {
  const meses: Record<string, string> = {
    //CAMBIA LOS NOMBRES DE MINUSCULAS A MAYUSCULAS

    "01": "ENERO",
    "02": "FEBRERO",
    "03": "MARZO",
    "04": "ABRIL",
    "05": "MAYO",
    "06": "JUNIO",
    "07": "JULIO",
    "08": "AGOSTO",
    "09": "SEPTIEMBRE",
    "10": "OCTUBRE",
    "11": "NOVIEMBRE",
    "12": "DICIEMBRE",
  };

  return meses[mes] || "Mes inválido";
};
