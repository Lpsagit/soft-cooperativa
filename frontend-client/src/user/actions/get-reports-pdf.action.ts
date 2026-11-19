import { cooperativaApi } from "@/api/cooperativaApi";
export const getReportPdfAhorroAction = async (
  fechaIni: string,
  fechaFin: string,
): Promise<Blob> => {
  try {
    const { data } = await cooperativaApi.post(
      "/report/extracto-ahorro",
      { fechaIni, fechaFin },
      { responseType: "blob" },
    );

    return data;
  } catch (error) {
    console.error("Error generando PDF de ahorro", error);
    throw new Error("No se pudo generar el reporte");
  }
};
export const getReportPdfPrestamoAction = async (
  socioId: number,
  prestamoId: number,
): Promise<Blob> => {
  try {
    const { data } = await cooperativaApi.post(
      "/report/extracto-prestamo",
      { socioId, prestamoId },
      { responseType: "blob" },
    );

    return data;
  } catch (error) {
    console.error("Error generando PDF de ahorro", error);
    throw new Error("No se pudo generar el reporte");
  }
};
