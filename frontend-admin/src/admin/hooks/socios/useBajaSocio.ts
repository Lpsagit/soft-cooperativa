import { bajaSocio } from "@/admin/actions/socios.action";
import { errorAlert, successAlert } from "@/lib/alerts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";

type SocioBaja = {
  codigoSocio: string;
  socioId: number;
};

export const useBajaSocio = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ codigoSocio, socioId }: SocioBaja) =>
      bajaSocio(codigoSocio, socioId),
    onSuccess: async (data, variables: SocioBaja) => {
      await queryClient.invalidateQueries({
        queryKey: ["socios"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["socio", variables.codigoSocio],
      });
      close();
      successAlert(data.message || "Socio dado de baja con éxito!");
    },
    onError: (error) => {
      errorAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al dar de baja al socio",
      );
    },
  });

  return mutation;
};
