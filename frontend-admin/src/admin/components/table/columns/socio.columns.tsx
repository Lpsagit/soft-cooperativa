import type { Socio } from "@/interfaces/socios.list.response";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, User } from "lucide-react";
import { Link } from "react-router";

export const socioColumns: ColumnDef<Socio>[] = [
  {
    accessorKey: "cod_socio",
    header: "Código",
    cell: ({ row }) => <span className="">{row.original.cod_socio}</span>,
  },
  {
    accessorKey: "nom_completo",
    header: "Socio",
    cell: ({ row }) => {
      // para mostrar si un socio fue dado de baja se puede agregar un icono o cambiar el color del texto
      const isBaja = row.original.is_active;
      const textColor = !isBaja ? "text-gray-400" : "text-black";
      return (
        <span className={`${textColor}`}>
          {row.original.nom_completo}{" "}
          {!isBaja && (
            <span className="text-red-500 font-bold ml-1">(Baja)</span>
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "ci",
    header: "Ci",
    cell: ({ row }) => (
      <span className="">
        {row.original.ci} {row.original.extencion_ci}
      </span>
    ),
  },
  {
    accessorKey: "celular",
    header: "Celular",
    cell: ({ row }) => row.original.celular,
  },
  {
    accessorKey: "cuenta_bancaria",
    header: "Cuenta Bancaria",
    cell: ({ row }) => row.original.cuenta_bancaria,
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link to={`/socios/${row.original.cod_socio}`}>
          <div
            className={`p-2 rounded-lg bg-green-500`}
            title="Ver Datos Socio"
          >
            <Eye size={20} className="text-white" />
          </div>
        </Link>
      </div>
    ),
  },
];
