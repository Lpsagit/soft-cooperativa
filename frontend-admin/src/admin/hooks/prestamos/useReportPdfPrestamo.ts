import { reportPdfPrestamo } from "@/admin/actions/prestamos.action";
import { errorAlert, successAlert } from "@/lib/alerts";
import { useMutation } from "@tanstack/react-query";

interface Props {
  socioId: number;
  prestamoId: number;
}

export const useReportPdfPrestamo = () => {
  return useMutation({
    mutationFn: async ({ socioId, prestamoId }: Props) => {
      return await reportPdfPrestamo(socioId, prestamoId);
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "extracto-prestamo.pdf";

      link.click();
      URL.revokeObjectURL(url);
      successAlert("PDF generado exitosamente");
      //console.log("pdf generado exitosamente");
    },

    onError: (error) => {
      errorAlert(
        typeof error === "string"
          ? error
          : "Error al generar PDF, por favor intente de nuevo mas tarde",
      );
    },
  });
};
