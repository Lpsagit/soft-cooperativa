import { getSocioById } from "@/admin/actions/socios.action";
import { useQuery } from "@tanstack/react-query";

export const useGetSocio = (cod_socio: string | null) => {
  const query = useQuery({
    queryKey: ["socio", cod_socio],
    queryFn: () => {
      if (!cod_socio) throw new Error("cod_socio es requerido");
      return getSocioById(cod_socio);
    },
    select: (data) => data.socio,
    enabled: !!cod_socio,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    socio: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
