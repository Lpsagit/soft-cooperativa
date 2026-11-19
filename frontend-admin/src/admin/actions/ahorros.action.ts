import { cooperativaApi } from "@/api/cooperativaApi";
import type {
  CtaAhorroResponse,
  CtaAhorroResponseCorta,
} from "@/interfaces/ahorro.response";
import type { CuentasAhorrosResponse } from "@/interfaces/ahorros.response";

//* obtiene todos los ahorro de los socios
export const getAhorros = async (): Promise<CuentasAhorrosResponse> => {
  try {
    const { data } = await cooperativaApi.get("/ahorro/cuentas-ahorro");
    // console.log(data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error ||
      "Error al obtener lista de ahorros por favor intente de nuevo mas tarde"
    );
  }
};

//* obtiene movimientos de una cuenta de ahorro

export const getCountAhorroByCod = async (
  codCuenta: string,
): Promise<CtaAhorroResponse> => {
  try {
    const { data } = await cooperativaApi.post("/ahorro/cuenta-ahorro-by-cod", {
      codCuenta: codCuenta,
    });
    // console.log(data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error ||
      `Error al obtener la cuenta de ahorro con el codigo ${codCuenta} intente de nuevo mas tarde`
    );
  }
};

//* realizar deposito de ahorro

export const depositoAhorro = async (
  codCtaAhorro: string,
  monto: number,
  file: File,
) => {
  try {
    const formData = new FormData();
    formData.append("codCtaAhorro", codCtaAhorro);
    formData.append("monto", String(monto));
    formData.append("file", file);
    const { data } = await cooperativaApi.post(
      "/ahorro/upload-ahorro-individual",
      formData,
      {
        headers: {
          // Importante: Axios configurará el 'multipart/form-data'
          // automáticamente al detectar un FormData
          "Content-Type": "multipart/form-data",
        },
      },
    );
    // console.log(data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data);
    }
    throw (
      error.response.data.error ||
      `Error al realizar el deposito en la cuenta ${codCtaAhorro}, por favor intente de nuevo mas tarde.`
    );
  }
};

//* realizar retiro de ahorro

export const retiroAhorro = async (
  codCtaAhorro: string,
  monto: number,
  file: File,
) => {
  try {
    const formData = new FormData();
    formData.append("codCtaAhorro", codCtaAhorro);
    formData.append("monto", String(monto));
    formData.append("file", file);
    const { data } = await cooperativaApi.post(
      "/ahorro/retiro-ahorro",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  } catch (error: any) {
    if (error.response) {
      console.log("error:", error.response.data);
    }
    throw (
      error.response.data.error ||
      `Error al realizar el retiro de la cuenta ${codCtaAhorro}, por favor intente de nuevo mas tarde.`
    );
  }
};

//* para obtener pdf generado desde backend

export const reportPdfCtaAhorro = async (
  socioId: number, // PARA ESTE EJEMPLO VA EL ID DEL SOCIO
  fechaIni: string,
  fechaFin: string,
): Promise<Blob> => {
  try {
    const { data } = await cooperativaApi.post(
      "/report/extracto-ahorro-admin",
      { socioId, fechaIni, fechaFin },
      { responseType: "blob" },
    );

    return data;
  } catch (error: any) {
    if (error.response) {
      console.log("error:", error.response.data);
    }
    throw (
      error.response.data.error ||
      `Error al generar el extracto PDF para esta cuenta de ahorro.`
    );
  }
};

//* para obtener codigo,saldo  de la cuenta de ahorro de un socio mediante su codigo de socio para amortizacion

export const getCtaAhorroByCodSocio = async (
  codSocio: string,
): Promise<CtaAhorroResponseCorta> => {
  try {
    const { data } = await cooperativaApi.post(
      "/ahorro/saldo-ahorro-by-cod-socio",
      { codSocio },
    );
    return data;
  } catch (error: any) {
    if (error.response) {
      console.log("error:", error.response.data);
    }
    throw (
      error.response.data.error ||
      `Error al obtener la cuenta de ahorro del socio con codigo ${codSocio}, por favor intente de nuevo mas tarde.`
    );
  }
};
