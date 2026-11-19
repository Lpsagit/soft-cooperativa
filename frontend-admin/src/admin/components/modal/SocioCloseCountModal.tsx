import { useBajaSocio } from "@/admin/hooks/socios/useBajaSocio";
import { useModal } from "@/admin/hooks/useModal";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Separator } from "@/components/ui/separator";
import type { Socio } from "@/interfaces/socios.list.response";
import { successAlert } from "@/lib/alerts";
import { TriangleAlert } from "lucide-react";

interface Props {
  socio: Socio;
}

export const SocioCloseCountModal = ({ socio }: Props) => {
  const { close } = useModal();
  const { mutate, isPending } = useBajaSocio();
  const guardaDataSocio = async () => {
    mutate({ codigoSocio: socio.cod_socio, socioId: socio.id });
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-center items-center gap-2">
        <p className="text-center font-bold text-blue-papelera">
          {socio.nom_completo}
        </p>
      </div>
      <Separator className="border-dashed border-t-2 border-muted-foreground/40" />
      {/* content */}
      <div>
        <Alert
          className="
        relative
        border
        border-border
        border-l-5
        border-l-red-600
        bg-background
      "
        >
          <TriangleAlert className="h-4 w-4 text-red-500!" />

          <AlertDescription className="text-muted-foreground">
            <p className="font-semibold">
              Antes de cerrar la cuenta asegurese de que el socio haya cancelado
              todas sus deudas y que sus ahorros se hayan retirado.
            </p>
            Una vez se cierre la cuenta, el socio no tendrá acceso al sistema.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={close}
          className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
          onClick={guardaDataSocio}
          disabled={isPending}
        >
          {isPending ? "Dando de Baja..." : "Cerrar Cuenta"}
        </button>
      </div>
    </div>
  );
};
