// export interface PrestamoCronogramaPagosResponse {
//   status: string;
//   message: string;
//   movimientos: CronogramaPagosPrestamo[];
// }

// ver la posibilidad de incorporar periodo en lugar de ames y anio
export interface CronogramaPrestamo {
  nro_cuota: number;
  periodo: string;
  monto: string;
  saldo_capital: string; //! puede ser opcional, tomar en cuenta en el backend
  estado?: string; //* posiblemente nos sea necesario
}
