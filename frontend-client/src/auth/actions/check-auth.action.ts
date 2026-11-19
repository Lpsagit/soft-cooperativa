import { cooperativaApi } from "@/api/cooperativaApi";
import type { AuthResponse } from "@/interfaces/auth.response";

export const checkAuthAction = async (): Promise<AuthResponse> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token no encontrado");
  try {
    const { data } =
      await cooperativaApi.get<AuthResponse>("/auth/check-status");
    localStorage.setItem("token", data.token);
    return data;
  } catch (error) {
    localStorage.removeItem("token");
    throw new Error("Token Expirado");
  }
};
