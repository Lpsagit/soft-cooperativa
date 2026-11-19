import { AdminTitle } from "@/admin/components/AdminTitle";
import { DescuentosResumen } from "@/admin/components/DescuentosResumen";
import { DescuentosCargaModal } from "@/admin/components/modal/DescuentosCargaModal";
import { descuentosColumns } from "@/admin/components/table/columns/descuentos.columns";
import { DataTable } from "@/admin/components/table/DataTable";
import { useExportarExcelDescuentoPlanilla } from "@/admin/hooks/descuentos/useExportarExcelDescuentoPlanilla";
import { useGenerarDescuentoPlanilla } from "@/admin/hooks/descuentos/useGenerarDescuentoPlanilla";
import { useGetDescuentoPlanillaByMesAnio } from "@/admin/hooks/descuentos/useGetDescuentoPlanillaByMesAnio";
import { useModal } from "@/admin/hooks/useModal";
import { Button } from "@/components/ui/button";
import { confirmGenerateList } from "@/lib/alerts";
import { mesLiteral } from "@/utils/mesLiterar";
import { useState } from "react";

const currentDate = new Date();

const mesActual = String(currentDate.getMonth() + 1).padStart(2, "0");
const anioActual = String(currentDate.getFullYear());

export const DescuentosPage = () => {
  const { open } = useModal();
  const [mes, setMes] = useState(mesActual);
  const [anio, setAnio] = useState(anioActual);

  // estados usados por la query
  const [filters, setFilters] = useState({
    mes: "",
    anio: "",
  });

  const {
    data: descuentos,
    isLoading,
    isError,
    error,
  } = useGetDescuentoPlanillaByMesAnio(filters);

  const { mutate, isPending: isPendingGenerate } =
    useGenerarDescuentoPlanilla();

  const { mutate: exportExcelMutate, isPending: ispendingExportExcel } =
    useExportarExcelDescuentoPlanilla();

  //console.log("descuentos:", descuentos);

  const handleGenerateList = async () => {
    const confirmed = await confirmGenerateList();
    if (!confirmed) return;

    mutate({
      idDescuentoPlanilla: descuentos?.descuentoPlanilla!.id || 0,
    });

    console.log("generarndo lista de descuentos...");
  };

  const handleCargarDescuentos = () => {
    open({
      content: (
        <DescuentosCargaModal
          mes={mes}
          anio={anio}
          idDescuentoPlantilla={descuentos?.descuentoPlanilla!.id || 0}
        />
      ),
      title: "Cargar Descuentos",
      size: "md",
    });
  };

  const handleConsultar = () => {
    //console.log("consultando descuentos para:", { mes, anio });

    setFilters({
      mes,
      anio,
    });
  };

  const handleExportExcel = () => {
    exportExcelMutate({
      idDescuentoPlanilla: descuentos?.descuentoPlanilla!.id || 0,
    });
  };

  if (isError) return <div>Error: {String(error)}</div>;

  return (
    <>
      <div className="flex justify-between items-center">
        <AdminTitle
          title="Descuentos Por Planilla"
          subtitle="Aquí puedes generar y cargar los descuentos realizados por planillas."
        />
      </div>
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 w-full max-w-2xl">
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-800">
              Selección de Periodo
            </h2>
            <p className="text-sm text-slate-500">
              Elige el mes y año para gestionar la planilla de descuentos.
            </p>
          </div>

          {/* Contenido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MES */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">Mes</label>
              <select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="" disabled>
                  Mes
                </option>
                <option value="01">Enero</option>
                <option value="02">Febrero</option>
                <option value="03">Marzo</option>
                <option value="04">Abril</option>
                <option value="05">Mayo</option>
                <option value="06">Junio</option>
                <option value="07">Julio</option>
                <option value="08">Agosto</option>
                <option value="09">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
            </div>

            {/* AÑO */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">Año</label>
              <select
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className="h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="" disabled>
                  Año
                </option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="2030">2030</option>
              </select>
            </div>
            {/* Acción */}
            <div className="mt-6">
              <Button
                onClick={handleConsultar}
                disabled={!mes || !anio}
                className="w-full h-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm cursor-pointer "
              >
                Consultar
              </Button>
            </div>
          </div>
        </div>
      </div>
      {isPendingGenerate && (
        <div className="animate-pulse">Generando lista...</div>
      )}
      {isLoading && <div className="animate-pulse">Cargando...</div>}
      {/* si descuento no tiene data no mostrar nada */}

      {!descuentos ? (
        <div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 mt-5">
          {/* Header centrado */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-blue-papelera">
                {mesLiteral(descuentos.descuentoPlanilla?.mes || mes)} -{" "}
                {descuentos.descuentoPlanilla?.anio || anio}
              </h2>

              {/* Badge estado */}
              {descuentos.descuentoPlanilla?.is_discounted ? (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                  Descontado
                </span>
              ) : (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  Pendiente
                </span>
              )}
            </div>
          </div>

          <DescuentosResumen data={descuentos.listDescuento} />

          {/* Subheader */}
          <div className="flex md:flex-row sm:flex-col items-center justify-between  pt-4">
            <h3 className="text-lg font-semibold text-slate-700">
              Tabla de Descuentos Planilla
            </h3>
            <div className="flex  gap-2">
              {!descuentos.descuentoPlanilla?.is_discounted && (
                <button
                  className="flex items-center gap-2 border border-blue-300 text-blue-500 hover:bg-blue-100 hover:border-blue-400 text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer"
                  onClick={handleGenerateList}
                >
                  Generar Lista
                </button>
              )}

              {!descuentos.descuentoPlanilla?.is_discounted &&
                descuentos.descuentoPlanilla?.is_generated && (
                  <button
                    className="flex items-center gap-2 border border-amber-300 text-amber-500 hover:bg-amber-100 hover:border-amber-400 text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer"
                    onClick={handleCargarDescuentos}
                  >
                    Cargar descuentos
                  </button>
                )}
              {descuentos.descuentoPlanilla?.is_generated && (
                <button
                  onClick={handleExportExcel}
                  disabled={ispendingExportExcel}
                  className="flex items-center gap-2 border border-green-300 text-green-500 hover:bg-green-100 hover:border-green-400 text-sm font-medium px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  Exportar a Excel
                </button>
              )}
            </div>
          </div>
          {/* table */}
          <DataTable
            columns={descuentosColumns}
            data={descuentos?.listDescuento || []}
          />
        </div>
      )}
    </>
  );
};
