import { createAcountSocio } from "@/admin/actions/socios.action";
import { errorAlert, successAlert } from "@/lib/alerts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateAcountSocio = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (numEmp: string) => createAcountSocio(numEmp),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["socios"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["ahorros"],
      });
      successAlert("Cuenta creada con éxito!");
    },
    onError: (error) => {
      errorAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al crear la cuenta",
      );
    },
  });

  return mutation;
};
