interface Cuota {
  nro_cuota: number;
  monto: number;
}

const CUOTAS_VALIDAS = [4, 6, 10, 14];

export const generateCuotas = (
  montoTotal: number,
  numeroCuotas: number,
): Cuota[] => {
  if (!CUOTAS_VALIDAS.includes(numeroCuotas)) {
    throw new Error(
      `Número de cuotas no válido. Solo se permite: ${CUOTAS_VALIDAS.join(", ")}`,
    );
  }
  const cuotas: Cuota[] = [];

  // 1. Usamos Math.floor para la cuota base para evitar que la última cuota
  // sea negativa o demasiado pequeña en casos de redondeo al alza.
  const cuotaBase = Math.floor((montoTotal / numeroCuotas) * 100) / 100;

  let acumulado = 0;

  for (let i = 1; i < numeroCuotas; i++) {
    cuotas.push({
      nro_cuota: i,
      monto: cuotaBase,
    });
    acumulado += cuotaBase;
  }

  // 2. La última cuota siempre es la diferencia exacta
  // Redondeamos al final para limpiar residuos de punto flotante
  const ultimaCuota = Number((montoTotal - acumulado).toFixed(2));

  cuotas.push({
    nro_cuota: +numeroCuotas,
    monto: ultimaCuota,
  });

  return cuotas;
};

//* Nueva función para calcular amortización
export const calculateAmortization = (
  montoRestante: number,
  cuotaMensual: number,
) => {
  if (montoRestante <= 0 || cuotaMensual <= 0) {
    return {
      numeroCuotas: 0,
      montoMensual: 0,
      montoUltimoMes: 0,
    };
  }

  const numeroCuotas = Math.ceil(montoRestante / cuotaMensual);
  const residuo = montoRestante % cuotaMensual;
  const montoUltimoMes =
    residuo === 0 ? cuotaMensual : Number(residuo.toFixed(2));

  return {
    numeroCuotas,
    montoMensual: cuotaMensual,
    montoUltimoMes,
  };
};
