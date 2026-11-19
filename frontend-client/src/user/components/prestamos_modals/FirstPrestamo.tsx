import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useSolicitaPrestamo } from "@/user/hooks/prestamos/useSolicitaPrestamo";

import { generateCuotas } from "@/utils/generate.cuotas.utils";
import { Info, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  onClose: () => void;
}
interface Cuota {
  nro_cuota: number;
  monto: number;
}

export const FirstPrestamo = ({ onClose }: Props) => {
  const [cuota, setCuota] = useState("");
  const [montoSolicitado, setMontoSolicitado] = useState(0);
  const [cuotasGeneradas, setCuotasGeneradas] = useState<Cuota[]>([]);
  const { mutateAsync, isPending } = useSolicitaPrestamo();

  useEffect(() => {
    if (montoSolicitado > 0 && cuota) {
      const resultado = generateCuotas(montoSolicitado, Number(cuota));
      setCuotasGeneradas(resultado);
    }
  }, [montoSolicitado, cuota]);

  const handleSolicitaPrestamo = async () => {
    try {
      await mutateAsync({
        monto: montoSolicitado.toString(),
        nroCuotas: cuota,
      });

      // Cierra el modal únicamente si la solicitud fue exitosa
      onClose();
    } catch (error) {
      // El error debe ser gestionado por tu hook o mostrado aquí
      console.error("Error al solicitar el préstamo:", error);
    }
  };

  const cuotaMensual = cuotasGeneradas[0]?.monto || 0;
  const ultimaCuota = cuotasGeneradas[cuotasGeneradas.length - 1]?.monto || 0;
  const superaLimite = montoSolicitado > 10000;

  //console.log({ cuotaMensual, ultimaCuota, superaLimite });
  return (
    <div className="space-y-4">
      <Alert
        className="
        relative
        border
        border-border
        border-l-5
        border-l-blue-400
        bg-background
      "
      >
        <Info className="h-4 w-4" />

        <AlertDescription className="text-sm text-muted-foreground">
          El monto máximo permitido es de Bs. 10000
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 ">
        <div className="flex flex-col border border-blue-papelera  rounded-2xl p-2 gap-2">
          <span className="text-blue-papelera ">Monto</span>
          <div className="flex items-center justify-between gap-3   text-blue-papelera">
            <span className="text-xl font-semibold text-amber-700">Bs.</span>
            <Input
              type="text"
              inputMode="numeric"
              value={montoSolicitado}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setMontoSolicitado(Number(value));
              }}
              placeholder="0"
              pattern="[0-9]*"
              className="
              h-14
              px-2
              text-3xl!
              leading-none!
              font-extrabold
              text-right
              tracking-wide
              py-0
              "
            />
          </div>
        </div>
        <div className="flex flex-col border border-blue-papelera rounded-2xl p-2 gap-2">
          <span className="text-blue-papelera ">Número de Cuotas</span>

          <RadioGroup
            value={cuota}
            onValueChange={setCuota}
            className="grid grid-cols-3 gap-2 "
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
        {ultimaCuota !== cuotaMensual ? (
          <div className="flex flex-col border  border-blue-papelera rounded-2xl p-2 gap-2 transition-all">
            <span className="text-blue-papelera">Ultima Cuota </span>
            <div className="flex items-center justify-between gap-3  text-blue-papelera">
              <span className="text-xl font-semibold text-amber-700">Bs.</span>
              <p className=" text-3xl rounded-md border-b w-full text-right py-2 px-4  ">
                {ultimaCuota.toFixed(2)}
              </p>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <Separator className="" />

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isPending}>
          Cerrar
        </Button>
        <Button
          disabled={superaLimite || !cuota || montoSolicitado <= 0 || isPending}
          className="flex gap-2 bg-green-600 text-white hover:bg-green-500 disabled:opacity-50"
          onClick={handleSolicitaPrestamo}
        >
          {isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Solicitando...
            </>
          ) : (
            "Solicitar préstamo"
          )}
        </Button>
      </div>
    </div>
  );
};
