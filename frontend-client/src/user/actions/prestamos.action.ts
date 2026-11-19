import { cooperativaApi } from "@/api/cooperativaApi";

//* obtiene prestamo del socio sin utilizar
export const getPrestamo = async (socioId: number) => {
  try {
    const { data } = await cooperativaApi.get(`/prestamo`, {
      params: {
        socioId: socioId,
      },
    });
    console.log(data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      error.response?.data?.error ||
      "Error no se pudo obtener datos del prestamo actual."
    );
  }
};

//* solicita nuevo prestamo
interface SolicitaPrestamoArgs {
  monto: string;
  nroCuotas: string;
}
export const solicitaPrestamo = async ({
  monto,
  nroCuotas,
}: SolicitaPrestamoArgs) => {
  try {
    const { data } = await cooperativaApi.post("/prestamo/solicita-prestamo", {
      monto: monto,
      nroCuotas: nroCuotas,
    });
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      (error.response?.data?.error as string) ||
      "Error no se pudo realiza la operacion por favor recargue la pagina e intente nuevamente."
    );
  }
};

//* solicita refinanciamiento de prestamo
interface SolicitaRefinanciamientoArgs {
  codPrestamo: string;
  montoSolicitado: string;
  cuotas: string;
}
export const solicitarRefinanciamiento = async ({
  codPrestamo,
  montoSolicitado,
  cuotas,
}: SolicitaRefinanciamientoArgs) => {
  try {
    const { data } = await cooperativaApi.post(
      "/prestamo/solicita-refinanciamiento",
      {
        codPrestamo,
        montoSolicitado,
        cuotas,
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
      (error.response?.data?.error as string) ||
      "Error no se pudo realiza la operacion por favor recargue la pagina e intente nuevamente."
    );
  }
};

//* solicita amortizacion de prestamo
interface SolicitaAmortizacionArgs {
  codPrestamo: string;
  montoAmortizar: string;
  file: File | null;
}
export const solicitaAmortizacion = async (props: SolicitaAmortizacionArgs) => {
  try {
    //console.log("props: ", props);
    const formData = new FormData();
    formData.append("codPrestamo", props.codPrestamo);
    formData.append("montoAmortizar", String(props.montoAmortizar));
    if (props.file) {
      formData.append("file", props.file);
    }
    // console.log("Datos del FormData:");

    const { data } = await cooperativaApi.post(
      "/prestamo/solicita-amortizacion",
      formData,
    );
    console.log("prestamo amortizado: ", data);
    return data;
  } catch (error: any) {
    // Ver respuesta completa del error
    if (error.response) {
      console.log("error:", error.response.data.error);
    }
    throw (
      (error.response?.data?.error as string) ||
      "Error no se pudo realiza la operacion por favor recargue la pagina e intente nuevamente."
    );
  }
};
