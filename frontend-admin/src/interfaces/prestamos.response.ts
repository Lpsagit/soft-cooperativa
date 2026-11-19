// export interface PrestamosResponse {
//   status: string;
//   message: string;
//   prestamos: Prestamo[];
// }

// export interface Prestamo {
//   prestamo_id: number;
//   cod_socio: string;
//   nom_completo: string;
//   codigo: string;
//   estado: string;
//   fecha_otorgado: string | null;
//   monto_otorgado: number;
//   saldo_actual: number;
//   saldo_inicial: number;
//   solicitud: string | null; //! en el backend validar ya que sera para las solicitudes del prestamo
// }

export interface PrestamosResponse {
  message: string;
  status: string;
  prestamos: PrestamoList[];
}

export interface PrestamoList {
  id: number;
  codigo: string;
  fecha_otorgado: string | null;
  monto_otorgado: null | string;
  saldo_actual: string;
  estado: string;
  estado_soli: string;
  nom_completo: string;
  cod_socio: string;
  socio_id: number;
}
