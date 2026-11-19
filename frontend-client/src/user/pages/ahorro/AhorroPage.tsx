import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/helper/formatDate";
import { CustomJumbotron } from "@/user/components/CustomJumbotron";
import { useReportPdf } from "@/user/hooks/useReportPdf";
import { useSocio } from "@/user/hooks/useSocio";
import { Calendar, CheckCircle, FileDown, Hash, PiggyBank } from "lucide-react";

export const AhorroPage = () => {
  const { isLoading, data } = useSocio();
  const { download, isDownloading } = useReportPdf({
    typePdf: "ahorroPdf",
    fechaIni: "01/01/2026",
    fechaFin: "01/01/2040",
    socioId: 0,
    prestamoId: 0,
  });

  const handleReportPdf = () => {
    if (data?.socio) {
      download();
    }
  };
  if (isDownloading) return <CustomFullScreenLoading />;

  if (isLoading) return <CustomFullScreenLoading />;
  return (
    <>
      <CustomJumbotron title="Mis Ahorros" subTitle="" />
      <div className="container mx-auto px-4 mt-6">
        <div className="">
          <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-3">
            <div className="flex bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 items-center space-x-5">
              <div className="bg-emerald-100 p-3 rounded-full">
                <PiggyBank className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className=" text-xl md:text-2xl font-semibold ">
                  <span className="text-green-600">Bs. </span>{" "}
                  <span className="text-green-600 font-semibold">
                    {data?.socio.ahorro?.saldo ?? "0.00"}
                  </span>
                </h1>
                <p className="text-gray-600">Total Ahorrado</p>
              </div>
            </div>
            <div className="flex bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 items-center space-x-5">
              <div className="bg-emerald-100 p-3 rounded-full">
                <Hash className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className=" text-xl md:text-2xl  ">
                  <span className="text-gray-600 ">
                    {data?.socio.ahorro?.codigo}
                  </span>
                </h1>
                <p className="text-gray-600">Numero Cuenta</p>
              </div>
            </div>

            <div className="flex bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 items-center space-x-5">
              <div className="bg-emerald-100 p-3 rounded-full">
                <Calendar className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className=" text-xl md:text-2xl ">
                  <span className="text-gray-600 ">
                    {formatDate(data?.socio.ahorro?.fechaApertura)}
                  </span>
                </h1>
                <p className="text-gray-600">Fecha Apertura</p>
              </div>
            </div>

            <div className="flex bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 items-center space-x-5">
              <div className="bg-emerald-100 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className=" text-xl md:text-2xl  ">
                  <span className="text-gray-600">
                    {data?.socio.ahorro?.estado}
                  </span>
                </h1>
                <p className="text-gray-600">Estado</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between ">
            <h2 className="text-xl font-semibold mb-4">
              Historial de movimientos
            </h2>
            <Button
              variant="outline"
              className="gap-2 border-blue-200 text-blue-400 hover:bg-blue-50"
              onClick={handleReportPdf}
              disabled={isDownloading}
            >
              <FileDown className="w-5 h-5" />
              Descargar PDF
            </Button>
          </div>
          {data?.socio.ahorro ? (
            <Table>
              <TableCaption>
                Lista del historial de movimientos en la cuenta de ahorro
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-25">Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead className="text-right">Retiro</TableHead>
                  <TableHead className="text-right">Ingreso</TableHead>
                  <TableHead className="text-right">Saldo Bs.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.socio.ahorro?.movimientoAhorro.map((ahorro) => (
                  <TableRow key={ahorro.created_at}>
                    <TableCell className="font-medium">
                      {formatDate(ahorro.fecha)}
                    </TableCell>
                    <TableCell className="">{ahorro.descripcion}</TableCell>
                    <TableCell>{ahorro.periodo ?? "-"}</TableCell>
                    <TableCell className="text-red-500 text-right">
                      {ahorro.retiro ?? "0.00"}
                    </TableCell>
                    <TableCell className="text-green-500 text-right">
                      {ahorro.ingreso ?? "0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      {ahorro.saldo_ahorro}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">
                    {data?.socio.ahorro?.saldo ?? "0.00"}
                  </TableCell>
                </TableRow>
              </TableFooter> */}
            </Table>
          ) : (
            <p> No se encontraron registros.</p>
          )}
        </div>
      </div>
    </>
  );
};
