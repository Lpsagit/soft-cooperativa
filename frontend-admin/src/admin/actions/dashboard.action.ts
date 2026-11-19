import { cooperativaApi } from "@/api/cooperativaApi";
import type { DashboardResponse } from "@/interfaces/dashboard.response";

//* obtiene datos generales para el dashboard
export const getDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const { data } = await cooperativaApi.get<DashboardResponse>("/dashboard");
    console.log(data);
    return data;
  } catch (error: any) {
    if (error.response) {
      console.log("error:", error.response.data);
    }
    throw (
      error.response.data.error || `Error al obtener datos desde el server.`
    );
  }
};
