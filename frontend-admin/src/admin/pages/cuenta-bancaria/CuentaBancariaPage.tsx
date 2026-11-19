import { AdminTitle } from "@/admin/components/AdminTitle";
import { CuentaBancariaComprovanteModal } from "@/admin/components/modal/CuentaBancariaComprovanteModal";
import { CuentaBancariaQrModal } from "@/admin/components/modal/CuentaBancariaQrModal";
import { CuentaBancariaRcivaModal } from "@/admin/components/modal/CuentaBancariaRcivaModal";
import { CuentaBancariaSafiModal } from "@/admin/components/modal/CuentaBancariaSafiModal";
import { CuentaBancariaSaldoFisicoModal } from "@/admin/components/modal/CuentaBancariaSaldoFisicoModal";
import { cuentaBancariaMovimientoColumns } from "@/admin/components/table/columns/cuenta-bancaria.movimiento.columns";
import { DataTable } from "@/admin/components/table/DataTable";
import { useGetCtaBancaria } from "@/admin/hooks/cuenta-bancaria/useGetCtaBancaria";
import { useModal } from "@/admin/hooks/useModal";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { MovimientoBancario } from "@/interfaces/cuenta-bancaria.response";

import { Edit, ListTodo, QrCode } from "lucide-react";

export const CuentaBancariaPage = () => {
  const { open } = useModal();
  const { isLoading, isError, error, data } = useGetCtaBancaria();

  const handleModalRciva = () => {
    open({
      content: (
        <CuentaBancariaRcivaModal ctaBancariaId={data?.ctaBancaria.id || 0} />
      ),
      title: "RC/IVA - INTERESES",
      size: "sm",
    });
  };
  const handleModalSaldoFisico = () => {
    open({
      content: (
        <CuentaBancariaSaldoFisicoModal
          ctaBancariaId={data?.ctaBancaria.id || 0}
        />
      ),
      title: "Saldo Físico",
      size: "sm",
    });
  };
  const handleModalSafi = () => {
    open({
      content: (
        <CuentaBancariaSafiModal ctaBancariaId={data?.ctaBancaria.id || 0} />
      ),
      title: "SAFI",
      size: "sm",
    });
  };
  const handleModalQr = () => {
    open({
      content: (
        <CuentaBancariaQrModal ctaBancariaId={data?.ctaBancaria.id || 0} />
      ),
      title: "Subir Codigo QR",
      size: "md",
    });
  };
  // Define handleModal: recibe el tipo y datos opcionales
  const handleModal = (type: string, data?: MovimientoBancario) => {
    switch (type) {
      case "comprobante":
        if (data) {
          open({
            content: <CuentaBancariaComprovanteModal data={data} />, // Pasa los datos al modal
            title: "Ver Comprobante",
            size: "lg", // Ajusta el tamaño según necesites
          });
        }
        break;
      // AgregaR más casos para otros tipos de modales si es necesario
      default:
        console.warn("Tipo de modal no reconocido:", type);
    }
  };
  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  if (isError) {
    return (
      <div>
        Error al cargar los datos de la cuenta bancaria:{" "}
        {error instanceof Error ? error.message : "Error desconocido"}
      </div>
    );
  }
  return (
    <>
      <div className="flex justify-between items-center">
        <AdminTitle
          title="Cuenta Bancaria Cooperativa"
          subtitle="Aquí puedes ver y administrar la cuenta bancaria general de la cooperativa."
        />
        <div className="flex justify-end mb-10 gap-4">
          <Button
            variant="outline"
            onClick={handleModalRciva}
            className="
                        flex items-center gap-2
                        border-sky-600 text-sky-700
                        hover:bg-sky-600 hover:text-white
                        transition-all duration-200
                        font-medium"
          >
            <ListTodo size={18} />
            RC/IVA - INTERESES
          </Button>
          <Button
            variant="outline"
            onClick={handleModalQr}
            className="
                        flex items-center gap-2
                        border-amber-600 text-amber-700
                        hover:bg-amber-600 hover:text-white
                        transition-all duration-200
                        font-medium"
          >
            <QrCode size={18} />
            Subir QR
          </Button>
          {/* <Button
            variant="outline"
            onClick={() => {}}
            className="
                        flex items-center gap-2
                        border-red-600 text-red-700
                        hover:bg-red-600 hover:text-white
                        transition-all duration-200
                        font-medium"
          >
            Migrar Cuenta
          </Button> */}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 ">
        <h3 className="text-lg font-semibold text-slate-700">
          Datos de la Cuenta
        </h3>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6">
          <div className="border border-gray-600 bg-gray-50 text-gray-600 rounded-2xl w-auto px-3 py-1 flex flex-col justify-between min-h-[80px]">
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-md font-bold text-center">
                {data?.ctaBancaria.nom_completo}
              </p>
            </div>
            <Separator />
            <p className="text-sm text-center">Nombre del Titular</p>
          </div>{" "}
          <div className="border border-gray-600 bg-gray-50 text-gray-600 rounded-2xl w-auto px-3 py-1 flex flex-col justify-between min-h-[80px]">
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-md font-bold text-center">
                {data?.ctaBancaria.nom_banco} - {data?.ctaBancaria.nro_cuenta}
              </p>
            </div>
            <Separator />
            <p className="text-sm flex items-center justify-center gap-2">
              Número de Cuenta
            </p>
          </div>
          {/* <div className="border border-gray-600 bg-gray-50 text-gray-600 rounded-2xl w-auto px-3 py-1 flex flex-col justify-between min-h-[80px]">
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-lg font-bold text-center">
                Bs. {data?.ctaBancaria.saldo_fisico || "0.00"}
              </p>
            </div>
            <Separator />
            <p className="text-sm flex items-center justify-center gap-2">
              Saldo Fisico
              <Edit
                className="w-4 h-4 cursor-pointer hover:text-gray-800"
                onClick={handleModalSaldoFisico}
              />
            </p>
          </div> */}
          <div className="border border-gray-600 bg-gray-50 text-gray-600 rounded-2xl w-auto px-3 py-1 flex flex-col justify-between min-h-[80px]">
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-lg font-bold text-center">
                Bs. {data?.ctaBancaria.saldoActual || "0.00"}
              </p>
            </div>
            <Separator />
            <p className="text-sm flex items-center justify-center gap-2">
              Saldo Teórico
            </p>
          </div>
          {/* <div className="border border-gray-600 bg-gray-50 text-gray-600 rounded-2xl w-auto px-3 py-1 flex flex-col justify-between min-h-[80px]">
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-lg font-bold text-center">
                Bs. {data?.ctaBancaria.safi || "0.00"}
              </p>
            </div>
            <Separator />
            <p className="text-sm flex items-center justify-center gap-2">
              SAFI Mercantil
              <Edit
                className="w-4 h-4 cursor-pointer hover:text-gray-800"
                onClick={handleModalSafi}
              />
            </p>
          </div> */}
          {/* <div className="border border-gray-600 bg-gray-50 text-gray-600 rounded-2xl w-auto px-3 py-1 flex flex-col justify-between min-h-[80px]">
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="text-lg font-bold text-center">Bs. 0.00</p>
            </div>
            <Separator />
            <p className="text-sm flex items-center justify-center gap-2">
              Variación
            </p>
          </div> */}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 mt-4">
        <h3 className="text-lg font-semibold text-slate-700">
          Movimientos de la Cuenta Bancaria (Cooperativa)
        </h3>
        <Separator className="mb-6" />
        <DataTable
          columns={cuentaBancariaMovimientoColumns(handleModal)}
          data={data?.movimientos || []}
        />
      </div>
    </>
  );
};
