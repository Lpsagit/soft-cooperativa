import type { Cuota } from "@/interfaces/prestamo.response";
import type { ColumnDef } from "@tanstack/react-table";

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
interface CuotaConSaldo extends Omit<Cuota, "monto"> {
  monto: number;
  saldo_capital: number;
}
export const prestamosCronogramaColumns: ColumnDef<CuotaConSaldo>[] = [
  {
    accessorKey: "periodo",
    header: "Periodo",
    cell: ({ row }) => {
      const mes = +row.original.mes - 1;
      return (
        <div className="text-center">
          {meses[mes]} - {row.original.anio}
        </div>
      );
    },
  },
  {
    accessorKey: "nro_cuota",
    header: "Nro. Cuota",
    cell: ({ row }) => <span className="">{row.original.num_cuota}</span>,
  },
  {
    accessorKey: "monto",
    header: "Monto Cuota",
    cell: ({ row }) => {
      const value = row.original.monto;

      return <span className={`text-black-600`}>{value}</span>;
    },
  },
  {
    accessorKey: "saldo_capital",
    header: "Saldo Capital",
    cell: ({ row }) => {
      const value = row.original.saldo_capital;

      return <span className={`font-semibold text-amber-600`}>{value}</span>;
    },
  },
];
