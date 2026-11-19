import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";
import { cargarExcelDescuentoPlanilla } from "@/admin/actions/descuentos.action";
import { errorAlert, successAlert } from "@/lib/alerts";

interface Params {
  idDescuentoPlanilla: number;
  file: File;
  mes: string;
  anio: string;
}

export const useCargarExcelDescuentoPlanilla = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idDescuentoPlanilla, file }: Params) =>
      cargarExcelDescuentoPlanilla(idDescuentoPlanilla, file),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["descuento-planilla", variables.mes, variables.anio],
      });

      close();
      successAlert(data.message);
    },
    onError: (error) => {
      errorAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al cargar los datos del descuento",
      );
    },
  });
};
