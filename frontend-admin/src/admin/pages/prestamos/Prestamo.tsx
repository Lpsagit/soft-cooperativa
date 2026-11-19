import { AdminTitle } from "@/admin/components/AdminTitle";
import { PrestamoAmortizacionModal } from "@/admin/components/modal/PrestamoAmortizacionModal";
import { PrestamoApruebaPrestamoModal } from "@/admin/components/modal/PrestamoApruebaPrestamoModal";
import { PrestamoCronogramaPagosModal } from "@/admin/components/modal/PrestamoCronogramaPagosModal";
import { PrestamoRefinanciarModal } from "@/admin/components/modal/PrestamoRefinanciarModal";
import { prestamosMovimientoColumns } from "@/admin/components/table/columns/prestamos.movimiento.columns";
import { DataTable } from "@/admin/components/table/DataTable";
import { useGetPrestamoByCod } from "@/admin/hooks/prestamos/useGetPrestamoByCod";
import { useRechazaPrestamo } from "@/admin/hooks/prestamos/useRechazaPrestamo";
import { useReportPdfPrestamo } from "@/admin/hooks/prestamos/useReportPdfPrestamo";
import { useModal } from "@/admin/hooks/useModal";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rechazarPrestamo } from "@/lib/alerts";

import { FileText, Hash, TrendingDown, X } from "lucide-react";
import { Link, useParams } from "react-router";

