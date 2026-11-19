interface Cuota {
  nro_cuota: number;
  monto: number;
  mes: number;
  anio: number;
  saldo_capital: number;
}

export const generateCuotas = (
  montoTotal: number,
  numeroCuotas: number,
): Cuota[] => {
  const cuotas: Cuota[] = [];
  const fechaReferencia = new Date();

  // Configuramos el inicio: Mes siguiente al actual (+1)
  // Nota: JS maneja automáticamente el cambio de año si el mes supera 11
  let mesInicio = fechaReferencia.getMonth() + 1;
  let anioInicio = fechaReferencia.getFullYear();

  const cuotaBase = Math.floor((montoTotal / numeroCuotas) * 100) / 100;
  let acumulado = 0;

  let saldoRestante = montoTotal;

  for (let i = 1; i <= numeroCuotas; i++) {
    // Creamos un objeto de fecha para cada cuota para que JS calcule
    // automáticamente los saltos de año (ej. de Diciembre a Enero)
    const fechaCuota = new Date(anioInicio, mesInicio + (i - 1), 1);

    const esUltima = i === numeroCuotas;
    const monto = esUltima
      ? Number((montoTotal - acumulado).toFixed(2))
      : cuotaBase;

    saldoRestante = Number((saldoRestante - monto).toFixed(2));
    cuotas.push({
      nro_cuota: i,
      monto: monto,
      mes: fechaCuota.getMonth() + 1, // +1 para formato humano (1-12)
      anio: fechaCuota.getFullYear(),
      saldo_capital: esUltima ? 0 : Math.max(0, saldoRestante),
    });

    if (!esUltima) acumulado += cuotaBase;
  }

  return cuotas;
};

export const generateCuotasPorMontoMensual = (
  saldoActual: number,
  montoMensual: number,
  nroCuotasInicial: number = 1,
): Cuota[] => {
  const cuotas: Cuota[] = [];

  const MINIMA_ULTIMA_CUOTA = 50;

  // Validaciones
  if (saldoActual <= 0 || montoMensual <= 0) {
    return cuotas;
  }

  const fechaReferencia = new Date();

  // El nuevo plan comienza el mes siguiente
  const mesInicio = fechaReferencia.getMonth() + 1;
  const anioInicio = fechaReferencia.getFullYear();

  const saldo = Number(saldoActual.toFixed(2));
  const cuotaMensual = Number(montoMensual.toFixed(2));

  // Cantidad de cuotas mensuales completas
  const cuotasCompletas = Math.floor(saldo / cuotaMensual);

  // Residuo después de las cuotas completas
  const residuo = Number((saldo - cuotasCompletas * cuotaMensual).toFixed(2));

  // ============================================================
  // CASO 1:
  // El saldo se paga exactamente con cuotas completas.
  // ============================================================

  if (residuo === 0) {
    for (let i = 0; i < cuotasCompletas; i++) {
      const nroCuota = nroCuotasInicial + i;

      const fechaCuota = new Date(anioInicio, mesInicio + i, 1);

      const saldoCapital = Number((saldo - cuotaMensual * (i + 1)).toFixed(2));

      cuotas.push({
        nro_cuota: nroCuota,
        monto: cuotaMensual,
        mes: fechaCuota.getMonth() + 1,
        anio: fechaCuota.getFullYear(),
        saldo_capital: Math.max(0, saldoCapital),
      });
    }

    return cuotas;
  }

  // ============================================================
  // CASO 2:
  // El residuo es menor a Bs 50.
  //
  // En lugar de crear una cuota adicional pequeña,
  // el residuo se suma a la última cuota mensual.
  //
  // Ejemplo:
  //
  // cuota mensual = 714.28
  // residuo       = 20.00
  //
  // última cuota = 734.28
  // ============================================================

  if (residuo < MINIMA_ULTIMA_CUOTA && cuotasCompletas > 0) {
    for (let i = 0; i < cuotasCompletas; i++) {
      const nroCuota = nroCuotasInicial + i;

      const fechaCuota = new Date(anioInicio, mesInicio + i, 1);

      const esUltima = i === cuotasCompletas - 1;

      const monto = esUltima
        ? Number((cuotaMensual + residuo).toFixed(2))
        : cuotaMensual;

      const saldoCapital = esUltima
        ? 0
        : Number((saldo - cuotaMensual * (i + 1)).toFixed(2));

      cuotas.push({
        nro_cuota: nroCuota,
        monto,
        mes: fechaCuota.getMonth() + 1,
        anio: fechaCuota.getFullYear(),
        saldo_capital: Math.max(0, saldoCapital),
      });
    }

    return cuotas;
  }

  // ============================================================
  // CASO 3:
  // El residuo es Bs 50 o mayor.
  //
  // Se genera una cuota adicional por el residuo.
  // ============================================================

  for (let i = 0; i < cuotasCompletas; i++) {
    const nroCuota = nroCuotasInicial + i;

    const fechaCuota = new Date(anioInicio, mesInicio + i, 1);

    const saldoCapital = Number((saldo - cuotaMensual * (i + 1)).toFixed(2));

    cuotas.push({
      nro_cuota: nroCuota,
      monto: cuotaMensual,
      mes: fechaCuota.getMonth() + 1,
      anio: fechaCuota.getFullYear(),
      saldo_capital: Math.max(0, saldoCapital),
    });
  }

  // Última cuota por el residuo
  const nroUltimaCuota = nroCuotasInicial + cuotasCompletas;

  const fechaUltimaCuota = new Date(anioInicio, mesInicio + cuotasCompletas, 1);

  cuotas.push({
    nro_cuota: nroUltimaCuota,
    monto: residuo,
    mes: fechaUltimaCuota.getMonth() + 1,
    anio: fechaUltimaCuota.getFullYear(),
    saldo_capital: 0,
  });

  return cuotas;
};

// export const generateCuotasPorMontoMensual = (
//   saldoActual: number,
//   montoMensual: number,
//   nroCuotasInicial: number = 1,
// ): Cuota[] => {
//   const cuotas: Cuota[] = [];
//   const fechaReferencia = new Date();

//   // El plan de pagos inicia el mes siguiente al actual (+1)
//   let mesInicio = fechaReferencia.getMonth() + 1;
//   let anioInicio = fechaReferencia.getFullYear();

//   let saldoRestante = Number(saldoActual.toFixed(2));
//   let nroCuota = nroCuotasInicial;

//   // Validación de seguridad para evitar bucles infinitos
//   if (montoMensual <= 0 || saldoActual <= 0) {
//     return cuotas;
//   }

//   while (saldoRestante > 0) {
//     // Calculamos el salto de meses automático usando el constructor de Date
//     const fechaCuota = new Date(anioInicio, mesInicio + (nroCuota - 1), 1);

//     let montoCuota = montoMensual;

//     // Si el saldo restante es menor que la cuota fija mensual,
//     // significa que esta es la última cuota (el residuo final)
//     if (saldoRestante < montoMensual) {
//       montoCuota = saldoRestante;
//     }

//     saldoRestante = Number((saldoRestante - montoCuota).toFixed(2));

//     cuotas.push({
//       nro_cuota: nroCuota,
//       monto: Number(montoCuota.toFixed(2)),
//       mes: fechaCuota.getMonth() + 1, // Formato humano (1-12)
//       anio: fechaCuota.getFullYear(),
//       saldo_capital: saldoRestante,
//     });

//     nroCuota++;
//   }

//   return cuotas;
// };
