import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";
import { errorAlert, successAlert } from "@/lib/alerts";
import { depositoAhorro } from "@/admin/actions/ahorros.action";

interface AprobarParams {
  codCtaAhorro: string;
  monto: number;
  file: File;
}

export const useDepositoAhorro = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ codCtaAhorro, monto, file }: AprobarParams) =>
      depositoAhorro(codCtaAhorro, monto, file),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["ctaAhorro", variables.codCtaAhorro],
      });

      // También invalidamos la lista general de cuentas si existe
      await queryClient.invalidateQueries({ queryKey: ["ahorros"] });
      close();
      successAlert("Deposito insertado correctamente");
    },
    onError: (error) => {
      close();
      errorAlert(
        typeof error === "string"
          ? error
          : "Error al momento de realizar el deposito, por favor intente mas tarde",
      );
    },
  });
};
