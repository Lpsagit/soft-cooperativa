import { cooperativaApi } from "@/api/cooperativaApi";
import type { Socio } from "@/interfaces/socio.response";

export const updateSocioAction = async (
  socioLike: Partial<Socio>,
): Promise<Socio> => {
  try {
    const { data } = await cooperativaApi.post<Socio>(
      "/socio/update",
      socioLike,
    );

    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error || "Error desconocido al actualizar el socio"
    );
  }
};
