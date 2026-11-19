import { getPrestamo } from "@/user/actions/prestamos.action";
import { useQuery } from "@tanstack/react-query";
//* obtiene el prestamo actual pero no se esta utilizando ya que todo se trae con socio
export const useGetPrestamo = (socioId: number) => {
  return useQuery({
    queryKey: ["prestamo", socioId],
    queryFn: () => getPrestamo(socioId),
    enabled: !!socioId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};
