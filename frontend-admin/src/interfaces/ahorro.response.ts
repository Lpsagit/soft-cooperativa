export interface CtaAhorroResponse {
  status: string;
  message: string;
  ctaAhorro: CtaAhorro;
  movimientos: Movimiento[];
}

export interface CtaAhorro {
  nom_completo: string;
  foto: string | null;
  id: number;
  socio_id: number;
  numero_cuenta: string;
  saldo_actual: string;
  saldo_inicial: string | null;
  is_active: boolean;
  estado: string;
  fecha_operacion: string;
  created_at: string;
  updated_at: string;
  codigo: string;
}

// export interface Movimiento {
//   movimiento_id: number;
//   codigo: string;
//   numero_cuenta: string;
//   fecha: Date;
//   tipo_operacion: string;
//   monto: string;
//   motivo: string | null;
//   saldo: string;
// }

export interface CtaAhorroResponseCorta {
  status: string;
  message: string;
  ctaAhorro: CtaAhorroCorta;
}

export interface CtaAhorroCorta extends Pick<
  CtaAhorro,
  "socio_id" | "codigo" | "estado" | "saldo_actual"
> {
  cod_socio: string;
}

export interface Movimiento {
  fecha: string;
  created_at: string;
  descripcion: string;
  tipo_operacion: string;
  periodo: string | null;
  ingreso: string | null;
  retiro: string | null;
  saldo_ahorro: string;
}
