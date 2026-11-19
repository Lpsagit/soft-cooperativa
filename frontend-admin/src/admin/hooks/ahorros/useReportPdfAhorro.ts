import { reportPdfCtaAhorro } from "@/admin/actions/ahorros.action";
import { errorAlert, successAlert } from "@/lib/alerts";
import { useMutation } from "@tanstack/react-query";

interface Props {
  socioId: number;
  fechaIni: string;
  fechaFin: string;
}

export const useReportPdfAhorro = () => {
  return useMutation({
    mutationFn: async ({ socioId, fechaIni, fechaFin }: Props) => {
      return await reportPdfCtaAhorro(socioId, fechaIni, fechaFin);
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "extracto-ahorro.pdf";

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
