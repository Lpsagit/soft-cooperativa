export interface CuentasAhorrosResponse {
  status: string;
  message: string;
  cuentasAhorro: CuentaAhorro[];
}

export interface CuentaAhorro {
  cod_socio: string;
  nom_completo: string;
  cuenta_ahorro_id: number;
  codigo: string;
  estado: string;
  fecha_operacion: string;
  saldo_actual: string;
  saldo_inicial: string;
  socio_id: number;
}
