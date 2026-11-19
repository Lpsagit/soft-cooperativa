import { getCtaAhorroByCodSocio } from "@/admin/actions/ahorros.action";
import { useMutation } from "@tanstack/react-query";

export const useGetSaldoAhorroByCodSoc = () => {
  // UTILIZAREMOS MITATE PARA LA CARGA DE DATOS
  return useMutation({
    mutationFn: (codSocio: string) => getCtaAhorroByCodSocio(codSocio),
  });
};
