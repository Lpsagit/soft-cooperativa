import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Cuota } from "@/interfaces/socio.response";

import { useMemo } from "react";

interface Props {
  onClose: () => void;
  cronogramaCuotas: Cuota[];
  nomSocio: string;
}

interface CuotaConSaldo extends Omit<Cuota, "monto"> {
  monto: number;
  saldo_capital: number;
}
export const CronogramaPrestamoModal = ({
  onClose,
  cronogramaCuotas,
  nomSocio,
}: Props) => {
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
        <div>
          <Table>
            <TableCaption>Lista de cronograma de pagos</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="">Periodo</TableHead>
                <TableHead>Nro.Cuota</TableHead>
                <TableHead className="text-right">Monto Bs.</TableHead>
                <TableHead className="text-right">Saldo Capital</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuotasProcesadas.map((cronograma) => (
                <TableRow key={cronograma.id}>
                  <TableCell className="font-medium">
                    {cronograma.mes} - {cronograma.anio}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {cronograma.num_cuota}
                  </TableCell>
                  <TableCell className="text-right">
                    {cronograma.monto}
                  </TableCell>
                  <TableCell className="text-right">
                    {cronograma.saldo_capital}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
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
