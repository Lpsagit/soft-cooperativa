import {
  insertRcivaIntereses,
  type RcivaInteresesProps,
} from "@/admin/actions/cuenta-bancaria.action";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModal } from "../useModal";
import { errorAlert, successAlert } from "@/lib/alerts";
import { useForm } from "react-hook-form";

export const useInsertRcivaIntereses = () => {
  const { close } = useModal();
  const { reset } = useForm();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (props: RcivaInteresesProps) => insertRcivaIntereses(props),
    onSuccess: async (data) => {
      console.log("RCIVA E INTERESES insertados correctamente:", data);
      await queryClient.invalidateQueries({
        queryKey: ["cuenta-bancaria"],
      });
      reset();
      close();
      successAlert(
        data.message || "RCIVA e INTERESES insertados correctamente.",
      );
    },
    onError: (error) => {
      console.error("Error al insertar RCIVA e INTERESES:", error);
      errorAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al insertar RCIVA e INTERESES",
      );
    },
  });
};
