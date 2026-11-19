export interface DashboardResponse {
  status: string;
  message: string;
  dashboard: Dashboard;
}

interface Dashboard {
  aportesPorPagar: string;
  prestamosPorCobrar: string;
  totalSocios: string;
  saldoTeorico: string;
  descuentosPlanilla: DescuentosPlanilla;
  ultimosMovimientos: UltimosMovimiento[] | [];
  titular: TitularCtaCooperativaDashboard;
}

interface DescuentosPlanilla {
  aportes: number | 0;
  prestamos: number | 0;
  total: number | 0;
  mes: string;
}

export interface TitularCtaCooperativaDashboard {
  nombre: string;
  ctaBancariaCooperativa: string;
  nomBanco: string;
}

interface UltimosMovimiento {
  fecha: string;
  categoria: string;
  tipo_operacion: string;
  monto: string;
  detalle: string;
  id: number;
}
