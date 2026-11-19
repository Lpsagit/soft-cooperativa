export interface SociosListResponse {
  status: string;
  message: string;
  socios: Socio[];
}

export interface Socio {
  id: number;
  cod_socio: string;
  nom_completo: string;
  ci: string;
  extencion_ci: string | null;
  direccion: string | null;
  celular: string | null;
  planta_id: string;
  fecha_ingreso: string;
  is_active: boolean;
  num_referencia: string | null;
  cuenta_bancaria: string | null;
  created_at?: string;
  updated_at?: string;
  foto: string | null;
  sexo?: string | null;
  fecha_naci?: string | null;
  email: string | null;

  user_socio?: string;
  user_admin?: string | null;
}

export interface SocioResponse {
  status: string;
  message: string;
  socio: Socio;
}
