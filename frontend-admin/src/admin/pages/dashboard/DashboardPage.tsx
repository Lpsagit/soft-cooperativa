import ActivityFeed from "@/admin/components/ActivityFeed";
import { AdminTitle } from "@/admin/components/AdminTitle";
import StatCard from "@/admin/components/StatCard";
import { useGetDashboardData } from "@/admin/hooks/dashboard/useGetDashboard";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatDate } from "@/utils/date.utils";
import { formatNumberString } from "@/utils/format.number.string.utils";
import { mesLiteral } from "@/utils/mesLiterar";

import {
  Users,
  Banknote,
  TrendingUp,
  PiggyBank,
  HandCoins,
  Wallet,
} from "lucide-react";

export const DashboardPage = () => {
  const {
    isLoading,
    isError,
    error,
    data: dashboardData,
  } = useGetDashboardData();

  if (isLoading) return <CustomFullScreenLoading />;
  console.log(dashboardData);
  return (
    <>
      {/* Welcome Section */}
      <AdminTitle
        title="Dashboard Administrador"
        subtitle="Resumen general de la cooperativa."
      />

      {/* */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={PiggyBank}
          title={"Aportes por Pagar (Bs)"}
          value={formatNumberString(
            `${dashboardData?.dashboard.aportesPorPagar}`,
          )}
          color={" text-green-900 bg-green-500 border-green-500 "}
        />
        <StatCard
          icon={Banknote}
          title={"Préstamos por Cobrar (Bs)"}
          value={formatNumberString(
            `${dashboardData?.dashboard.prestamosPorCobrar}`,
          )}
          color={" text-yellow-900 bg-yellow-500 border-yellow-400 "}
        />
        <StatCard
          icon={TrendingUp}
          title={"Saldo Teorico (Bs)"}
          value={formatNumberString(`${dashboardData?.dashboard.saldoTeorico}`)}
          color={" text-sky-900 bg-sky-500 border-sky-400 "}
        />
        <StatCard
          icon={Users}
          title={"Socios"}
          value={`${dashboardData?.dashboard.totalSocios}`}
          color={" text-blue-900 bg-blue-500 border-blue-400 "}
        />
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 pb-5 pt-3 px-5 mb-8">
        <p className="text-lg text-blue-papelera font-semibold pb-2 mb-3">
          Ultimos Descuentos y Aportes -{" "}
          {mesLiteral(dashboardData?.dashboard.descuentosPlanilla.mes || "00")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          <StatCard
            icon={Wallet}
            title={"Aportes (Bs)"}
            value={formatNumberString(
              `${dashboardData?.dashboard.descuentosPlanilla.aportes}`,
            )}
            color={" text-blue-600 "}
          />
          <StatCard
            icon={HandCoins}
            title={"Descuentos Prestamos (Bs)"}
            value={formatNumberString(
              `${dashboardData?.dashboard.descuentosPlanilla.prestamos}`,
            )}
            color={" text-blue-600 "}
          />
          <StatCard
            icon={Users}
            title={"Total Des. Planilla (Bs)"}
            value={formatNumberString(
              `${dashboardData?.dashboard.descuentosPlanilla.total}`,
            )}
            color={" text-blue-600 "}
          />
        </div>
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-10 gap-6 mb-8 ">
        {/* tabla de movimientos */}
        <div className="col-span-7  bg-white rounded-xl shadow-lg border border-slate-200 pb-5 pt-3 px-5 mb-5">
          <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-4">
            Movimientos Generales
          </h3>
          <Separator />
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[700px]  ">
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead className="w-[100px]">Fecha</TableHead>
                  {/* <TableHead className="w-[100px]">Categoria</TableHead> */}
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead className="min-w-[100px]">Detalle</TableHead>
                  <TableHead className="text-right w-[120px]">Monto</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {dashboardData?.dashboard.ultimosMovimientos.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatDate(line.fecha)}
                    </TableCell>
                    {/* <TableCell>{line.categoria}</TableCell> */}
                    <TableCell>{line.tipo_operacion}</TableCell>
                    <TableCell className="truncate max-w-[250px]">
                      {line.detalle}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap text-amber-600 font-semibold">
                      Bs. {formatNumberString(line.monto)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="col-span-3 space-y-6">
          <ActivityFeed
            nombre={dashboardData?.dashboard.titular.nombre ?? "-"}
            ctaBancariaCooperativa={
              dashboardData?.dashboard.titular.ctaBancariaCooperativa ?? "-"
            }
            nomBanco={dashboardData?.dashboard.titular.nomBanco ?? "-"}
          />
        </div>
      </div>
    </>
  );
};
