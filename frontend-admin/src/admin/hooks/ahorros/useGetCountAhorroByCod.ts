import { getCountAhorroByCod } from "@/admin/actions/ahorros.action";
import { useQuery } from "@tanstack/react-query";

export const useGetCountAhorroByCod = (codCuenta: string = "") => {
  return useQuery({
    queryKey: ["ctaAhorro", codCuenta],
    queryFn: () => getCountAhorroByCod(codCuenta),
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: !!codCuenta,
  });
};
