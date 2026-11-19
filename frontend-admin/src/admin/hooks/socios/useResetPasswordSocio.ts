import { resetPasswordSocio } from "@/admin/actions/socios.action";
import { useMutation } from "@tanstack/react-query";

export const useResetPasswordSocio = () => {
  const mutation = useMutation({
    mutationFn: (idSocio: number) => resetPasswordSocio(idSocio),
  });

  return mutation;
};
