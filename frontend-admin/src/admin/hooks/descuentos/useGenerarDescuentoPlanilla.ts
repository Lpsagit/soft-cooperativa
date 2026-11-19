import { generarDescuentoPlanilla } from "@/admin/actions/descuentos.action";
import { errorAlert, successAlert } from "@/lib/alerts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  idDescuentoPlanilla: number;
}

export const useGenerarDescuentoPlanilla = () => {
  const query = useQueryClient();

  return useMutation({
    mutationFn: ({ idDescuentoPlanilla }: Props) =>
      generarDescuentoPlanilla(idDescuentoPlanilla),
    onSuccess: (data) => {
      query.invalidateQueries({
        queryKey: ["descuento-planilla", data.mes, data.anio],
      });
      successAlert(data.message);
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
