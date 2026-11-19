import { errorAlert, successAlert } from "@/lib/alerts";
import { solicitarRefinanciamiento } from "@/user/actions/prestamos.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSolicitaRefinanciamiento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: solicitarRefinanciamiento,
    onSuccess: async () => {
      successAlert("Solicitud registrada");
      await queryClient.invalidateQueries({ queryKey: ["socio"] });
    },
    onError: (err: string) => {
      errorAlert(err);
      console.log(err);
    },
  });
};
