import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";
import { errorAlert, successAlert } from "@/lib/alerts";
import {
  refinanciarPrestamo,
  type RefinanciarPrestamoProps,
} from "@/admin/actions/prestamos.action";

export const useApruebaRefinanciamiento = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (props: RefinanciarPrestamoProps) => refinanciarPrestamo(props),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        // invalidamos el antiguo prestamos para actualizar su estado
        queryKey: ["prestamo", variables.codPrestamo],
      });

      // invalidamos lista de prestamos para obtener la lista actualizada con el nuevo refinanciamnieto
      await queryClient.invalidateQueries({ queryKey: ["prestamos"] });

      close();
      successAlert("Refinanciamiento aprobado correctamente");
    },
    onError: (error) => {
      errorAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al aprobar el refinanciamiento",
      );
    },
  });
};
