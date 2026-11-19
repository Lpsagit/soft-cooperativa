import { useMutation, useQuery } from "@tanstack/react-query";
import { getSocio } from "../actions/get-socio.action";
import { updateSocioAction } from "../actions/update-socio.action";
import { queryClient } from "@/lib/queryClient";

export const useSocio = () => {
  const query = useQuery({
    queryKey: ["socio"], // clave unica del cache  yyy ["socios", id] // un socio específico
    queryFn: () => getSocio(),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: updateSocioAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socio"] });
    },
  });
  return { ...query, mutation };
};
