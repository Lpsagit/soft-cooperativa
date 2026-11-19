export interface SocioRespose {
  status: string;
  message: string;
  socio: Socio;
}

export interface Socio {
  id: number;
  codSocio: string;
  nombre: string;
  ci: string;
  extencion_ci: string | null;
  direccion: string | null;
  celular: string | null;
  plantaId: string;
  fechaIngreso: string;
  isActive: boolean;
  numReferencia: string | null;
  cuentaBancaria: string | null;
  foto: string | null;
  email: string | null;
  urlImageQrCoop: string | null;
  ahorro: Ahorro | null;
  prestamo: Prestamo | null;
}

export interface Ahorro {
  numCuenta: string;
  saldo: string;
  estado: string;
  fechaApertura: string;
  codigo: string;
  movimientoAhorro: MovimientoAhorro[];
}

export interface MovimientoAhorro {
  fecha: string;
  created_at: string;
  descripcion: string;
  tipo_operacion: string;
  periodo: string | null;
  ingreso: string | null;
  retiro: string | null;
  saldo_ahorro: string;
}

// export interface MovimientoAhorro {
//   id: number;
//   fecha: string;
//   tipo_operacion: string;
//   monto: string;
//   sentido: string;
//   saldo: string;
// }

export interface Prestamo {
  id: number;
  montoOtorgado: string;
  montoSolicitado: string;
  fechaOtorgado: string;
  saldo: string;
  estadoSoli: string;
  cuotaMensual: string;
  ultimaCuota: string;
  fecha: string;
  codigo: string;
  cuotas: number;
  cuotasRestates: number;
  totalPagado: number;
  cuotasList: Cuota[];
  estado: string;
  obs: string | null;
  movimientoPrestamo: MovimientoPrestamo[];
  amortizacion: Amortizacion[];
  refinanciamiento: Refinanciamiento[];
}
export interface Cuota {
  id: number;
  prestamo_id: number;
  monto: string;
  num_cuota: number;
  mes: string;
  anio: string;
  is_active: boolean;
  is_pay: boolean;
  fecha: string;
  created_at: string;
  updated_at: string;
}

export interface MovimientoPrestamo {
  fecha: string;
  created_at: string;
  tipo_movimiento: string;
  periodo: string | null;
  nro_cuota: number;
  descripcion: string;
  cargo: string;
  abono: string;
  saldo_capital: string;
}

export interface Amortizacion {
  id: number;
  prestamo_id: string;
  monto: string;
  saldo_original: string;
  nuevo_saldo: string;
  estado: string;
  is_active: boolean;
}

export interface Refinanciamiento {
  id: number;
  cuotas: number;
  monto_solicitado: string;
  saldo_original: string;
}

// export interface MovimientoPrestamo {
//   id: number;
//   fecha: string;
//   nro_cuota: number;
//   tipo_movimiento: string;
//   abono: string;
//   cargo: string;
//   sentido: string;
//   saldo_capital: string;
//   periodo: string;
// }
