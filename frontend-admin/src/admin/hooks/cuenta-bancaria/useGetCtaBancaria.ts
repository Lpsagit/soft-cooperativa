import { getCtaBancaria } from "@/admin/actions/cuenta-bancaria.action";
import { useQuery } from "@tanstack/react-query";

//* obtiene datos iniciales de la cuenta bancaria cooperativa
export const useGetCtaBancaria = () => {
  return useQuery({
    queryKey: ["cuenta-bancaria"],
    queryFn: () => getCtaBancaria(),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
