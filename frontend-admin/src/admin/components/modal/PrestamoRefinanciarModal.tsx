import { useEffect, useState } from "react";
import { useModal } from "@/admin/hooks/useModal";
import { generateCuotas } from "@/utils/generate.cuotas.utils";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Banknote, BanknoteArrowUp, HandCoins, Info } from "lucide-react";
import { SubirImagenCard } from "../SubirImagenCard";
import type { Prestamo, Refinanciado } from "@/interfaces/prestamo.response";
import { useApruebaRefinanciamiento } from "@/admin/hooks/prestamos/useApruebaRefinanciamiento";

interface Cuota {
  nro_cuota: number;
  monto: number;
}
interface Props {
  codPrestamo: string;
  nomSocio: string;
  refinanciamiento: Refinanciado | null;
  prestamo: Prestamo;
  cuotasRestantes: number;
}

export const PrestamoRefinanciarModal = ({
  codPrestamo,
  nomSocio,
  refinanciamiento,
  prestamo,
  cuotasRestantes,
}: Props) => {
  const saldoCapital = prestamo?.saldo_actual
    ? Number(prestamo.saldo_actual)
    : 0;

  const { close } = useModal();
  const { mutate, isPending } = useApruebaRefinanciamiento();
  //* datos para el refinanciamiento
  const [cuota, setCuota] = useState(
    refinanciamiento?.cuotas?.toString() || "",
  );
  const [montoSolicitado, setMontoSolicitado] = useState(
    Number(refinanciamiento?.monto_solicitado ?? 0),
  );
  const [imagen, setImagen] = useState<File | null>(null);
  const [cuotasGeneradas, setCuotasGeneradas] = useState<Cuota[]>([]);

  const montoTotal = saldoCapital + montoSolicitado;

  useEffect(() => {
    if (montoTotal > 0 && cuota) {
      const resultado = generateCuotas(montoTotal, Number(cuota));
      setCuotasGeneradas(resultado);
    }
  }, [montoTotal, cuota]);

  const cuotaMensual = cuotasGeneradas[0]?.monto || 0;
  const ultimaCuota = cuotasGeneradas[cuotasGeneradas.length - 1]?.monto || 0;
  //* cambiar a 10000
  const superaLimite = montoTotal > 10000;
  const handleImage = (file: File | null) => {
    setImagen(file);
    //console.log("Archivo recibido en modal:", file);
  };

  //*enviar data al backend
  const handleConfirmar = () => {
    mutate({
      codPrestamo,
      cuota,
      montoSolicitado,
      refinanciamientoId: refinanciamiento?.id ?? 0,
      estado: "APROBADO",
      file: imagen!,
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col justify-center items-center gap-2">
          <p className="text-center font-bold text-blue-papelera">{nomSocio}</p>
        </div>
        <Separator className="border-dashed border-t-2 border-muted-foreground/40" />
        {/* content */}
        <div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-2">
              <div className="border border-blue-papelera bg-gray-100 rounded-2xl w-auto p-2 text-center">
                <p className="text-sm"> Otorgado</p>
                <span className="text-lg font-bold">
                  Bs. {prestamo?.monto_otorgado ?? "0.00"}
                </span>
              </div>
              <div className="border border-amber-600 bg-amber-50 text-amber-600 rounded-2xl w-auto p-2 text-center">
                <p className="text-sm"> Saldo Capital</p>
                <span className="text-lg font-bold">
                  Bs. {prestamo?.saldo_actual ?? "0.00"}
                </span>
              </div>
              <div className="border border-blue-papelera bg-gray-100 rounded-2xl w-auto p-2 text-center">
                <p className="text-sm">Total Pagado</p>
                <span className="text-blue-papelera text-lg">
                  Bs. {prestamo?.totalPagado ?? "0.00"}
                </span>
              </div>
              <div className="border border-blue-papelera bg-gray-100 rounded-2xl w-auto p-2 text-center">
                <p className="text-sm">Cuotas Restantes</p>
                <span className="text-blue-papelera text-lg">
                  {cuotasRestantes ?? "0"}
                </span>
              </div>
              <div className="border border-blue-papelera  bg-gray-100  rounded-2xl w-auto p-2 text-center">
                <p className="text-sm">Cuota del Mes</p>
                <span className="text-blue-papelera text-lg">
                  Bs. {prestamo?.cuota_mensual ?? "0.00"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 text-blue-papelera font-bold">
              <BanknoteArrowUp className="h-5 w-5" />
              <span>Refinanciar Préstamo</span>
            </div>

            <div className="flex flex-col md:flex-row-reverse gap-3">
              <Alert
                className="
                          relative
                          border
                          border-border
                          border-l-5
                          border-l-red-400
                          bg-background
                        "
              >
                <Info className="h-4 w-4 " />

                <AlertDescription className="text-sm text-muted-foreground">
                  Al refinanciar el préstamo el saldo capital se sumara con el
                  monto a solicitar dando origen a un nuevo préstamo.
                  <p className="font-semibold">
                    Recuerde que esta suma no debe superar los Bs. 10,000
                  </p>
                  {superaLimite && (
                    <p className="text-sm text-red-500 font-medium">
                      El monto total no puede superar Bs. 10,000
                    </p>
                  )}
                </AlertDescription>
              </Alert>
              <div
                className="flex flex-col items-center gap-3 border border-l-5 rounded-md
                          border-l-blue-400 p-2 md:w-1/2 text-blue-papelera"
              >
                <div> Monto a solicitar </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xl font-semibold text-blue-papelera">
                    Bs.
                  </span>
                  <Input
                    type="number"
                    value={montoSolicitado || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/(\..*?)\..*/g, "$1")
                        .replace(/^(\d*)(\.\d{0,2})?.*$/, "$1$2");
                      setMontoSolicitado(Number(value));
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
              <Banknote /> Nuevo Préstamo
            </div>
            <Separator className="border-dashed border-t-2  border-emerald-700" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 ">
              <div className="flex flex-col border border-blue-papelera rounded-2xl p-2 gap-2">
                <span className="text-blue-papelera ">Monto Total</span>
                <div className="flex items-center justify-between gap-3   text-blue-papelera">
                  <span className="text-xl font-semibold text-amber-700">
                    Bs.
                  </span>
                  <p className="font-semibold text-3xl rounded-md border-b w-full text-right py-2 px-4  ">
                    {montoSolicitado > 0
                      ? (montoSolicitado + saldoCapital).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col border border-blue-papelera rounded-2xl p-2 gap-2">
                <span className="text-blue-papelera ">Número de Cuotas </span>

                <RadioGroup
                  value={cuota}
                  onValueChange={setCuota}
                  className="grid grid-cols-3 gap-2  "
                >
                  {["4", "6", "10", "12", "14"].map((value) => (
                    <div key={value}>
                      <RadioGroupItem
                        value={value}
                        id={`cuota-${value}`}
                        className="peer absolute inset-0 opacity-0"
                      />

                      <Label
                        htmlFor={`cuota-${value}`}
                        className="
              flex h-8 cursor-pointer items-center justify-center
               rounded-xl border border-slate-200 bg-white
               text-sm font-semibold text-slate-600
               shadow-sm transition-all duration-200
               hover:border-blue-papelera/50 
               peer-data-[state=checked]:border-blue-papelera
               peer-data-[state=checked]:bg-blue-papelera
               peer-data-[state=checked]:text-white
               peer-data-[state=checked]:shadow-md
               peer-focus-visible:ring-2
               peer-focus-visible:ring-blue-papelera
               peer-focus-visible:ring-offset-2
               dark:border-slate-700 dark:bg-slate-900
               dark:text-slate-300
            "
                      >
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              {/* Campo cuotas mensuales */}
              <div className="flex flex-col border  border-blue-papelera rounded-2xl p-2 gap-2">
                <span className="text-blue-papelera">Cuota Mensual </span>
                <div className="flex items-center justify-between gap-3  text-blue-papelera">
                  <span className="text-xl font-semibold text-amber-700">
                    Bs.
                  </span>
                  <p className=" text-3xl rounded-md border-b w-full text-right py-2 px-4  ">
                    {cuotaMensual.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col border  border-blue-papelera rounded-2xl p-2 gap-2">
                <span className="text-blue-papelera">Ultima Cuota </span>
                <div className="flex items-center justify-between gap-3  text-blue-papelera">
                  <span className="text-xl font-semibold text-amber-700">
                    Bs.
                  </span>
                  <p className=" text-3xl rounded-md border-b w-full text-right py-2 px-4  ">
                    {ultimaCuota.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <Separator className="border-dashed border-t-2 border-emerald-700" />
          </div>
        </div>
        <div className=" flex gap-2 font-bold mb-5">
          <HandCoins /> Comprobante de Transferencia
        </div>
        <SubirImagenCard onUpload={handleImage} />
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg text-sm text-zinc-600  hover:bg-zinc-100 transition-colors"
          >
            Cerrar
          </button>
          <button
            disabled={
              superaLimite ||
              !cuota ||
              montoSolicitado <= 0 ||
              !imagen ||
              isPending
            }
            className="flex gap-2 px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
            onClick={handleConfirmar}
          >
            {isPending ? "Aprobando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </>
  );
};
