import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useSolicitaRefinanciamiento } from "@/user/hooks/prestamos/useSolicitaRefinanciamiento";
import { useSocio } from "@/user/hooks/useSocio";
import { generateCuotas } from "@/utils/generate.cuotas.utils";
import { Banknote, BanknoteArrowUp, Info, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  onClose: () => void;
}
interface Cuota {
  nro_cuota: number;
  monto: number;
}

export const SecondPrestamo = ({ onClose }: Props) => {
  const [cuota, setCuota] = useState("");
  const { data } = useSocio();
  const { mutateAsync, isPending } = useSolicitaRefinanciamiento();

  const [montoSolicitado, setMontoSolicitado] = useState(0);
  const [cuotasGeneradas, setCuotasGeneradas] = useState<Cuota[]>([]);

  const prestamo = data?.socio.prestamo;

  const saldoCapital = prestamo?.saldo ? Number(prestamo.saldo) : 0;

  const montoTotal = saldoCapital + montoSolicitado;

  useEffect(() => {
    if (montoTotal > 0 && cuota) {
      const resultado = generateCuotas(montoTotal, Number(cuota));
      setCuotasGeneradas(resultado);
    }
  }, [montoTotal, cuota]);

  // Calcular la cuota mensual y la última cuota
  const cuotaMensual = cuotasGeneradas[0]?.monto || 0;
  const ultimaCuota = cuotasGeneradas[cuotasGeneradas.length - 1]?.monto || 0;

  const superaLimite = montoTotal > 10000;

  let cuotaDelMes = "0,00";

  if (prestamo?.cuotasRestates === 1) {
    cuotaDelMes = prestamo?.ultimaCuota ?? "0,00";
  } else {
    cuotaDelMes = prestamo?.cuotaMensual ?? "0,00";
  }

  //? para enviar al back
  const handleSolicitarPrestamo = async () => {
    if (superaLimite) {
      alert("El monto total del préstamo no puede superar los Bs. 10,000");
      return;
    }
    try {
      await mutateAsync({
        codPrestamo: prestamo?.codigo ?? "",
        montoSolicitado: montoSolicitado.toString(),
        cuotas: cuota,
      });

      onClose();
    } catch (error) {
      console.error(error);
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      {/* si tiene prestamos pendientes */}
      <div className="flex gap-2 text-amber-500 font-bold">
        <TriangleAlert className="h-5 w-5" />
        <span>Préstamo Pendiente</span>
      </div>

      {/* prueba para extender préstamo */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="border border-blue-papelera bg-gray-100 rounded-2xl w-auto p-2 text-center">
            <p className="text-sm"> Otorgado</p>
            <span className="text-lg font-bold">
              Bs. {prestamo?.montoOtorgado ?? "0,00"}
            </span>
          </div>
          <div className="border border-amber-600 bg-amber-50 text-amber-600 rounded-2xl w-auto p-2 text-center">
            <p className="text-sm"> Saldo Pendiente</p>
            <span className="text-lg font-bold">
              Bs. {prestamo?.saldo ?? "0,00"}
            </span>
          </div>
          <div className="border border-blue-papelera bg-gray-100 rounded-2xl w-auto p-2 text-center">
            <p className="text-sm">Total Pagado</p>
            <span className="text-blue-papelera text-lg">
              Bs. {prestamo?.totalPagado ?? "0,00"}
            </span>
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
              Bs. {cuotaDelMes}
            </span>
          </div>
        </div>
      </div>
      {/* fin prueba para extender préstamo */}

      <div className="flex gap-2 text-blue-papelera font-bold">
        <BanknoteArrowUp className="h-5 w-5" />
        <span>Refinanciar Préstamo</span>
      </div>

      {/* para el monto a refinanciar */}
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
            Al refinanciar el préstamo el saldo pendiente se sumará con el monto
            a solicitar dando origen a un nuevo préstamo.
            <p className="font-semibold">
              Recuerde que esta suma no debe superar los Bs. 10,000
            </p>
            {superaLimite && (
              <p className="text-sm text-red-500 font-bold">
                El monto total del préstamo no puede superar los Bs. 10,000
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

      {/* fin para el monto a refinanciar */}

      <div className=" flex gap-2 mb-1 font-bold text-emerald-700">
        <Banknote /> Nuevo Préstamo
      </div>
      <Separator className="border-dashed border-t-2 border-muted-foreground/40  " />

      {/* para las cuotas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 ">
        <div className="flex flex-col border border-blue-papelera rounded-2xl p-2 gap-2">
          <span className="text-blue-papelera ">Monto Total</span>
          <div className="flex items-center justify-between gap-3   text-blue-papelera">
            <span className="text-xl font-semibold text-amber-700">Bs.</span>
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
            <span className="text-xl font-semibold text-amber-700">Bs.</span>
            <p className=" text-3xl rounded-md border-b w-full text-right py-2 px-4  ">
              {cuotaMensual.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex flex-col border  border-blue-papelera rounded-2xl p-2 gap-2">
          <span className="text-blue-papelera">Ultima Cuota </span>
          <div className="flex items-center justify-between gap-3  text-blue-papelera">
            <span className="text-xl font-semibold text-amber-700">Bs.</span>
            <p className=" text-3xl rounded-md border-b w-full text-right py-2 px-4  ">
              {ultimaCuota.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      {/* fin para las cuotas */}

      <Separator className="border-dashed border-t-2 border-muted-foreground/40" />

      <div className="flex justify-end gap-2">
        <Button
          variant="success"
          onClick={handleSolicitarPrestamo}
          disabled={superaLimite || montoSolicitado <= 0 || !cuota || isPending}
        >
          Solicitar Préstamo
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};
