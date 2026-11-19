import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";
import { retiroAhorro } from "@/admin/actions/ahorros.action";
import { errorAlert, successAlert } from "@/lib/alerts";

interface Props {
  codCtaAhorro: string;
  monto: number;
  file: File;
}
export const useRetiroAhorro = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ codCtaAhorro, monto, file }: Props) =>
      retiroAhorro(codCtaAhorro, monto, file),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["ctaAhorro", variables.codCtaAhorro],
      });

      // También invalidamos la lista general de cuentas si existe
      await queryClient.invalidateQueries({ queryKey: ["ahorros"] });
      close();
      successAlert("Retiro realizado exitosamente");
    },
    onError: (error) => {
      close();
      errorAlert(
        typeof error === "string"
          ? error
          : "Error al momento de realizar el retiro, por favor intente mas tarde",
      );
    },
  });
};
