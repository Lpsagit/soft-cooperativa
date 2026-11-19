import { cooperativaApi } from "@/api/cooperativaApi";
import type { PrestamoResponse } from "@/interfaces/prestamo.response";
import type { PrestamosResponse } from "@/interfaces/prestamos.response";
//* obtiene lista de prestamos con los datos necesarios
export const getPrestamos = async (): Promise<PrestamosResponse> => {
  try {
    const { data } = await cooperativaApi.get("/prestamo/admin");
    console.log(data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error || "Error desconocido al actualizar el socio"
    );
  }
};

//* obtiene prestamo en especifico
export const getPrestamoByCod = async (
  codPrestamo: string,
): Promise<PrestamoResponse> => {
  try {
    const { data } = await cooperativaApi.post("/prestamo/admin/socio", {
      codPrestamo: codPrestamo,
    });
    console.log("datos del prestamo ", data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error || "Error desconocido al actualizar el socio"
    );
  }
};

//* aceptar un prestamo mediante su cod
export const aceptarPrestamo = async (codPrestamo: string, file: File) => {
  try {
    // 1. Crear el objeto FormData
    const formData = new FormData();

    // 2. Agregar los campos (el backend los recibirá como req.body)
    formData.append("codPrestamo", codPrestamo);
    formData.append("estado", "APROBADO");
    formData.append("obs", "-");

    // 3. Agregar el archivo (el backend lo recibirá como un archivo/multer)
    formData.append("file", file);
    console.log({ formData });

    // 4. Enviar el formData directamente
    const { data } = await cooperativaApi.post(
      "/prestamo/estado-aprobacion",
      formData,
      {
        headers: {
          // Importante: Axios configurará el 'multipart/form-data'
          // automáticamente al detectar un FormData
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error || "Error desconocido al actualizar el socio"
    );
  }
};

//* rechazar prestamo
export const rechazarPrestamo = async (codPrestamo: string, obs: string) => {
  try {
    const { data } = await cooperativaApi.post("/prestamo/estado-aprobacion", {
      codPrestamo: codPrestamo,
      estado: "RECHAZADO",
      obs: obs,
    });
    console.log("prestamo rechazado: ", data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error || "Error desconocido al actualizar el socio"
    );
  }
};

//* realizar refinanciamiento a un prestamo aprobar o rechazar
export interface RefinanciarPrestamoProps {
  codPrestamo: string;
  cuota: string;
  montoSolicitado: number;
  refinanciamientoId: number;
  estado: "APROBADO" | "RECHAZADO";
  file?: File;
}

export const refinanciarPrestamo = async (props: RefinanciarPrestamoProps) => {
  try {
    const formData = new FormData();
    formData.append("codPrestamo", props.codPrestamo);
    formData.append("cuota", props.cuota);
    formData.append("montoSolicitado", String(props.montoSolicitado));
    formData.append("refinanciamientoId", String(props.refinanciamientoId));
    formData.append("estado", props.estado);
    if (props.file) {
      formData.append("file", props.file);
    }

    const { data } = await cooperativaApi.post(
      "/prestamo/refinanciamiento",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    console.log("prestamo refinanciado: ", data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error || "Error desconocido al refinanciar prestamo"
    );
  }
};

//* realizar amortizacdion a un prestamo aprobar o rechazar
export interface AmortizarPrestamoProps {
  codPrestamo: string;
  montoAmortizar: number;
  estado: "APROBADO" | "RECHAZADO";
  amortizacionId: number | null;
  codAhorro: string | null;
  file?: File;
}

export const amortizarPrestamo = async (props: AmortizarPrestamoProps) => {
  try {
    const formData = new FormData();
    formData.append("codPrestamo", props.codPrestamo);
    formData.append("montoAmortizar", String(props.montoAmortizar));
    formData.append("estado", props.estado);
    if (props.amortizacionId !== null) {
      formData.append("amortizacionId", String(props.amortizacionId));
    }
    if (props.codAhorro !== null) {
      formData.append("codAhorro", props.codAhorro);
    }
    if (props.file) {
      formData.append("file", props.file);
    }

    const { data } = await cooperativaApi.post(
      "/prestamo/amortizacion",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    console.log("prestamo amortizado: ", data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error || "Error desconocido al amortizar prestamo"
    );
  }
};

//* para obtener pdf generado desde backend

export const reportPdfPrestamo = async (
  socioId: number, // PARA ESTE EJEMPLO VA EL ID DEL SOCIO
  prestamoId: number,
): Promise<Blob> => {
  try {
    const { data } = await cooperativaApi.post(
      "/report/extracto-prestamo-admin",
      { socioId, prestamoId },
      { responseType: "blob" },
    );

    return data;
  } catch (error: any) {
    if (error.response) {
      console.log("error:", error.response.data);
    }
    throw (
      error.response.data.error ||
      `Error al generar el extracto PDF para el prestamo.`
    );
  }
};
