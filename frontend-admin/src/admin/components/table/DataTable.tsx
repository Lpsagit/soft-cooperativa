import { useEffect, useState } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  filterColumn?: keyof TData;
}

export function DataTable<TData>({ columns, data }: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10, // socios por página
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    if (globalFilter) {
      table.setPageIndex(0);
    }
  }, [globalFilter, table]);

  return (
    <div>
      <div className="flex items-center justify-between mt-4 gap-2">
        <Input
          placeholder="Buscar en todas las columnas..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg w-80
             focus:outline-none focus:ring-2 focus:ring-blue-500
             transition"
        />
        <div className="flex items-center gap-2">
          Ver{" "}
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          registros
        </div>
      </div>

      <table className="w-full border mt-2">
        <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200 transition"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="text-sm">
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={`
             border-t
             hover:bg-gray-50
             transition
             ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
           `}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-3 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="text-sm text-gray-600">
        Total: {table.getFilteredRowModel().rows.length} registros
      </span>

      <div className="flex items-center justify-between mt-4 gap-2">
        {/* <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          ⏮ Primera
        </button> */}

        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          ◀ Anterior
        </button>

        <span className="text-sm">
          Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de{" "}
          {table.getPageCount()}
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente ▶
        </button>

        {/* <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          Última ⏭
        </button> */}
      </div>
    </div>
  );
}
