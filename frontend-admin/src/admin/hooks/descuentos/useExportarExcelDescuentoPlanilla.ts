import { exportarExcelDescuentoPlanilla } from "@/admin/actions/descuentos.action";
import { errorAlert, successAlert } from "@/lib/alerts";
import { useMutation } from "@tanstack/react-query";

interface Props {
  idDescuentoPlanilla: number;
}
export const useExportarExcelDescuentoPlanilla = () => {
  return useMutation({
    mutationFn: async ({ idDescuentoPlanilla }: Props) => {
      return await exportarExcelDescuentoPlanilla(idDescuentoPlanilla);
    },
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);

      // Extraer nombre del header
      let fileName = "archivo.xlsx";

      if (filename) {
        const match = filename.match(/filename="?(.+)"?/);

        if (match?.[1]) {
          fileName = match[1];
        }
      }

      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      successAlert("Excel generado exitosamente");
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
