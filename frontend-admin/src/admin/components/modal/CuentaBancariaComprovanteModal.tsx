import { useModal } from "@/admin/hooks/useModal";
import type { MovimientoBancario } from "@/interfaces/cuenta-bancaria.response";
import { formatDate } from "@/utils/date.utils";

interface CuentaBancariaComprovanteModalProps {
  data: MovimientoBancario;
}

export const CuentaBancariaComprovanteModal = ({
  data,
}: CuentaBancariaComprovanteModalProps) => {
  const { close } = useModal();
  return (
    <div className="space-y-4">
      {/* content */}
      <div className="space-y-3 text-blue-papelera">
        <div className="flex justify-between ">
          <p>
            Fecha de Registro:
            <span className="font-semibold"> {formatDate(data.fecha)}</span>
          </p>
          <p>
            Monto: <span className="font-bold ">Bs. {data.monto}</span>
          </p>
        </div>

        <p>
          Detalle: <span className="font-semibold ">{data.detalle}</span>
        </p>

        {/* condicionar y mostrar un mensaje en caso de no venir la imagen pude venir con valores null o ""  */}
        {/* Si data.comprobante es null o una cadena vacía, se muestra el mensaje */}
        {data.comprobante?.trim() ? (
          <div className="flex justify-center mt-4">
            <img
              src={`https://lapapelera-rrhh.com/api-coop/${data.comprobante}`}
              alt="Comprobante de deposito"
              className="min-w-md h-auto rounded-md border"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            No se encontró imagen para este comprobante.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={close}
          className="px-4 py-2 rounded-lg text-sm text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
        >
          Cerrar
        </button>
        {/* <button
          className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
          onClick={close}
        >
          Descargar
        </button> */}
      </div>
    </div>
  );
};
