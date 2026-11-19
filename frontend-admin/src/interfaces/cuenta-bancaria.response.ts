// export interface CuentaBancariaResponse {
//   status: string;
//   message: string;
//   cuentasAhorro: MovimientoCuentaBancaria[];
// }

// export interface MovimientoCuentaBancaria {
//   id: number;
//   fecha: string;
//   tipo_operacion: string;
//   categoria: string;
//   comprobante: string | null;
//   detalle: string | null;
//   monto: number;
//   saldo: number;
// }

export interface CuentaBancariaResponse {
  status: string;
  message: string;
  ctaBancaria: CtaBancaria;
  movimientos: MovimientoBancario[];
}

export interface CtaBancaria {
  nom_completo: string;
  cod_socio: string;
  id: number;
  socio_id: number;
  nom_banco: string;
  nro_cuenta: string;
  is_active: boolean;
  tipo_cuenta: string | null;
  ruta_qr: string | null;
  created_at: string;
  updated_at: string;
  codigo: string;
  saldo_fisico: string | null;
  safi: string | null;
  saldoActual: string;
}

export interface MovimientoBancario {
  id: number;
  cuenta_bancaria_id: number;
  fecha: string;
  monto: string;
  tipo_operacion: TipoOperacion;
  categoria: Categoria;
  comprobante: string | null;
  created_at: string;
  updated_at: string;
  asiento_contable_id: number | null;
  detalle: string | null;
  sentido: Sentido;
  motivo: string | null;
}

export type Categoria =
  | "AHORRO"
  | "PRESTAMO"
  | "RC_IVA"
  | "AJUSTE"
  | "INTERESES"
  | "OTROS";

export type Sentido = "AUMENTA" | "DISMINUYE";

export type TipoOperacion = "DEPOSITO" | "RETIRO";
