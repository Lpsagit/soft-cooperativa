import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Banknote,
  HandCoins,
  Info,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { MetodoTransferencia } from "./MetodoTransferecia";
import { useSocio } from "@/user/hooks/useSocio";
import { calculateAmortization } from "@/utils/generate.cuotas.utils";
import { useSolicitaAmortizacion } from "@/user/hooks/prestamos/useSolicitaAmortizacion";
import { SubirImagenCard } from "../SubirImagenCard";

interface Props {
  onClose: () => void;
}
export const RequireAmortizar = ({ onClose }: Props) => {
  const { data } = useSocio();
  const [montoAmortizar, setMontoAmortizar] = useState<number>(0);
  const { mutateAsync, isPending } = useSolicitaAmortizacion();

  const [imagen, setImagen] = useState<File | null>(null);

  const prestamo = data?.socio.prestamo;

  const saldoCapital = prestamo?.saldo ? parseFloat(prestamo?.saldo) : 0;
  const cuotaMensual = prestamo?.cuotaMensual
    ? parseFloat(prestamo.cuotaMensual)
    : 0;

  const montoRestante = useMemo(
    () => saldoCapital - (montoAmortizar || 0),
    [montoAmortizar],
  );

  // calcula las cuotas nuevas cuotas y las mensualidades
  const { numeroCuotas, montoMensual, montoUltimoMes } = useMemo(() => {
    return calculateAmortization(montoRestante, cuotaMensual);
  }, [montoRestante, cuotaMensual]);

  const handleSolicitarAmortizacion = async () => {
    try {
      await mutateAsync({
        codPrestamo: prestamo?.codigo || "",
        montoAmortizar: montoAmortizar.toString(),
        file: imagen,
      });

      onClose();
    } catch (error) {
      console.error("Error al solicitar la amortización:", error);
    }
  };

  //para la imagen del comprobante
  const handleImage = (file: File | null) => {
    setImagen(file);
    //console.log("Archivo recibido en modal:", file);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 font-bold">
        <TriangleAlert className="h-5 w-5" />
        <span>Préstamo Actual</span>
      </div>

      {/* datos generales del prestamo */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="border border-amber-600 bg-amber-50 text-amber-600 rounded-2xl w-auto p-2 text-center">
          <p className="text-sm"> Saldo Pendiente</p>
          <span className="text-lg font-bold">
            Bs. {saldoCapital.toFixed(2)}
          </span>
        </div>
        <div className="border border-green-600 bg-green-50 text-green-600 rounded-2xl w-auto p-2 text-center">
          <p className="text-sm">Total Pagado</p>
          <span className="text-lg">Bs. {prestamo?.totalPagado ?? "0.00"}</span>
        </div>
        <div className="border border-blue-papelera bg-gray-100 rounded-2xl w-auto p-2 text-center">
          <p className="text-sm">Cuotas Restantes</p>
          <span className="text-blue-papelera text-lg">
            {prestamo?.cuotasRestates ?? "0"}
          </span>
        </div>
        <div className="border border-blue-papelera  bg-gray-100  rounded-2xl w-auto p-2 text-center">
          <p className="text-sm">Cuota del Mes</p>
          <span className="text-blue-papelera text-lg">
            Bs. {prestamo?.cuotaMensual ?? "0.00"}
          </span>
        </div>
        <div className="border border-blue-papelera  bg-gray-100  rounded-2xl w-auto p-2 text-center">
          <p className="text-sm">Cuota Ultimo Mes</p>
          <span className="text-blue-papelera text-lg">
            Bs. {prestamo?.ultimaCuota ?? "0.00"}
          </span>
        </div>
      </div>
      {/* fin datos generales del prestamo */}

      <div className="flex flex-col md:flex-row-reverse gap-3 mt-6">
        <Alert
          className="
           relative
           border
           border-border
           border-l-5
           border-l-amber-400
           bg-background
          "
        >
          <Info className="h-4 w-4 text-amber-400!" />

          <AlertDescription className="text-sm text-muted-foreground">
            <p>
              Al realizar pagos adicionales al Préstamo,
              <b className="font-bold">
                {" "}
                el monto de la cuota mensual no cambia
              </b>
              , pero se reduce el plazo de pago del préstamo (cuotas).{" "}
            </p>
          </AlertDescription>
        </Alert>
        <div
          className="flex flex-col items-center gap-3 border
        border-l-5 rounded-md
        border-l-green-400 p-2 md:w-1/2 text-blue-papelera"
        >
          <div> Monto a Amortizar </div>
          <div className="flex gap-2 items-center">
            <span className="text-xl font-semibold text-blue-papelera">
              Bs.
            </span>
            <Input
              type="number"
              value={montoAmortizar || ""}
              onChange={(e) => {
                // const value = e.target.value.replace(/\D/g, "");
                const value = e.target.value
                  .replace(/[^0-9.]/g, "")
                  .replace(/(\..*?)\..*/g, "$1")
                  .replace(/^(\d*)(\.\d{0,2})?.*$/, "$1$2");
                const numValue = Number(value);

                if (numValue <= saldoCapital) {
                  setMontoAmortizar(numValue);
                }
              }}
              inputMode="numeric"
              placeholder="0"
              pattern="[0-9]*"
              className="
              h-11
              px-2
              text-xl!
              leading-none!
              font-extrabold
              text-right
              tracking-wide
              py-0
              "
            />
          </div>
        </div>
      </div>

      <div className=" flex gap-2 mb-1 font-bold text-emerald-700">
        <Banknote /> Nuevo Saldo Pendiente
      </div>
      <Separator className="border-dashed border-t-2 border-muted-foreground/40  " />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 ">
        <div className="flex flex-col border border-blue-papelera rounded-2xl p-2 gap-2">
          <span className="text-blue-papelera ">Monto</span>
          <div className="flex items-center justify-between gap-3   text-blue-papelera">
            <span className="text-xl font-semibold text-amber-700">Bs.</span>
            <p className="font-semibold text-3xl rounded-md border-b w-full text-right py-2 px-4  ">
              {montoRestante.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex flex-col border border-blue-papelera rounded-2xl p-2 gap-2">
          <span className="text-blue-papelera ">Número de Cuotas </span>
          <div className="w-full text-right md:text-center text-3xl font-bold p-2">
            <p>{numeroCuotas}</p>
          </div>
        </div>

        {numeroCuotas > 1 && (
          <div className="flex flex-col border  border-blue-papelera rounded-2xl p-2 gap-2">
            <span className="text-blue-papelera">Cuota Mensual</span>
            <div className="flex items-center justify-between gap-3  text-blue-papelera">
              <span className="text-xl font-semibold text-amber-700">Bs.</span>
              <p className=" text-3xl rounded-md border-b w-full text-right py-2 px-4  ">
                {montoMensual.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {montoMensual !== montoUltimoMes && (
          <div className="flex flex-col border  border-blue-papelera rounded-2xl p-2 gap-2">
            <span className="text-blue-papelera">Ultima Cuota </span>
            <div className="flex items-center justify-between gap-3  text-blue-papelera">
              <span className="text-xl font-semibold text-amber-700">Bs.</span>
              <p className=" text-3xl rounded-md border-b w-full text-right py-2 px-4  ">
                {montoUltimoMes.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
      <Separator className="border-dashed border-t-2 border-muted-foreground/40" />

      {/* METODOS DE TRANSFERENCIA Y COMPROBANTE */}

      <div className=" flex gap-2 mb-1 font-bold ">
        <HandCoins /> Metodo de transferencia
      </div>
      <MetodoTransferencia />

      <Separator className="border-dashed border-t-2 border-muted-foreground/40" />

      <div className=" flex gap-2 mb-1 font-bold ">
        <HandCoins /> Comprobante de transferencia
      </div>
      <p className="text-sm text-muted-foreground">
        Por favor adjunte el comprobante de la transferencia para validar su
        solicitud. El tamaño máximo del archivo es de 5MB y debe ser en formato
        JPG, PNG o JPEG.
      </p>
      <SubirImagenCard onUpload={handleImage} />
      {/* FIN METODOS DE TRANSFERENCIA Y COMPROBANTE */}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <button
          disabled={
            !montoAmortizar ||
            montoAmortizar > saldoCapital ||
            isPending ||
            !imagen
          }
          className="flex gap-2 px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
          onClick={handleSolicitarAmortizacion}
        >
          {isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Solicitando...
            </>
          ) : (
            "Solicitar Amortización"
          )}
        </button>
      </div>
    </div>
  );
};
