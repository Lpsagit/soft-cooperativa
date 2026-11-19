import { errorAlert, successAlert } from "@/lib/alerts";
import { solicitaAmortizacion } from "@/user/actions/prestamos.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
export const useSolicitaAmortizacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: solicitaAmortizacion,
    onSuccess: async () => {
      successAlert("Solicitud de amortización registrada");
      await queryClient.invalidateQueries({ queryKey: ["socio"] });
    },
    onError: (error: string) => {
      errorAlert(error);
      console.log(error);
    },
  });
};
