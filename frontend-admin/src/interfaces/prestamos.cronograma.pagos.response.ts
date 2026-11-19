export interface PrestamoCronogramaPagosResponse {
  status: string;
  message: string;
  movimientos: CronogramaPagosPrestamo[];
}

// ver la posibilidad de incorporar periodo en lugar de ames y anio
export interface CronogramaPagosPrestamo {
  nro_cuota: number;
  mes: string;
  anio: string;
  monto: number;
  saldo: number;
  estado: string;
}
