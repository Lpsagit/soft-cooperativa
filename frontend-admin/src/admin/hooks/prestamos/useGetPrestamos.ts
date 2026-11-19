import { getPrestamos } from "@/admin/actions/prestamos.action";
import { useQuery } from "@tanstack/react-query";

export const useGetPrestamos = () => {
  return useQuery({
    queryKey: ["prestamos"],
    queryFn: getPrestamos,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
