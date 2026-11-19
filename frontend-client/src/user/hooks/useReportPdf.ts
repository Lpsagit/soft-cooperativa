import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getReportPdfAhorroAction,
  getReportPdfPrestamoAction,
} from "../actions/get-reports-pdf.action";

interface ReportPdfConfig {
  typePdf: string;
  fechaIni: string;
  fechaFin: string;
  prestamoId: number;
  socioId: number;
}

export const useReportPdf = (config: ReportPdfConfig) => {
  const mutation = useMutation({
    mutationFn: async () => {
      if (config.typePdf === "ahorroPdf") {
        return await getReportPdfAhorroAction(config.fechaIni, config.fechaFin);
      }
      if (
        config.typePdf === "prestamoPdf" &&
        config.prestamoId &&
        config.socioId
      ) {
        return await getReportPdfPrestamoAction(
          config.socioId,
          config.prestamoId,
        );
      }

      throw new Error("No se proporcionó el ID del préstamo");
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download =
        config.typePdf === "ahorroPdf"
          ? "extracto-ahorro.pdf"
          : "extracto-prestamo.pdf";

      link.click();
      URL.revokeObjectURL(url);
      console.log("pdf generado exitosamente");
    },

    onError: (error: any) => {
      console.log(error);
      toast.error(error.message);
    },
  });
  return {
    download: mutation.mutate,
    isDownloading: mutation.isPending,
    error: mutation.error,
  };
};
