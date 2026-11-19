import { updateUserSocio } from "@/admin/actions/socios.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateUserSocio = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      idSocio,
      rol,
      userName,
      codSocio,
    }: {
      idSocio: number;
      rol: string;
      userName: string;
      codSocio: string;
    }) => updateUserSocio({ idSocio, rol, userName, codSocio }),
    onSuccess: (_, variables) => {
      console.log("invalidando:", variables);
      queryClient.invalidateQueries({
        queryKey: ["socio", variables.codSocio],
      });
    },
  });
  return mutation;
};
