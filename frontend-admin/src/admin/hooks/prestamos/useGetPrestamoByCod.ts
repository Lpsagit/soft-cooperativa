import { getPrestamoByCod } from "@/admin/actions/prestamos.action";
import { useQuery } from "@tanstack/react-query";

export const useGetPrestamoByCod = (codPrestamo: string) => {
  return useQuery({
    queryKey: ["prestamo", codPrestamo],
    queryFn: () => getPrestamoByCod(codPrestamo),
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: !!codPrestamo,
  });
};
