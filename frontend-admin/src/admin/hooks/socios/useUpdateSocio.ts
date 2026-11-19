import { updateSocio } from "@/admin/actions/socios.action";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

type UpdateSocioForm = {
  socio: {
    id: number;
    codSocio: string;
    email: string;
    celular: string;
    numReferencia: string;
    direccion: string;
    cuentaBancaria?: string;
  };
};

export const useUpdateSocio = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdateSocioForm) => updateSocio(data),
    onSuccess: async (_, variables) => {
      console.log("invalidando:", variables);
      await queryClient.invalidateQueries({
        queryKey: ["socio", variables.socio.codSocio],
      });
      await queryClient.invalidateQueries({
        queryKey: ["socios"],
      });
    },
  });
  return mutation;
};
