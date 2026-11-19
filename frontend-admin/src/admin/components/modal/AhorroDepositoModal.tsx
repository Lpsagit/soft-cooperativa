import { useDepositoAhorro } from "@/admin/hooks/ahorros/useDepositoAhorro";
import { useModal } from "@/admin/hooks/useModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SubirImagenCard } from "../SubirImagenCard";

interface Props {
  nombre: string;
  codigoCtaAhorro: string;
}

export const AhorroDepositoModal = ({ nombre, codigoCtaAhorro }: Props) => {
  const [monto, setMonto] = useState<string>("");
  const [imagen, setImagen] = useState<File | null>(null);
  const { close } = useModal();
  const { mutate, isPending } = useDepositoAhorro();

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

  const handleDeposito = () => {
    const montoNumerico = monto === "" ? 0 : Number(monto);
    console.log(montoNumerico);

    if (imagen && montoNumerico >= 50) {
      mutate({
        codCtaAhorro: codigoCtaAhorro,
        monto: Number(monto),
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
      <hr />
      <div className="flex  gap-5">
        <h4>Monto Bs.: </h4>
        <Input
          pattern="[0-9]*"
          className="
          w-50
              h-11
              px-2
              text-xl!
              leading-none!
              font-extrabold
              text-center
              tracking-wide
              py-0
              "
          type="number"
          value={monto}
          placeholder="0.00"
          onChange={handleMonto}
        />
      </div>
      <p className="text-sm text-gray-500">
        * Recuerda que el monto minimo es de Bs. 50
      </p>
      <hr />
      {isPending ? (
        <p>Aprobando Prestamo por favor espere...</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            Por favor suba una imagen del comprobante de deposito.
          </p>
          <SubirImagenCard onUpload={handleImage} />
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={close}
          className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          onClick={handleDeposito}
          disabled={!imagen || isPending || monto === "" || Number(monto) < 50}
        >
          Depositar
        </button>
      </div>
    </div>
  );
};
