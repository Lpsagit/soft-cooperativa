import { useMemo } from "react";
import { User } from "lucide-react";
import type { ListDescuento } from "@/interfaces/descuentos-planilla.response";

interface DescuentosResumenProps {
  data: ListDescuento[];
}

export function DescuentosResumen({ data }: DescuentosResumenProps) {
  // 🧮 Calculamos ambos totales de manera eficiente
  const { totalGeneral, totalDescontados } = useMemo(() => {
    return data.reduce(
      (acc, item) => {
        // Convertimos el string a número (si es inválido o vacío, usamos 0)
        const monto = Number(item.monto_total) || 0;

        // 1. Suma de todos los monto_total sin importar el estado
        acc.totalGeneral += monto;

        // 2. Suma solo si el estado es 'Descontado'
        if (item.estado_descuento === "Descontado") {
          acc.totalDescontados += monto;
        }

        return acc;
      },
      { totalGeneral: 0, totalDescontados: 0 }, // Valores iniciales
    );
  }, [data]); // Solo se recalcula si la lista 'data' cambia

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-center  place-items-center border-t border-b border-slate-200 py-4">
      {/* Tarjeta 1: Total General */}
      <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 w-70">
        <p className="text-sm font-medium text-gray-500">
          Total General Planilla
        </p>
        <p className="text-2xl font-bold text-gray-900">
          Bs. {totalGeneral.toFixed(2)}
        </p>
      </div>

      {/* Tarjeta 2: Solo Descontados */}
      {/* si el totalGeneral es distinto del totalDescontados ponemos un mensaje de advertencia */}
      {totalGeneral !== totalDescontados ? (
        <div className="p-4 bg-red-50 rounded-xl shadow-sm border border-red-200 w-70">
          <p className="text-sm font-medium text-red-700">Total Descontado</p>
          <p className="text-2xl font-bold  text-red-800">
            Bs. {totalDescontados.toFixed(2)}
          </p>
        </div>
      ) : (
        <div className="p-4 bg-green-50 rounded-xl shadow-sm border border-green-200 w-70">
          <p className="text-sm font-medium text-green-700">Total Descontado</p>
          <p className="text-2xl font-bold  text-green-800">
            Bs. {totalDescontados.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
