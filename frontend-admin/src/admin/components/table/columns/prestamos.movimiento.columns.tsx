import type { MovimientoPrestamo } from "@/interfaces/prestamo.response";
import { formatDate } from "@/utils/date.utils";
import type { ColumnDef } from "@tanstack/react-table";

// 💰 Formateador moneda Bolivia

export const prestamosMovimientoColumns: ColumnDef<MovimientoPrestamo>[] = [
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => (
      <span className="text-black-600">{row.original.descripcion}</span>
    ),
  },
  {
    accessorKey: "periodo",
    header: "Periodo",
    cell: ({ row }) => {
      const value = row.original.periodo;

      return <span className={`text-black-600`}>{value || "-"}</span>;
    },
  },
  {
    accessorKey: "nro_cuota",
    header: "Nro. Cuota",
    cell: ({ row }) => {
      const value = row.original.nro_cuota;

      return <span className={`text-black-600`}>{value || "-"}</span>;
    },
  },
  {
    accessorKey: "cargo",
    header: "Cargo",
    cell: ({ row }) => {
      const value = row.original.cargo;

      return <span className={`text-black-600`}>{value || "0.00"}</span>;
    },
  },
  {
    accessorKey: "abono",
    header: "Abono",
    cell: ({ row }) => {
      const value = row.original.abono;

      return <span className={`text-black-600`}>{value || "0.00"}</span>;
    },
  },

  {
    accessorKey: "saldo",
    header: "Saldo",
    cell: ({ row }) => {
      const value = row.original.saldo_capital;

      return (
        <span className={`font-bold text-amber-600`}>{value || "0.00"}</span>
      );
    },
  },
];
