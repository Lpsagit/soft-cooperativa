import { Badge } from "@/components/ui/badge";
import type { PrestamoList } from "@/interfaces/prestamos.response";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, CloudDownload } from "lucide-react";
import { Link } from "react-router";

// 💰 Formateador moneda Bolivia
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);

type HandleDownloadPdfFunction = (socioId: number, prestamoId: number) => void;

export const prestamosColumns = (
  handleDownloadPdf?: HandleDownloadPdfFunction,
): ColumnDef<PrestamoList>[] => [
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
  {
    accessorKey: "fecha_otorgado",
    header: "Fecha Otorgado",
    cell: ({ row }) => {
      const value = row.original.fecha_otorgado;
      return value ? new Date(value).toLocaleDateString("es-BO") : "-";
    },
  },
  {
    accessorKey: "monto_otorgado",
    header: "Monto Otorgado",
    cell: ({ row }) => {
      const value = row.original.monto_otorgado;

      return (
        <span className={`font-semibold text-green-600`}>
          {formatCurrency(Number(value))}
        </span>
      );
    },
  },
  {
    accessorKey: "saldo_actual",
    header: "Saldo Capital",
    cell: ({ row }) => {
      if (!row.original.monto_otorgado) return "-"; // Si no hay monto otorgado, retornar "-"
      const value = row.original.saldo_actual;

      return (
        <span className={`font-semibold text-amber-600`}>
          {formatCurrency(Number(value))}
        </span>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    // DEFINIR ESTILOS PARA LOS DIFERENTES ESTADOS APROBADO , RECHAZADO, REFINANCIADO, CANCELADO

    cell: ({ row }) => {
      const value = row.original.estado;
      let estilo = "";
      switch (value) {
        case "APROBADO":
          estilo = "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300";
          break;
        case "RECHAZADO":
          estilo = "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
          break;
        case "REFINANCIADO":
          estilo =
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
          break;
        case "CANCELADO":
          estilo =
            "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
          break;
        default:
          estilo =
            "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300";
      }

      return <Badge className={` ${estilo}`}>{value}</Badge>;
    },
  },
  {
    accessorKey: "estado_soli",
    header: "Solicitud",
    cell: ({ row }) => {
      const value = row.original.estado_soli;
      let estilo = "";
      if (value !== "SIN SOLICITUD" && value !== "RECHAZADO") {
        estilo =
          "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-600 animate-pulse";
      } else {
        estilo =
          "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400";
      }

      return <Badge className={` ${estilo}`}>{value}</Badge>;
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link to={`/prestamos/${row.original.codigo}`}>
          <div className={`p-2 rounded-lg bg-green-500`} title="Ver Prestamo">
            <Eye size={20} className="text-white" />
          </div>
        </Link>

        <div
          className={`p-2 rounded-lg bg-blue-500 cursor-pointer`}
          title="Descargar Reporte"
          onClick={() =>
            handleDownloadPdf &&
            handleDownloadPdf(row.original.socio_id || 0, row.original.id || 0)
          }
        >
          <CloudDownload size={20} className="text-white" />
        </div>
      </div>
    ),
  },
];