export const Prestamo = () => {
  const { id } = useParams();
  const { open } = useModal();
  const { isLoading, isError, error, data } = useGetPrestamoByCod(id ?? "");
  const { mutate } = useRechazaPrestamo();

  const {
    mutate: downloadPdf,
    isPending: isDownloadingPdf,
    error: errorPdf,
  } = useReportPdfPrestamo();

  // constantes para un manejo de datos mas amigable
  const amortizado = data?.prestamo.amortizado;
  const refinanciado = data?.prestamo.refinanciado;
  const cuotasList = data?.prestamo.cuotasList ?? [];
  const prestamo = data?.prestamo;

  //para los datos extras
  const cuotas = prestamo?.num_cuotas ?? 0;
  const cuotasRestantes = prestamo?.cuotasRestates ?? 0;

  let cuotasPagadas = 0;

  if (
    prestamo?.estado === "EN REVISION" ||
    prestamo?.estado === "RECHAZADO" ||
    prestamo?.estado === "REFINANCIADO"
  ) {
    cuotasPagadas = cuotasRestantes;
  } else {
    cuotasPagadas = cuotas - cuotasRestantes;
  }
  const progreso = (cuotasPagadas / cuotas) * 100;
  //console.log(cuotasPagadas);

  const handleModalCronogramaPagos = () => {
    open({
      content: (
        <PrestamoCronogramaPagosModal
          cronogramaCuotas={cuotasList}
          nomSocio={prestamo?.nom_completo ?? ""}
        />
      ),
      title: "Lista de Cuotas Programadas",
      size: "lg",
    });
  };

  const handleModalAmortizacion = () => {
    open({
      content: (
        <PrestamoAmortizacionModal
          codPrestamo={prestamo?.codigo ?? ""}
          nomSocio={prestamo?.nom_completo ?? ""}
          amortizacion={amortizado ?? null}
          prestamo={prestamo!}
          cuotasRestantes={cuotasRestantes}
        />
      ),
      title: "Amortizacion Préstamo",
      size: "full",
    });
  };

  const handleModalRefinanciamiento = () => {
    open({
      content: (
        <PrestamoRefinanciarModal
          nomSocio={prestamo?.nom_completo ?? ""}
          refinanciamiento={refinanciado ?? null}
          prestamo={prestamo!}
          cuotasRestantes={cuotasRestantes}
          codPrestamo={prestamo?.codigo ?? ""}
        />
      ),
      title: "Refinanciar Préstamo",
      size: "full",
    });
  };

  //paara aprobar un prestamo abre un modal
  const handleModalAprobarPrestamo = () => {
    open({
      content: (
        <PrestamoApruebaPrestamoModal codPrestamo={prestamo?.codigo ?? ""} />
      ),
      title: "Aprobar Prestamo",
      size: "md",
    });
    console.log("aprobar prestamo");
  };
  // para rechazar el prestamo solo es un alert que manda a llamar el mutation por que necesito confirmacion y mutar el estado
  const handleRechazarPrestamo = async () => {
    const { confirmado, motivo } = await rechazarPrestamo();
    if (confirmado) {
      mutate({
        codPrestamo: prestamo?.codigo ?? "",
        obs: motivo ?? "-",
      });
    }
  };

  const handlePrintReport = () => {
    console.log("imprimir");
    downloadPdf({
      socioId: prestamo?.socio_id || 0,
      prestamoId: prestamo?.id || 0,
    });
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  if (isDownloadingPdf) return <CustomFullScreenLoading />;
  return (
    <>
      <div className="flex justify-between items-center">
        <AdminTitle
          title={`Prestamo Socio`}
          subtitle={`Aquí podras ver los movimientos del prestamo. `}
        />
        <div className="flex justify-end mb-10 gap-4">
          <Button variant="outline">
            <Link to="/prestamos" className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cerrar
            </Link>
          </Button>
        </div>
      </div>
      {/* content */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-5 pt-2 pb-5">
        <div className="flex justify-between items-center ">
          <div className="flex gap-2 justify-center">
            <h2 className="text-xl font-semibold text-slate-800 ">
              Datos del Prestamo
            </h2>
            <Badge variant={"secondary"} className="bg-sky-100 text-sky-600">
              {prestamo?.estado}
            </Badge>
          </div>
          {prestamo?.estado === "EN REVISION" ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleModalAprobarPrestamo}
                className="px-3 py-1  text-sm font-medium transition-all duration-200 border-green-50  bg-green-200 text-green-700 hover:bg-green-300 cursor-pointer"
              >
                Aprobar Prestamo
              </Button>
              <Button
                variant="outline"
                onClick={handleRechazarPrestamo}
                className="px-3 py-1  text-sm font-medium transition-all duration-200 border-red-50  bg-red-200 text-red-700 hover:bg-red-300 cursor-pointer"
              >
                Rechazar Prestamo
              </Button>
            </div>
          ) : prestamo?.estado !== "RECHAZADO" &&
            prestamo?.estado !== "REFINANCIADO" &&
            prestamo?.estado !== "CANCELADO" ? (
            <div className="flex flex-wrap gap-3 mt-3 justify-center  mb-2">
              <Button
                variant="outline"
                onClick={handleModalAmortizacion}
                //className="px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                animation={prestamo?.amortizado ? "blink" : "none"}
              >
                Amortizar Prestamo
              </Button>
              <Button
                variant="outline"
                onClick={handleModalRefinanciamiento}
                animation={prestamo?.refinanciado ? "blink" : "none"}
                //   className="px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
              >
                Refinanciar Prestamo
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
                className=" transition-all duration-200 bg-red-100 text-red-700 hover:bg-red-500 cursor-pointer hover:text-white"
              >
                Cerrar / Suspender Cuenta
              </Button> */}
            </div>
          ) : (
            <></>
          )}
        </div>

        {/* <div className="flex flex-wrap pt-2 px-6 border-t border-slate-200 items-center justify-around"> */}
        <div className="flex flex-col md:flex-row w-full gap-7 p-6 mt-3 items-center justify-center">
          <div className="flex flex-col w-80 p-4  items-center justify-around">
            <img
              className="w-50 rounded-full"
              // src="https://lapapelera-rrhh.com/sistema_rrhh/sis_personal/assets/img/fotos_personal/1674_WhatsApp%20Image%202025-01-20%20at%2009.20.12.jpeg"
              src={`https://lapapelera-rrhh.com/sistema_rrhh/sis_personal/assets/img/fotos_personal/${prestamo?.foto}`}
              alt=""
            />

            <div className="flex flex-col w-full gap-2 text-center mt-5">
              <div className="text-center text-xl font-bold text-blue-papelera mb-3">
                <p className="px-3 py-1 bg-gray-200 rounded-2xl">
                  {prestamo?.nom_completo}
                </p>
              </div>
            </div>
          </div>
          {/* Datos prestamo */}
          <div className="bg-linear-to-br from-gray-200 to-gray-300 rounded-2xl shadow-lg p-8 ">
            <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-7 mb-8">
              <div>
                <p className="text-gray-700 text-sm mb-1">Monto Original</p>
                <p className="text-2xl font-bold text-blue-papelera">
                  Bs. {prestamo?.monto_solicitado}
                </p>
              </div>

              <div>
                <p className="text-gray-700 text-sm mb-1">Saldo Capital</p>
                <p className="text-2xl font-bold text-amber-600">
                  Bs. {prestamo?.saldo_actual}
                </p>
              </div>

              <div>
                <p className="text-gray-700 text-sm mb-1">Proxima Cuota</p>
                <p className="text-2xl font-bold text-blue-papelera">
                  Bs. {prestamo?.cuota_mensual}
                </p>
              </div>
              <div>
                <p className="text-gray-700 text-sm mb-1">Cuotas Restantes</p>
                <p className="text-center text-2xl font-bold text-blue-papelera">
                  {prestamo?.cuotasRestates}
                </p>
              </div>
            </div>

            <div className="bg-gray-600/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-100 text-sm">Progreso del Pago</span>
                <span className="text-white font-semibold">
                  {progreso.toFixed(0)} %
                </span>
              </div>

              <div className="w-full bg-gray-600 rounded-full h-3 mb-4">
                <div
                  className="bg-linear-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs text-gray-200">Pagado</p>
                    <p className="text-sm text-blue-papelera font-semibold">
                      Bs.{" "}
                      {Number(prestamo?.totalPagado) < 0
                        ? "0.00"
                        : prestamo?.totalPagado}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs text-gray-200">Cuotas Pagadas</p>
                    <p className="text-sm text-blue-papelera font-semibold">
                      {cuotasPagadas}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/*  cronograma de pagos 
            todo: mostrar en un modal */}
            <div className="w-full text-right mt-5 ">
              <Button
                className="bg-blue-900"
                size="sm"
                onClick={handleModalCronogramaPagos}
              >
                Cronograma de Pagos
                <FileText />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Historial de Movimientos
          </h2>
          <div className="pt-2 border-t border-slate-200">
            <DataTable
              columns={prestamosMovimientoColumns}
              data={prestamo?.movimientos || []}
            />
          </div>
        </div>
      </div>
    </>
  );
};
