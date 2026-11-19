import { useModal } from "@/admin/hooks/useModal";
import { useState } from "react";
import { SubirImagenCard } from "../SubirImagenCard";
import { useApruebaPrestamo } from "@/admin/hooks/prestamos/useApruebaPrestamo";

interface Props {
  codPrestamo: string;
}

export const PrestamoApruebaPrestamoModal = ({ codPrestamo }: Props) => {
  const { close } = useModal();
  const [imagen, setImagen] = useState<File | null>(null);
  const { mutate, isPending } = useApruebaPrestamo();

  const handleImage = (file: File | null) => {
    setImagen(file);

    console.log("Archivo recibido en modal:", file);
  };

  const handleAprobar = () => {
    if (imagen && codPrestamo) {
      mutate({
        codPrestamo: codPrestamo,
        file: imagen,
      });
    }

    console.log("imagen cargada : ", imagen);
  };
  return (
    <div className="space-y-4">
      {/* content */}
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
          className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
          onClick={handleAprobar}
          disabled={!imagen || isPending}
        >
          Aprobar
        </button>
      </div>
    </div>
  );
};
