import { getAhorros } from "@/admin/actions/ahorros.action";
import { useQuery } from "@tanstack/react-query";

export const useGetAhorros = () => {
  return useQuery({
    queryKey: ["ahorros"],
    queryFn: getAhorros,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
