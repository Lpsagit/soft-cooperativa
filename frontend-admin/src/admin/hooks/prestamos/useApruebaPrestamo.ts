import { aceptarPrestamo } from "@/admin/actions/prestamos.action";
import { errorAlert, successAlert } from "@/lib/alerts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";

interface AprobarParams {
  codPrestamo: string;
  file: File;
}

export const useApruebaPrestamo = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ codPrestamo, file }: AprobarParams) =>
      aceptarPrestamo(codPrestamo, file),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        // Ahora sí usamos variables.codPrestamo sin errores
        queryKey: ["prestamo", variables.codPrestamo],
      });

      // También invalidamos la lista general de préstamos si existe
      await queryClient.invalidateQueries({ queryKey: ["prestamos"] });
      close();
      successAlert("Prestamo aprobado correctamente");
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
