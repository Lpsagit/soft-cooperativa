import { useModal } from "@/admin/hooks/useModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { SubirImagenCard } from "../SubirImagenCard";
import { useRetiroAhorro } from "@/admin/hooks/ahorros/useRetiroAhorro";

interface Props {
  nombre: string;
  codigoCtaAhorro: string;
  saldoActual: string;
}
export const AhorroRetiroModal = ({
  nombre,
  codigoCtaAhorro,
  saldoActual,
}: Props) => {
  const [monto, setMonto] = useState<string>("");
  const [imagen, setImagen] = useState<File | null>(null);
  const { close } = useModal();
  const { mutate: retiroMutate, isPending } = useRetiroAhorro();

  const handleImage = (file: File | null) => {
    setImagen(file);

    console.log("Archivo recibido en modal:", file);
  };

  const handleMonto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir vacío o números
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setMonto(value);
    }
  };

  const handleRetiro = () => {
    const montoNumerico = monto === "" ? 0 : Number(monto);
    //console.log(montoNumerico);

    if (imagen && montoNumerico > 0) {
      console.log({ monto, imagen });
      retiroMutate({
        codCtaAhorro: codigoCtaAhorro,
        monto: montoNumerico,
        file: imagen,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-center items-center gap-2">
        <p className="text-center font-bold text-blue-papelera">{nombre}</p>
        <Badge variant="outline">{codigoCtaAhorro}</Badge>
      </div>
      <Separator className="border-dashed border-t-2 border-muted-foreground/40" />
      <div className="flex flex-wrap justify-between">
        <span className="font-medium text-gray-600">Saldo Actual:</span>
        <p className="text-center font-bold text-blue-papelera">
          Bs. {saldoActual}
        </p>
      </div>
      <Separator className="border-dashed border-t-2 border-muted-foreground/40" />

      <div className="flex  gap-5">
        <h4 className="font-medium text-gray-600 w-md">Retirar Bs.: </h4>
        <Input
          pattern="[0-9]*"
          className="
              h-11
              px-2
              text-xl!
              leading-none!
              font-extrabold
              text-right
              tracking-wide
              text-blue-papelera
              py-0
              "
          placeholder="0.00"
          type="number"
          onChange={handleMonto}
          value={monto}
        />
      </div>
      <hr />
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          Por favor suba una imagen del comprobante de deposito.
        </p>
        <SubirImagenCard onUpload={handleImage} />
        {isPending ? (
          <p className="font-semibold text-sm text-green-600">
            {" "}
            Enviando Datos al Servidor{" "}
          </p>
        ) : (
          <></>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={close}
          className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          className="px-4 py-2 rounded-lg text-sm bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          onClick={handleRetiro}
          disabled={!imagen || isPending || monto === "" || Number(monto) <= 0}
        >
          Retirar
        </button>
      </div>
    </div>
  );
};
