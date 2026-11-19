import { cooperativaApi } from "@/api/cooperativaApi";
import type { AuthResponse } from "@/interfaces/auth.response";

export const loginAction = async (
  userName: String,
  password: string,
): Promise<AuthResponse> => {
  try {
    const { data } = await cooperativaApi.post<AuthResponse>("/auth/login", {
      userName,
      password,
    });
    //console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
