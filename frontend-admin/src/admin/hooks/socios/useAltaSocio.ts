import { altaSocio, updateSocio } from "@/admin/actions/socios.action";
import { errorAlert, successAlert } from "@/lib/alerts";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useModal } from "../useModal";

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

export const useAltaSocio = () => {
  const { close } = useModal();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: SocioForm) => altaSocio(data),
    onSuccess: async (_, variables) => {
      console.log("invalidando:", variables);
      await queryClient.invalidateQueries({
        queryKey: ["socios"],
      });
      close();
      successAlert("Socio dado de alta correctamente");
    },
    onError: (error) => {
      errorAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al aprobar el prestamo",
      );
    },
  });
  return mutation;
};
