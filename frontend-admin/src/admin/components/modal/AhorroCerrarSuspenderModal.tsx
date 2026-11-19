import { useState } from "react";
import { useModal } from "@/admin/hooks/useModal";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const AhorroCerrarSuspenderModal = () => {
  const [value, setValue] = useState("");
  const { close } = useModal();

  const openConfirmCerrar = () => {
    console.log("Abrir modal para CERRAR");
    // aquí puedes abrir tu Dialog
  };

  const openConfirmSuspender = () => {
    console.log("Abrir modal para SUSPENDER");
    // aquí puedes abrir tu Dialog
  };
  const actionConfig = {
    cerrar: {
      label: "Cerrar Cuenta",
      className: "bg-red-500 text-white hover:bg-red-600",
      action: openConfirmCerrar,
    },
    suspender: {
      label: "Suspender Cuenta",
      className: "bg-amber-400 hover:bg-amber-500 text-black",
      action: openConfirmSuspender,
    },
  };

  const configButton = actionConfig[value as keyof typeof actionConfig];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-center items-center gap-2">
        <p className="text-center font-bold text-blue-papelera">
          CHOQUEHUANCA CUTILE RONALD EDSON
        </p>
        <Badge variant="outline">CTA-AHO-1696</Badge>
      </div>
      <hr />

      <p>Realizará la siguiente operación con la cuenta:</p>
      <div className="w-full  flex justify-center">
        <Select
          value={value}
          onValueChange={(val) => {
            setValue(val);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccione opción" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="cerrar">Cerrar</SelectItem>
            <SelectItem value="suspender">Suspender</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={close}
          className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          Cancelar
        </button>

        <button
          className={cn(
            "px-4 py-2 rounded-lg text-sm transition-colors",
            configButton?.className || "bg-gray-400 cursor-not-allowed",
          )}
          disabled={!configButton}
          onClick={configButton?.action}
        >
          {configButton?.label || "Seleccione opción"}
        </button>
      </div>
    </div>
  );
};
