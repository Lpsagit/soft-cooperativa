import { cooperativaApi } from "@/api/cooperativaApi";
import type { DescuentosPlanillaResponse } from "@/interfaces/descuentos-planilla.response";

//* para obtener datos del decuento planilla por periodo enviado
export const getDescuentoPlanillaByMesAnio = async (
  anio: string,
  mes: string,
) => {
  try {
    // console.log("anio, mes:", anio, mes);
    const { data } = await cooperativaApi.post<DescuentosPlanillaResponse>(
      "/descuento/periodo-data",
      {
        anio: anio,
        mes: mes,
      },
    );
    // console.log(data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error || "Error desconocido al obtener descuentos."
    );
  }
};

//* para generar el descuento planilla
export const generarDescuentoPlanilla = async (idDescuentoPlanilla: number) => {
  try {
    const { data } = await cooperativaApi.post<{
      status: string;
      message: string;
      mes: string;
      anio: string;
    }>("/descuento/generate-list", {
      idDescuentoPlanilla: idDescuentoPlanilla,
    });
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error ||
      "Error desconocido al generar lista de descuentos"
    );
  }
};

//* para llamar y exportar excel de la lista de descuento planilla
export const exportarExcelDescuentoPlanilla = async (
  idDescuentoPlanilla: number,
) => {
  try {
    const response = await cooperativaApi.post(
      `/descuento/export-excel`,
      {
        idDescuentoPlanilla: idDescuentoPlanilla,
      },
      {
        responseType: "blob", // Importante para recibir archivos binarios
      },
    );
    return {
      blob: response.data,
      filename: response.headers["content-disposition"],
    };
  } catch (error: any) {
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error ||
      "Error desconocido al exportar lista de descuentos"
    );
  }
};

//* para cargar el excel y el comprobante de pago para verificar el descuento planilla
export const cargarExcelDescuentoPlanilla = async (
  idDescuentoPlanilla: number,
  file: File,
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("idDescuentoPlanilla", idDescuentoPlanilla.toString());

    const { data } = await cooperativaApi.post<{
      status: string;
      message: string;
    }>("/descuento/upload-descuentos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error: any) {
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error ||
      "Error desconocido al cargar lista de descuentos"
    );
  }
};
