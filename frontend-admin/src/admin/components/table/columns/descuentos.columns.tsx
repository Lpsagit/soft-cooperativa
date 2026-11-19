import type { ColumnDef } from "@tanstack/react-table";
import type { ListDescuento } from "@/interfaces/descuentos-planilla.response";

export const descuentosColumns: ColumnDef<ListDescuento>[] = [
  {
    // Cambiado de "cod_socio" a "num_emp"
    accessorKey: "num_emp",
    header: "Num. Empleado",
    cell: ({ getValue }) => (
      <span>{String(getValue()).replace(/\D/g, "")}</span>
    ),
  },
  {
    // Cambiado de "nom_completo" a "socio_nombre" (¡Clave para buscar por nombre!)
    accessorKey: "socio_nombre",
    header: "Nombre Completo",
  },
  {
    // Cambiado de "desc_ahorro" a "monto_ahorro"
    accessorKey: "monto_ahorro",
    header: "Ahorro",
    cell: ({ getValue }) => (
      <span className="text-black-600">{String(getValue())}</span>
    ),
  },
  {
    // Cambiado de "desc_prestamo" a "monto_prestamo"
    accessorKey: "monto_prestamo",
    header: "Prestamo",
    cell: ({ getValue }) => (
      <span className="text-black-600">{String(getValue() ?? "")}</span>
    ),
  },
  {
    // Cambiado de "desc_total" a "monto_total"
    accessorKey: "monto_total",
    header: "Total",
    cell: ({ row }) => {
      let styleSpan = "text-green-600";
      if (row.original.estado_descuento === "No Descontado") {
        styleSpan = "text-red-600 ";
      }
      return (
        <span className={`font-bold ${styleSpan}`}>
          {row.original.monto_total}
        </span>
      );
    },
  },
  {
    accessorKey: "obs",
    header: "Obs.",
    cell: ({ row }) => {
      const estado = row.original.estado_descuento;
      // Si viene null o undefined, ponemos un string vacío para evitar errores
      let textoObs = row.original.obs ?? "";

      if (estado === "Descontado") {
        textoObs = "-";
      }

      return (
        /* max-w-[180px]: Limita el ancho de la celda de observaciones
        whitespace-normal: Rompe la regla del padre y permite saltos de línea normales
        break-words: Si hay una palabra larguísima, la corta para que no rompa el diseño
      */
        <p className="max-w-[180px] text-xs whitespace-normal break-words text-gray-600">
          {textoObs}
        </p>
      );
    },
  },
  {
    // Cambiado de "estado" a "estado_descuento" (¡Clave para buscar por estado!)
    accessorKey: "estado_descuento",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = String(getValue());
      let styleSpan = "bg-yellow-100 text-yellow-700";
      if (value === "No Descontado") {
        styleSpan = "bg-red-100 text-red-600 animate-pulse";
      }
      if (value === "Descontado") {
        styleSpan = "bg-green-100 text-green-600 ";
      }

      return (
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${styleSpan}`}
        >
          {value}
        </span>
      );
    },
  },
];
