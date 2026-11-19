interface Cuota {
  nro_cuota: number;
  monto: number;
}

const CUOTAS_VALIDAS = [4, 6, 10, 12, 14];

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
// export const calculateAmortization = (
//   montoRestante: number,
//   cuotaMensual: number,
// ) => {
//   if (montoRestante <= 0 || cuotaMensual <= 0) {
//     return {
//       numeroCuotas: 0,
//       montoMensual: 0,
//       montoUltimoMes: 0,
//     };
//   }

//   const numeroCuotas = Math.ceil(montoRestante / cuotaMensual);
//   const residuo = montoRestante % cuotaMensual;
//   const montoUltimoMes =
//     residuo === 0 ? cuotaMensual : Number(residuo.toFixed(2));

//   return {
//     numeroCuotas,
//     montoMensual: cuotaMensual,
//     montoUltimoMes,
//   };
// };

//* Funcion actualizada apra generar cuotas de amortización
export const calculateAmortization = (
  montoRestante: number,
  cuotaMensual: number,
) => {
  const MINIMA_ULTIMA_CUOTA = 50;

  if (montoRestante <= 0 || cuotaMensual <= 0) {
    return {
      numeroCuotas: 0,
      montoMensual: 0,
      montoUltimoMes: 0,
    };
  }

  const saldo = Number(montoRestante.toFixed(2));
  const cuota = Number(cuotaMensual.toFixed(2));

  // Cantidad de cuotas completas
  const cuotasCompletas = Math.floor(saldo / cuota);

  // Saldo que queda después de las cuotas completas
  const residuo = Number((saldo - cuotasCompletas * cuota).toFixed(2));

  // Se paga exactamente con cuotas completas
  if (residuo === 0) {
    return {
      numeroCuotas: cuotasCompletas,
      montoMensual: cuota,
      montoUltimoMes: cuota,
    };
  }

  // Si el residuo es menor a Bs 50,
  // se suma a la última cuota completa.
  if (residuo < MINIMA_ULTIMA_CUOTA && cuotasCompletas > 0) {
    return {
      numeroCuotas: cuotasCompletas,
      montoMensual: cuota,
      montoUltimoMes: Number((cuota + residuo).toFixed(2)),
    };
  }

  // El residuo es >= Bs 50, por lo tanto
  // se genera una última cuota adicional.
  return {
    numeroCuotas: cuotasCompletas + 1,
    montoMensual: cuota,
    montoUltimoMes: residuo,
  };
};
