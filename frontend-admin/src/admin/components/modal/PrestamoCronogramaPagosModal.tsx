import { useModal } from "@/admin/hooks/useModal";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";
import { DataTable } from "../table/DataTable";
import { prestamosCronogramaColumns } from "../table/columns/prestamos.cronograma.columns";
import type { Cuota } from "@/interfaces/prestamo.response";
import { useMemo } from "react";

interface Props {
  cronogramaCuotas: Cuota[];
  nomSocio: string;
}

interface CuotaConSaldo extends Omit<Cuota, "monto"> {
  monto: number;
  saldo_capital: number;
}
export const PrestamoCronogramaPagosModal = ({
  cronogramaCuotas,
  nomSocio,
}: Props) => {
  const { close } = useModal();
  const cuotasProcesadas = useMemo(() => {
    // Forzamos que cada monto sea tratado como número al sumar el total
    const montoTotal = cronogramaCuotas.reduce((acc, c) => {
      return acc + Number(c.monto || 0);
    }, 0);

    let acumulado = 0;

    return cronogramaCuotas.map((cuota): CuotaConSaldo => {
      // Convertimos a número antes de operar
      const montoCuota = Number(cuota.monto || 0);

      acumulado = Number((acumulado + montoCuota).toFixed(2));

      return {
        ...cuota,
        monto: montoCuota, // Aseguramos que el monto sea número
        saldo_capital: Math.max(0, Number((montoTotal - acumulado).toFixed(2))),
      };
    });
  }, [cronogramaCuotas]);
  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col justify-center items-center gap-2">
          <p className="text-center font-bold text-blue-papelera">{nomSocio}</p>
        </div>
        <Separator className="border-dashed border-t-2 border-muted-foreground/40" />
        {/* content */}
        <DataTable
          columns={prestamosCronogramaColumns}
          data={cuotasProcesadas}
        />

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg text-sm text-zinc-600  hover:bg-zinc-100 transition-colors"
          >
            Cerrar
          </button>
          {/* <button
            className="flex gap-2 px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
            onClick={() => {}}
          >
            <Printer className="h-4 w-4" /> Imprimir
          </button> */}
        </div>
      </div>
    </>
  );
};
