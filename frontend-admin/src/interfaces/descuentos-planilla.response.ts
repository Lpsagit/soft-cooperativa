export interface DescuentosPlanillaResponse {
  status: string;
  message: string;
  descuentoPlanilla: DescuentoPlanilla | null;
  listDescuento: ListDescuento[] | [];
}

export interface DescuentoPlanilla {
  id: number;
  mes: string;
  anio: string;
  fecha_registro: string;
  is_discounted: boolean;
  is_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListDescuento {
  id: number;
  num_emp: string;
  socio_nombre: string;
  monto_ahorro: string;
  monto_prestamo: string | null;
  monto_total: string;
  estado_descuento: string;
  cuotas_descontadas: string;
  created_at: string;
  obs: string | null;
}
