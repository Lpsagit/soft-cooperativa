import type { MovimientoBancario } from "@/interfaces/cuenta-bancaria.response";
import { formatDate } from "@/utils/date.utils";
import type { ColumnDef } from "@tanstack/react-table";
import { BookmarkCheck } from "lucide-react";

// 💰 Formateador moneda Bolivia
type HandleModalFunction = (type: string, data?: MovimientoBancario) => void;

export const cuentaBancariaMovimientoColumns = (
  handleModal?: HandleModalFunction,
): ColumnDef<MovimientoBancario>[] => [
  {
    accessorKey: "fecha",
    header: "Fecha de Registro",
    cell: ({ row }) => formatDate(row.original.fecha),
  },
  {
    accessorKey: "tipo_operacion",
    header: "Operación",
    cell: ({ row }) => <span className="">{row.original.tipo_operacion}</span>,
  },
  {
    accessorKey: "categoria",
    header: "Categoría",
    cell: ({ row }) => {
      const value = row.original.categoria;

      return <span className={`text-black-600`}>{value}</span>;
    },
  },

  {
    accessorKey: "detalle",
    header: "Detalle",
    cell: ({ row }) => {
      const value = row.original.detalle;

      return (
        <div className="max-w-[390px]">
          <p className="break-words whitespace-normal">{value}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "monto",
    header: "Monto",
    cell: ({ row }) => {
      const value = row.original.monto;

      return (
        <span className={`font-semibold text-green-600`}>Bs. {value}</span>
      );
    },
  },
  // {
  //   accessorKey: "saldo",
  //   header: "Saldo",
  //   cell: ({ row }) => {
  //     const value = row.original.sentido;

  //     return (
  //       <span className={`font-semibold text-amber-600`}>Bs. {value}</span>
  //     );
  //   },
  // },
  {
    id: "comprobante",
    header: "Comprobante",
    cell: ({ row }) => (
      <div className="flex gap-2 justify-center">
        <div
          className={`p-2 rounded-lg bg-sky-500 cursor-pointer hover:bg-sky-600 transition `}
          title="Ver Datos Socio"
          onClick={() => {
            if (handleModal) {
              // Llama a handleModal con el tipo de modal y los datos del comprobante
              handleModal("comprobante", row.original);
            }
          }}
        >
          <BookmarkCheck size={20} className="text-white" />
        </div>
      </div>
    ),
  },
];
