import { rechazarPrestamo } from "@/admin/actions/prestamos.action";
import { errorAlert, successAlert } from "@/lib/alerts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";

interface RechazaParams {
  codPrestamo: string;
  obs: string;
}

export const useRechazaPrestamo = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ codPrestamo, obs }: RechazaParams) =>
      rechazarPrestamo(codPrestamo, obs),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        // Ahora sí usamos variables.codPrestamo sin errores
        queryKey: ["prestamo", variables.codPrestamo],
      });
      // También invalidamos la lista general de préstamos si existe
      await queryClient.invalidateQueries({ queryKey: ["prestamos"] });
      close();
      successAlert("Préstamo rechazado");
    },
    onError: (error) => {
      errorAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al aprobar el prestamo",
      );
    },
  });
};
