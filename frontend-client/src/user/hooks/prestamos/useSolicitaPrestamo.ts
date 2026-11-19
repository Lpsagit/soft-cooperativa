import { errorAlert, successAlert } from "@/lib/alerts";
import { solicitaPrestamo } from "@/user/actions/prestamos.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSolicitaPrestamo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: solicitaPrestamo,
    onSuccess: () => {
      successAlert("Solicitud registrada");
      queryClient.invalidateQueries({ queryKey: ["socio"] });
    },
    onError: (err: string) => {
      errorAlert(err);
      console.log(err);
    },
  });
};
