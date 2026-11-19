import { Button } from "@/components/ui/button";
import { CustomJumbotron } from "@/user/components/CustomJumbotron";
import {
  Banknote,
  FileDown,
  FileText,
  Hash,
  Plus,
  TrendingDown,
} from "lucide-react";
import { SolicitarPrestamoModal } from "@/user/components/SolicitarPrestamoModal";
import { useModalStore } from "@/user/store/modal.store";
import { AmortizarPrestamoModal } from "@/user/components/AmortizarPrestamoModal";
import { useSocio } from "@/user/hooks/useSocio";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
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
import { Badge } from "@/components/ui/badge";
import { CronogramaPrestamoModal } from "@/user/components/prestamos_modals/CronogramaPrestamoModal";
import { useReportPdf } from "@/user/hooks/useReportPdf";

export const PrestamoPage = () => {
  const { openModal, closeModal } = useModalStore();
  const { isLoading, data } = useSocio();

  const { download, isDownloading } = useReportPdf({
    typePdf: "prestamoPdf",
    fechaIni: "31/08/1991",
    fechaFin: "31/08/1991",
    prestamoId: data?.socio.prestamo?.id || 0,
    socioId: data?.socio.id || 0,
  });
  const handleReportPdf = () => {
    if (data?.socio) {
      download();
    }
  };
  if (isDownloading) return <CustomFullScreenLoading />;

  if (isLoading) return <CustomFullScreenLoading />;

  if (isLoading) return <CustomFullScreenLoading />;

  const openSolicitarPertamo = () => {
    openModal(
      <SolicitarPrestamoModal
        onClose={closeModal}
        estado={data?.socio.prestamo?.estado!}
        estadoSoli={data?.socio.prestamo?.estadoSoli!}
      />,
      "Solicitar Préstamo",
    );
  };

  const openAmortizarPrestamo = () => {
    openModal(
      <AmortizarPrestamoModal
        onClose={closeModal}
        estado={data?.socio.prestamo?.estado!}
        estadoSoli={data?.socio.prestamo?.estadoSoli!}
      />,
      "Amortizar Préstamo",
    );
  };

  const openCronograma = () => {
    openModal(
      <CronogramaPrestamoModal
        onClose={closeModal}
        cronogramaCuotas={data?.socio.prestamo?.cuotasList || []}
        nomSocio={data?.socio.nombre || "Socio"}
      />,
      "Cronograma de Prestamo",
    );
  };

  // para el progreso
  const cuotas = data?.socio.prestamo?.cuotas ?? 0;
  const cuotasRestantes = data?.socio.prestamo?.cuotasRestates ?? 0;

  // const cuotasPagadas = cuotas - cuotasRestantes;
  // const progreso = (cuotasPagadas / cuotas) * 100;
  let cuotasPagadas = 0;

  if (
    data?.socio.prestamo?.estado === "EN REVISION" ||
    data?.socio.prestamo?.estado === "RECHAZADO" ||
    data?.socio.prestamo?.estado === "REFINANCIADO"
  ) {
    cuotasPagadas = cuotasRestantes;
  } else {
    cuotasPagadas = cuotas - cuotasRestantes;
  }
  const progreso = (cuotasPagadas / cuotas) * 100;

  return (
    <>
      <CustomJumbotron title="Mis Prestamos" subTitle="" />
      <div className="container mx-auto px-4 mt-6">
        {/* action buttons  */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={openSolicitarPertamo}
            className="group bg-linear-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-xl font-bold mb-1">Solicitar Préstamo</h3>
                <p className="text-emerald-100 text-sm">
                  Obtén tu préstamo rápido y seguro
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
            </div>
          </button>

          {/* si el prestamo trae datos, mostrar el botón de amortizar   */}
          {data?.socio.prestamo ? (
            <button
              onClick={openAmortizarPrestamo}
              className="group bg-linear-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-1">Amortizar Préstamo</h3>
                  <p className="text-blue-100 text-sm">
                    Reduce tu deuda con pagos anticipados
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
            </button>
          ) : (
            <> </>
          )}
        </div>
        {data?.socio.prestamo ? (
          <>
            {/* Datos prestamo */}
            <div className="bg-linear-to-br from-slate-700 to-slate-800 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center gap-2 mb-6">
                <Banknote className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Préstamo Actual</h2>
                <Badge variant="outline" className="text-white">
                  {data?.socio.prestamo.estado}
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Monto Original</p>
                  <p className="text-3xl font-bold">
                    Bs. {data?.socio.prestamo?.montoSolicitado ?? "0.00"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-1">Saldo Capital</p>
                  <p className="text-3xl font-bold text-amber-400">
                    Bs. {data?.socio.prestamo?.saldo ?? "0.00"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-1">Cuota Mensual</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    Bs. {data?.socio.prestamo?.cuotaMensual ?? "0.00"}
                  </p>
                </div>
                {data?.socio.prestamo?.cuotaMensual !==
                data?.socio.prestamo?.ultimaCuota ? (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Ultima Cuota</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      Bs. {data?.socio.prestamo?.ultimaCuota ?? "0.00"}
                    </p>
                  </div>
                ) : (
                  <></>
                )}

                <div>
                  <p className="text-slate-400 text-sm mb-1">
                    Cuotas Restantes
                  </p>
                  <p className="text-3xl font-bold text-blue-400">
                    {data?.socio.prestamo?.cuotasRestates ?? "0.00"}
                  </p>
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300 text-sm">
                    Progreso del Pago
                  </span>
                  <span className="text-white font-semibold">
                    {progreso.toFixed(0)} %
                  </span>
                </div>

                <div className="w-full bg-slate-600 rounded-full h-3 mb-4">
                  <div
                    className="bg-linear-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progreso}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs text-slate-400">Pagado</p>
                      <p className="text-sm font-semibold">
                        Bs.{" "}
                        {data?.socio.prestamo.totalPagado < 0
                          ? "0"
                          : data?.socio.prestamo?.totalPagado}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs text-slate-400">Cuotas Pagadas</p>
                      <p className="text-sm font-semibold">{cuotasPagadas}</p>
                    </div>
                  </div>
                </div>
              </div>
              {data?.socio.prestamo?.estado !== "EN REVISION" &&
              data?.socio.prestamo?.estado !== "RECHAZADO" ? (
                <div className="w-full text-right mt-5 ">
                  <Button
                    className="bg-blue-800"
                    size="sm"
                    onClick={openCronograma}
                  >
                    Cronograma de Pagos
                    <FileText />
                  </Button>
                </div>
              ) : (
                <></>
              )}
            </div>

            {/* historial */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-7">
              {data?.socio.prestamo?.movimientoPrestamo.length !== 0 ? (
                <div>
                  <div className="flex items-center justify-between ">
                    <h2 className="text-xl font-semibold mb-4">
                      Historial de movimientos
                    </h2>
                    {/* botron para descargar pdf de prestamos */}
                    <Button
                      variant="outline"
                      className="gap-2 border-blue-200 text-blue-400 hover:bg-blue-50"
                      onClick={handleReportPdf}
                    >
                      <FileDown className="w-5 h-5" />
                      Descargar PDF
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableCaption>
                        Lista del historial de movimientos del prestamo actual
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-25">Fecha</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Periodo</TableHead>
                          <TableHead>Cuota</TableHead>
                          <TableHead className="text-right">
                            Monto Cargo Bs.
                          </TableHead>
                          <TableHead className="text-right">
                            Monto Abono Bs.
                          </TableHead>
                          <TableHead className="text-right">
                            Saldo Capital Bs.
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* fila para mostrar el desembolso */}

                        {/* fin deembolso */}
                        {data?.socio.prestamo?.movimientoPrestamo.map(
                          (prestamo) => (
                            <TableRow key={prestamo.saldo_capital}>
                              <TableCell className="font-medium">
                                {formatDate(prestamo.fecha)}
                              </TableCell>

                              <TableCell className="">
                                <span className="text-xs font-semibold ">
                                  {prestamo.descripcion}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium">
                                {prestamo.periodo || "-"}
                              </TableCell>
                              <TableCell className="font-medium">
                                {prestamo.nro_cuota || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                {prestamo.cargo || "0.00"}
                              </TableCell>
                              <TableCell className="text-right">
                                {prestamo.abono || "0.00"}
                              </TableCell>
                              <TableCell className="text-right text-amber-600 font-semibold">
                                {prestamo.saldo_capital}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <p>Aun no se Registraron movimientos </p>
              )}
            </div>
          </>
        ) : (
          <p> No se encontraron registros de prestamos pendientes.</p>
        )}
      </div>
    </>
  );
};
