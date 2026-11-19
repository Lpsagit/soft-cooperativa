import { useState } from "react";

import { useUpdateSaldoFisicoAndSafi } from "@/admin/hooks/cuenta-bancaria/useUpdateSaldoFisicoAndSafi";
import { useModal } from "@/admin/hooks/useModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  ctaBancariaId: number;
}

export const CuentaBancariaSafiModal = ({ ctaBancariaId }: Props) => {
  const { close } = useModal();
  const { mutate } = useUpdateSaldoFisicoAndSafi();
  const [monto, setMonto] = useState<number>(0);

  const handleUpdate = () => {
    if (monto < 1) {
      return;
    }
    mutate({
      monto: monto.toString(),
      tipo: "safi",
      ctaBancariaId,
    });
  };

  return (
    <div className="space-y-4">
      {/* content */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Ingrese el monto registrado en el sistema SAFI para la cuenta bancaria
          general de la cooperativa.
        </p>
        {/* <Label htmlFor="fecha">Fecha</Label>
        <Input type="date" id="fecha" /> */}
        <Label htmlFor="rciva">Monto Safi</Label>
        <Input
          type="number"
          value={monto || ""}
          onChange={(e) => {
            const value = e.target.value
              .replace(/[^0-9.]/g, "")
              .replace(/(\..*?)\..*/g, "$1")
              .replace(/^(\d*)(\.\d{0,2})?.*$/, "$1$2");
            setMonto(Number(value));
          }}
          inputMode="numeric"
          placeholder="0"
          pattern="[0-9]*"
          className="
                  h-11
                  px-2
                  text-xl!
                  leading-none!
                  font-extrabold
                  text-right
                  tracking-wide
                  py-0
                  "
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={close}
          className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
          onClick={handleUpdate}
        >
          Guardar
        </button>
      </div>
    </div>
  );
};
