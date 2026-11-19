import {
  updateCodQR,
  type UpdateCodQrProps,
} from "@/admin/actions/cuenta-bancaria.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";
import { errorAlert, successAlert } from "@/lib/alerts";

export const useUpdateCodQR = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (props: UpdateCodQrProps) => updateCodQR(props),
    onSuccess: async (data) => {
      console.log("QR actualizado correctamente:", data);
      await queryClient.invalidateQueries({
        queryKey: ["cuenta-bancaria"],
      });
      close();
      successAlert(data.message || "QR actualizado correctamente.");
    },
    onError: (error) => {
      console.error("Error al actualizar el saldo:", error);
      errorAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al actualizar el QR.",
      );
    },
  });
};
