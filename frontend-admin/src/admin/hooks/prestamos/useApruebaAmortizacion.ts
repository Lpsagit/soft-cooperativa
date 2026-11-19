import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";
import { errorAlert, successAlert } from "@/lib/alerts";
import {
  type AmortizarPrestamoProps,
  amortizarPrestamo,
} from "@/admin/actions/prestamos.action";

export const useApruebaAmortizacion = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (props: AmortizarPrestamoProps) => amortizarPrestamo(props),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        // invalidamos el antiguo prestamos para actualizar su estado
        queryKey: ["prestamo", variables.codPrestamo],
      });

      // invalidamos lista de prestamos para obtener la lista actualizada con los datos actualizados
      await queryClient.invalidateQueries({ queryKey: ["prestamos"] });

      close();
      successAlert("Amortización aprobada correctamente");
    },
    onError: (error) => {
      errorAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al aprobar la amortización",
      );
    },
  });
};
