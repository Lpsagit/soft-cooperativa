import { getSocios } from "@/admin/actions/socios.action";
import { useQuery } from "@tanstack/react-query";

export const useSocios = () => {
  const query = useQuery({
    queryKey: ["socios"],
    queryFn: getSocios,
    select: (data) => data.socios ?? [],
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    socios: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
