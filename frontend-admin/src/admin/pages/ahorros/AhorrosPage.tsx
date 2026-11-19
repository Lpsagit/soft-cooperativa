import { AdminTitle } from "@/admin/components/AdminTitle";
import { DataTable } from "@/admin/components/table/DataTable";
import { ahorroColumns } from "@/admin/components/table/columns/ahorro.columns";
import { useGetAhorros } from "@/admin/hooks/ahorros/useGetAhorros";
import { useReportPdfAhorro } from "@/admin/hooks/ahorros/useReportPdfAhorro";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { errorAlert } from "@/lib/alerts";

export const AhorrosPage = () => {
  const { data: ahorros, isLoading, isError, error } = useGetAhorros();
  const { mutate, isPending } = useReportPdfAhorro();
  console.log(ahorros);
  const handleDownloadPdf = (
    fechaIni: string,
    fechaFin: string,
    socioId: number,
  ) => {
    mutate({ socioId, fechaIni, fechaFin });
  };
  if (isLoading) return <p>Cargando...</p>;
  if (isError) {
    errorAlert(String(error));
  }
  if (isPending) return <CustomFullScreenLoading />;
  return (
    <>
      <div className="flex justify-between items-center">
        <AdminTitle
          title="Ahorros"
          subtitle="Aquí puedes ver y administrar los Ahorros de los socios."
        />
      </div>

      <DataTable
        columns={ahorroColumns(handleDownloadPdf)}
        data={ahorros?.cuentasAhorro || []}
      />
    </>
  );
};
