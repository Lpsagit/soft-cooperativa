import { Link, useParams } from "react-router";
import { AdminTitle } from "@/admin/components/AdminTitle";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Hash, PiggyBank, X } from "lucide-react";
import { DataTable } from "@/admin/components/table/DataTable";
import { ahorroMovimientoColumns } from "@/admin/components/table/columns/ahorro.movimiento.columns";
import { useModal } from "@/admin/hooks/useModal";
import { AhorroDepositoModal } from "@/admin/components/modal/AhorroDepositoModal";
import { AhorroRetiroModal } from "@/admin/components/modal/AhorroRetiroModal";
import { AhorroCerrarSuspenderModal } from "@/admin/components/modal/AhorroCerrarSuspenderModal";
import { useGetCountAhorroByCod } from "@/admin/hooks/ahorros/useGetCountAhorroByCod";
import { formatDate } from "@/utils/date.utils";
import { Badge } from "@/components/ui/badge";
import { useReportPdfAhorro } from "@/admin/hooks/ahorros/useReportPdfAhorro";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";

export const AhorrosCount = () => {
  const { id } = useParams();

  const {
    data: ctaAhorro,
    isError,
    error,
    isLoading,
  } = useGetCountAhorroByCod(id);
  const {
    mutate: downloadPdf,
    isPending: isDownloadingPdf,
    error: errorPdf,
  } = useReportPdfAhorro();

  const { open } = useModal();

  const handleModalDeposito = () => {
    open({
      content: (
        <AhorroDepositoModal
          nombre={ctaAhorro?.ctaAhorro.nom_completo || ""}
          codigoCtaAhorro={ctaAhorro?.ctaAhorro.codigo || ""}
        />
      ),
      title: "Realizar Deposito de Ahorro",
      size: "md",
    });
  };

  const handleModalRetiro = () => {
    open({
      content: (
        <AhorroRetiroModal
          nombre={ctaAhorro?.ctaAhorro.nom_completo || ""}
          codigoCtaAhorro={ctaAhorro?.ctaAhorro.codigo || ""}
          saldoActual={ctaAhorro?.ctaAhorro.saldo_actual || ""}
        />
      ),
      title: "Realizar Retiro de Ahorro",
      size: "md",
    });
  };

  const handleCerrarSuspenderRetiro = () => {
    open({
      content: <AhorroCerrarSuspenderModal />,
      title: "Cerrar / Suspender Cuenta",
      size: "sm",
    });
  };

  const handlePrintReport = () => {
    console.log("imprimir");
    downloadPdf({
      socioId: ctaAhorro?.ctaAhorro.socio_id || 0,
      fechaIni: "01/01/2026",
      fechaFin: "01/01/2040",
    });
  };

  //isError, error, isPending
  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error: {String(error)}</div>;
  if (ctaAhorro?.ctaAhorro === null)
    return <div> No se encontraron datos para la cuenta {id}</div>;
  if (isDownloadingPdf) return <CustomFullScreenLoading />;

  return (
    <>
      <div className="flex justify-between items-center">
        <AdminTitle
          title={`Cuenta De Ahorro`}
          subtitle={`Aquí podras ver los movimientos de la cuenta de ahorro `}
        />
        <div className="flex justify-end mb-10 gap-4">
          <Link to="/ahorros" className="flex items-center gap-2">
            {" "}
            <Button variant="outline">
              <X className="w-4 h-4" />
              Cerrar
            </Button>
          </Link>
        </div>
      </div>

      {/* content */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5">
        <div className="flex justify-between items-center ">
          <div className="flex gap-2">
            <h2 className="text-xl font-semibold text-slate-800 ">
              Datos de la Cuenta
            </h2>
            <Badge variant={"secondary"} className="bg-sky-100 text-sky-600">
              {ctaAhorro?.ctaAhorro?.estado || "-"}
            </Badge>
          </div>

          {ctaAhorro?.ctaAhorro?.estado === "ACTIVO" ? (
            <div className="flex flex-wrap gap-3 mt-3 justify-center  mb-2">
              <Button
                variant="outline"
                onClick={handleModalDeposito}
                //className="px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
              >
                Realizar Depósito
              </Button>
              <Button
                variant="outline"
                onClick={handleModalRetiro}
                //   className="px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
              >
                Realizar Retiro
              </Button>
              <Button
                variant="outline"
                onClick={handlePrintReport}
                //   className="px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
              >
                Imprimir Estado
              </Button>
              {/* <Button
                variant="outline"
                onClick={handleCerrarSuspenderRetiro}
                className=" transition-all duration-200 bg-red-100 text-red-700 hover:bg-red-500 cursor-pointer hover:text-white"
              >
                Cerrar / Suspender Cuenta
              </Button> */}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 mt-3 justify-center mb-2">
              &#8203;
              {/* <Button
                variant="outline"
                onClick={handleCerrarSuspenderRetiro}
                className=" transition-all duration-200 bg-green-100 text-green-700 hover:bg-green-500 cursor-pointer hover:text-white"
              >
                Activar Cuenta
              </Button> */}
            </div>
          )}
        </div>

        <div className="flex flex-wrap pt-2 px-6 border-t border-slate-200 items-center justify-around">
          <div className="flex flex-col w-80 p-4  items-center justify-around">
            <img
              className="w-50 rounded-full"
              src={`https://lapapelera-rrhh.com/sistema_rrhh/sis_personal/assets/img/fotos_personal/${ctaAhorro?.ctaAhorro?.foto}`}
              alt=""
            />

            <p className="text-xl font-semibold text-green-papelera mt-2 text-center">
              {ctaAhorro?.ctaAhorro?.nom_completo}
            </p>
          </div>
          <div className=" grid grid-cols-1  lg:grid-cols-2 gap-5 pb-10 ">
            <div className="flex bg-white rounded-lg shadow-md px-4  h-25 items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <PiggyBank className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className=" text-xl font-semibold ">
                  <span className="text-amber-600">Bs. </span>{" "}
                  <span className="text-amber-600 font-semibold">
                    {ctaAhorro?.ctaAhorro?.saldo_actual}
                  </span>
                </h1>
                <p className="text-gray-600">Total Ahorrado</p>
              </div>
            </div>
            <div className="flex bg-white rounded-lg shadow-md px-4 h-25   items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Hash className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className=" text-xl  ">
                  <span className="text-gray-600 ">
                    {" "}
                    {ctaAhorro?.ctaAhorro?.codigo}
                  </span>
                </h1>
                <p className="text-gray-600">Numero Cuenta</p>
              </div>
            </div>

            <div className="flex bg-white rounded-lg shadow-md px-4 h-25   items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className=" text-xl ">
                  <span className="text-gray-600 ">
                    {formatDate(ctaAhorro?.ctaAhorro?.fecha_operacion)}
                  </span>
                </h1>
                <p className="text-gray-600">Fecha Apertura</p>
              </div>
            </div>

            <div className="flex bg-white rounded-lg shadow-md px-4 h-25   items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className=" text-xl  ">
                  <span className="text-gray-600">
                    {ctaAhorro?.ctaAhorro?.estado}
                  </span>
                </h1>
                <p className="text-gray-600">Estado</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Historial de Movimientos
          </h2>
          <div className="pt-2 border-t border-slate-200">
            <DataTable
              columns={ahorroMovimientoColumns}
              data={ctaAhorro?.movimientos ?? []}
            />
          </div>
        </div>
      </div>
    </>
  );
};
