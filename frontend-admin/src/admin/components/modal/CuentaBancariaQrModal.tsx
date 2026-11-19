import { useModal } from "@/admin/hooks/useModal";
import { SubirImagenCard } from "../SubirImagenCard";
import { useState } from "react";
import { useUpdateCodQR } from "@/admin/hooks/cuenta-bancaria/useUpdateCodQR";

interface Props {
  ctaBancariaId: number;
}

export const CuentaBancariaQrModal = ({ ctaBancariaId }: Props) => {
  const { close } = useModal();
  const { mutate, isPending } = useUpdateCodQR();
  const [imagen, setImagen] = useState<File | null>(null);

  const handleImage = (file: File | null) => {
    setImagen(file);
    console.log("imagen cargada : ", imagen);
    //console.log("Archivo recibido en modal:", file);
  };

  const handleUpdateQR = () => {
    if (imagen) {
      mutate({ ctaBancariaId, qrFile: imagen });
    }
  };
  return (
    <div className="space-y-4">
      {/* content */}
      <div className="space-y-3">
        <p className="text-sm text-gray-700">
          Suba el nuevo código QR correspondiente a la cuenta bancaria de la
          cooperativa para los depositos.
        </p>
        <SubirImagenCard onUpload={handleImage} />
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
          onClick={handleUpdateQR}
          disabled={!imagen || isPending}
        >
          {isPending ? "Subiendo..." : "Subir QR"}
        </button>
      </div>
    </div>
  );
};
