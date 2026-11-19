import { cooperativaApi } from "@/api/cooperativaApi";
import type { AuthResponse } from "@/interfaces/auth.response";

export const loginAction = async (
  userName: String,
  password: string,
): Promise<AuthResponse> => {
  try {
    const { data } = await cooperativaApi.post<AuthResponse>(
      "/auth/login/admin",
      {
        userName,
        password,
      },
    );
    //console.log(data);
    return data;
  } catch (error: any) {
    console.error(
      "Error al obtener socios:",
      error?.response?.data || error.message,
    );
    throw error;
  }
};
