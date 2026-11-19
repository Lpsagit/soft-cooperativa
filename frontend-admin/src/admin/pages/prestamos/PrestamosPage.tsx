import { AdminTitle } from "@/admin/components/AdminTitle";
import { prestamosColumns } from "@/admin/components/table/columns/prestamos.columns";
import { DataTable } from "@/admin/components/table/DataTable";
import { useGetPrestamos } from "@/admin/hooks/prestamos/useGetPrestamos";
import { useReportPdfPrestamo } from "@/admin/hooks/prestamos/useReportPdfPrestamo";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { errorAlert } from "@/lib/alerts";

export const PrestamosPage = () => {
  const { data, isLoading, isError, error } = useGetPrestamos();
  const { mutate, isPending } = useReportPdfPrestamo();

  const handleDownloadPdf = (socioId: number, prestamoId: number) => {
    mutate({ socioId, prestamoId });
  };

  if (isLoading) {
    return <p>cargando</p>;
  }
  if (isError) {
    errorAlert(String(error));
  }
  if (isPending) return <CustomFullScreenLoading />;
  return (
    <>
      <div className="flex justify-between items-center">
        <AdminTitle
          title="Prestamos"
          subtitle="Aquí puedes ver y administrar los Prestamos de los socios."
        />
        {/* <div className="flex justify-end mb-10 gap-4">
          <Button
            variant="outline"
            onClick={() => {}}
            className="
                     flex items-center gap-2
                     border-sky-600 text-sky-700
                     hover:bg-sky-600 hover:text-white
                     transition-all duration-200
                     font-medium"
          >
            <ListTodo size={18} />
            Ver Solicitudes
          </Button>
        </div> */}
      </div>
      <DataTable
        columns={prestamosColumns(handleDownloadPdf)}
        data={data?.prestamos || []}
      />
    </>
  );
};
