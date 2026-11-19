import { cooperativaApi } from "@/api/cooperativaApi";
import { useMutation } from "@tanstack/react-query";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({
      userName,
      password,
      newPassword,
    }: {
      userName: string;
      password: string;
      newPassword: string;
    }) => {
      const { data } = await cooperativaApi.post("/auth/change-pass", {
        userName,
        password,
        newPassword,
      });

      return data;
    },
  });
};
