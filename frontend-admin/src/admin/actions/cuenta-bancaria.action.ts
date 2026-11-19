import { cooperativaApi } from "@/api/cooperativaApi";
import type { CuentaBancariaResponse } from "@/interfaces/cuenta-bancaria.response";

//* obtiene datos iniciales de la cuenta bancaria cooperativa
export const getCtaBancaria = async (): Promise<CuentaBancariaResponse> => {
  try {
    const { data } =
      await cooperativaApi.get<CuentaBancariaResponse>("/ctabancaria");
    //console.log("data:", data);
    return data;
  } catch (error: any) {
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error ||
      `Error al obtener datos generales de lacuenta bancaria cooperativa, por favor intente de nuevo mas tarde.`
    );
  }
};

//* para modificar saldo fisico y safi
export interface SaldoFisicoSafiProps {
  monto: string;
  tipo: "saldoFisico" | "safi";
  ctaBancariaId: number;
}
export const updateSaldoFisicoAndSafi = async (props: SaldoFisicoSafiProps) => {
  try {
    const { data } = await cooperativaApi.post(
      "/ctabancaria/saldo-fisico-safi",
      {
        // Parámetros de la solicitud
        monto: props.monto,
        tipo: props.tipo,
        ctaBancariaId: props.ctaBancariaId,
      },
    );
    //console.log("data:", data);
    return data;
  } catch (error: any) {
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw error.response.data.error || `Error al actualizar.`;
  }
};

//* para insertar RC/IVA e intereses
export interface RcivaInteresesProps {
  montoRcIva: string;
  montoInteres: string;
  ctaBancariaId: number;
  fechaRegistro: string;
}

export const insertRcivaIntereses = async (props: RcivaInteresesProps) => {
  try {
    const { data } = await cooperativaApi.post(
      "/ctabancaria/registro-rc-iva-intereses",
      {
        montoRcIva: props.montoRcIva,
        montoInteres: props.montoInteres,
        ctaBancariaId: props.ctaBancariaId,
        fechaRegistro: props.fechaRegistro,
      },
    );
    return data;
  } catch (error: any) {
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw error.response.data.error || `Error al insertar RC/IVA e intereses.`;
  }
};

//* para subir imagen del qr de la cuenta bancaria
export interface UpdateCodQrProps {
  ctaBancariaId: number;
  qrFile: File;
}

export const updateCodQR = async (props: UpdateCodQrProps) => {
  try {
    const formData = new FormData();
    formData.append("ctaBancariaId", props.ctaBancariaId.toString());
    formData.append("file", props.qrFile);

    const { data } = await cooperativaApi.post(
      "/ctabancaria/update-cod-qr",
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
      console.log("error:", error.response.data.error);
    }
    throw error.response.data.error || `Error al subir imagen del QR.`;
  }
};
