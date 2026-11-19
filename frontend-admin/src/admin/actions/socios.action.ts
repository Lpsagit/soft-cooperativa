import { cooperativaApi } from "@/api/cooperativaApi";
import type { GenericRespose } from "@/interfaces/generic.reponse";
import type {
  Socio,
  SocioResponse,
  SociosListResponse,
} from "@/interfaces/socios.list.response";

export const getSocios = async (): Promise<SociosListResponse> => {
  try {
    const { data } = await cooperativaApi.get<SociosListResponse>(
      "/socio/admin-list-socio",
    );
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getSocioById = async (
  cod_socio: string,
): Promise<SocioResponse> => {
  try {
    const { data } = await cooperativaApi.post<SocioResponse>("/socio/socio", {
      cod_socio,
    });
    console.log("socio", data);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//* actualizar datos generales del socio
type UpdateSocioForm = {
  socio: {
    id: number;
    codSocio: string;
    email: string;
    celular: string;
    numReferencia: string;
    direccion: string;
    cuentaBancaria?: string;
  };
};

export const updateSocio = async (
  socioLike: UpdateSocioForm,
): Promise<Socio> => {
  try {
    const { data } = await cooperativaApi.post(
      "/socio/admin/update-socio",
      socioLike.socio,
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

//* ACTUALIZAR USUARIO DE UN SOCIO

export const updateUserSocio = async ({
  idSocio,
  rol,
  userName,
  codSocio,
}: {
  idSocio: number;
  rol: string;
  userName: string;
  codSocio: string;
}) => {
  try {
    //console.log({ idSocio, rol, userName, codSocio });
    const { data } = await cooperativaApi.post("/socio/admin/update-usuario", {
      idSocio,
      rol,
      userName,
      codSocio,
    });
    //console.log("respuesta desde el server ", data);
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

//* reestablecer password usuario normal
export const resetPasswordSocio = async (idSocio: number) => {
  try {
    console.log({ idSocio });
    const { data } = await cooperativaApi.post("/socio/admin/reset-password", {
      idSocio: idSocio,
    });
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

//* CRER NUEVA CUENTA DE SOCIO
//! borrar ya no se utilizara
export const createAcountSocio = async (
  numEmp: string,
): Promise<GenericRespose> => {
  try {
    const { data } = await cooperativaApi.post<GenericRespose>(
      "/ahorro/new-count",
      {
        num_emp: numEmp,
      },
    );
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

//* DAR DE BAJA A UN SOCIO
export const bajaSocio = async (
  codigoSocio: string,
  socioId: number,
): Promise<GenericRespose> => {
  try {
    console.log({ codigoSocio, socioId });
    const { data } = await cooperativaApi.post<GenericRespose>(
      "/socio/admin/baja-socio",
      {
        codigoSocio: codigoSocio,
        socioId: socioId,
      },
    );
    console.log(data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error || "Error desconocido al dar de baja al socio"
    );
  }
};

//* DAR DE ALTA A UN SOCIO
type SocioForm = {
  numEmp: string;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  ci: string;
  numReferencia: string;
  direccion: string;
  cuentaBancaria?: string;
  plantaId: string;
};
export const altaSocio = async (
  newSocio: SocioForm,
): Promise<GenericRespose> => {
  try {
    console.log({ newSocio });
    const { data } = await cooperativaApi.post<GenericRespose>(
      "/socio/admin/create-socio",
      {
        ...newSocio,
      },
    );
    console.log(data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response.data.error || "Error desconocido al dar de alta al socio"
    );
  }
};
