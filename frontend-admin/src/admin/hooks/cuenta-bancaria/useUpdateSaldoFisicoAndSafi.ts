import {
  updateSaldoFisicoAndSafi,
  type SaldoFisicoSafiProps,
} from "@/admin/actions/cuenta-bancaria.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";
import { errorAlert, successAlert } from "@/lib/alerts";

export const useUpdateSaldoFisicoAndSafi = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (props: SaldoFisicoSafiProps) =>
      updateSaldoFisicoAndSafi(props),
    onSuccess: async (data) => {
      console.log("Saldo actualizado correctamente:", data);
      await queryClient.invalidateQueries({
        queryKey: ["cuenta-bancaria"],
      });
      close();
      successAlert(data.message || "SAFI actualizado correctamente.");
    },
    onError: (error) => {
      console.error("Error al actualizar el saldo:", error);
      errorAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al aprobar la amortización",
      );
    },
  });
};
