export interface PrestamoResponse {
  message: string;
  status: string;
  prestamo: Prestamo;
}

export interface Prestamo {
  id: number;
  socio_id: number;
  estado: string;
  estado_amortizacion: string;
  is_active: boolean;
  monto_otorgado: string | null;
  saldo_actual: string | null;
  fecha_solicitud: string;
  fecha_otorgado: string | null;
  num_cuotas: number;
  cuota_mensual: string;
  ultima_cuota: string;
  is_refinanciado: boolean;
  created_at: string;
  updated_at: string;
  codigo: string;
  obs: string | null;
  monto_solicitado: string;
  estado_soli: string;
  nom_completo: string;
  cod_socio: string;
  foto: string | null;
  cuotasRestates: number;
  totalPagado: string;
  amortizado: Amortizado | null;
  refinanciado: Refinanciado | null;
  cuotasList: Cuota[];
  movimientos: MovimientoPrestamo[];
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

export interface Amortizado {
  id: number;
  prestamo_id: number;
  monto: string;
  estado: string;
  fecha: string;
  obs: string | null;
  is_active: boolean;
  comprobante: string | null;
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

export interface Refinanciado {
  id: number;
  prestamo_id: number;
  fecha: string | null;
  saldo_original: string;
  monto_solicitado: string;
  monto_total_propuesto: string | null;
  estado: string;
  cuotas: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
