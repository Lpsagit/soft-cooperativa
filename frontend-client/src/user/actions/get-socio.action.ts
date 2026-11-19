import { cooperativaApi } from "@/api/cooperativaApi";
import type { SocioRespose } from "@/interfaces/socio.response";

export const getSocio = async (): Promise<SocioRespose> => {
  try {
    const { data } = await cooperativaApi.get<SocioRespose>("/socio");
    console.log(data);
    return data;
  } catch (error) {
    throw new Error("El Socio no existe");
  }
};
