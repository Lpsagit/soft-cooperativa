export interface AuthResponse {
  status: string;
  message: string;
  user: UserAuth;
  token: string;
}
// solo para el login
export interface UserAuth {
  id: number;
  userName: string;
  nombre: string;
  foto: string;
  planta: string;
  codSocio: string;
}
