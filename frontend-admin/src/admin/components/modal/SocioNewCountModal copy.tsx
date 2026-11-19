import { useModal } from "@/admin/hooks/useModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { errorAlert } from "@/lib/alerts";
import { Info } from "lucide-react";
import { useCreateAcountSocio } from "@/admin/hooks/socios/useCreateAcountSocio";
import { useState } from "react";

export const SocioNewCountModal = () => {
  const { close } = useModal();
  const { mutate, isPending } = useCreateAcountSocio();
  const [empleado, useEmpleado] = useState<string>("");

  const guardaDataSocio = () => {
    if (!empleado.trim()) {
      errorAlert("El número de empleado es requerido");
      return;
    }
  };
  return (
    <div className="space-y-4">
      <Alert
        className="
        relative
        border
        border-border
        border-l-5
        border-l-green-300
        bg-background
      "
      >
        <Info className="h-4 w-4 text-green-500!" />

        <AlertDescription className="text-muted-foreground">
          <p className="font-semibold">
            Digite el numero de empleado para agregarlo como socio a la
            cooperativa, recuerde que el numero de empleado debe estar
            registrado en "Sistema Personal" de RRHH para obtener toda la
            informacion del empleado.
          </p>
        </AlertDescription>
      </Alert>
      <div className="flex ">
        <h4>Número de Empleado: </h4>
        <Input
          className=" text-center"
          placeholder="0000"
          onChange={(e) => useEmpleado(e.target.value)}
        />
      </div>
      <p className=" text-sm font-semibold">
        Una vez de click en el boton "Crear Cuenta" tambien se creara una cuenta
        de ahorro.
      </p>
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={close}
          className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm bg-green-900 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          onClick={guardaDataSocio}
        >
          Crear Cuenta
        </button>
      </div>
    </div>
  );
};
