import type { CuentaAhorro } from "@/interfaces/ahorros.response";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, CloudDownload } from "lucide-react";
import { Link } from "react-router";

// 💰 Formateador moneda Bolivia
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);

type HandleDownloadPdfFunction = (
  fechaIni: string,
  fechaFin: string,
  socioId: number,
) => void;

export const ahorroColumns = (
  handleDownloadPdf?: HandleDownloadPdfFunction,
): ColumnDef<CuentaAhorro>[] => [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => <span className="">{row.original.codigo}</span>,
  },
  {
    accessorKey: "nom_completo",
    header: "Socio",
    cell: ({ row }) => <span className="">{row.original.nom_completo}</span>,
  },
  //   {
  //     accessorKey: "foto",
  //     header: "Foto",
  //     cell: ({ row }) => (
  //       <img
  //         src={row.original.foto}
  //         alt="foto"
  //         className="w-10 h-10 rounded-full object-cover"
  //       />
  //     ),
  //   },
  {
    accessorKey: "fecha_operacion",
    header: "Fecha Apertura",
    cell: ({ row }) =>
      new Date(row.original.fecha_operacion).toLocaleDateString("es-BO"),
  },
  {
    accessorKey: "saldo_actual",
    header: "Total Ahorrado",
    cell: ({ row }) => {
      const value = row.original.saldo_actual;

      return (
        <span className={`font-semibold text-green-600`}>
          {formatCurrency(+value)}
        </span>
      );
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link to={`/ahorros/${row.original.codigo}`}>
          <div className={`p-2 rounded-lg bg-green-500`} title="Ver Cuenta">
            <Eye size={20} className="text-white" />
          </div>
        </Link>

        <div
          className={`p-2 rounded-lg bg-blue-500 cursor-pointer`}
          title="Descargar Reporte"
          onClick={() =>
            handleDownloadPdf &&
            handleDownloadPdf(
              "2023-01-01",
              "2040-12-31",
              row.original.socio_id || 0,
            )
          }
        >
          <CloudDownload size={20} className="text-white" />
        </div>

        {/* <button
          onClick={() => console.log("Ver", row.original)}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Ver
        </button>

        <button
          onClick={() => console.log("Editar", row.original)}
          className="bg-yellow-500 text-white px-2 py-1 rounded"
        >
          Editar
        </button> */}
      </div>
    ),
  },
];
