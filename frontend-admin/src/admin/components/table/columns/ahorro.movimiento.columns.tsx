import type { Movimiento } from "@/interfaces/ahorro.response";
import type { ColumnDef } from "@tanstack/react-table";

const formatCurrency = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 📦 Estilos reutilizables
const headerRight = () => <div className="text-right font-medium">...</div>;
const cellRight = (value: any, className = "") => (
  <div className={`text-right ${className}`}>{formatCurrency(value)}</div>
);

export const ahorroMovimientoColumns: ColumnDef<Movimiento>[] = [
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => new Date(row.original.fecha).toLocaleDateString("es-BO"),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => <span>{row.original.descripcion}</span>,
  },
  {
    accessorKey: "periodo",
    header: "Periodo",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.periodo ?? "-"}</span>
    ),
  },
  {
    accessorKey: "retiro",
    header: () => <div className="text-right">Retiro</div>,
    cell: ({ row }) => (
      <div className="text-right font-normal ">
        {formatCurrency(row.original.retiro)}
      </div>
    ),
  },
  {
    accessorKey: "ingreso",
    header: () => <div className="text-right">Ingreso</div>,
    cell: ({ row }) => (
      <div className="text-right font-normal ">
        {formatCurrency(row.original.ingreso)}
      </div>
    ),
  },
  {
    accessorKey: "saldo",
    header: () => <div className="text-right">Saldo</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold text-green-700">
        {formatCurrency(row.original.saldo_ahorro)}
      </div>
    ),
  },
];
