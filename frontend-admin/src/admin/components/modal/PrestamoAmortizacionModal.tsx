import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Banknote, HandCoins, Info } from "lucide-react";

import { useModal } from "@/admin/hooks/useModal";
import { SubirImagenCard } from "../SubirImagenCard";
import { Card, CardContent } from "@/components/ui/card";
import { calculateAmortization } from "@/utils/generate.cuotas.utils";
import { Button } from "@/components/ui/button";
import type { Amortizado, Prestamo } from "@/interfaces/prestamo.response";
import { useApruebaAmortizacion } from "@/admin/hooks/prestamos/useApruebaAmortizacion";
import { useGetSaldoAhorroByCodSoc } from "@/admin/hooks/ahorros/useGetSaldoAhorroByCodSoc";

interface Props {
  codPrestamo: string;
  nomSocio: string;
  amortizacion: Amortizado | null;
  prestamo: Prestamo;
  cuotasRestantes: number;
}

export const PrestamoAmortizacionModal = ({
  codPrestamo,
  nomSocio,
  amortizacion,
  prestamo,
  cuotasRestantes,
}: Props) => {
  const { close } = useModal();
  const [imagen, setImagen] = useState<File | null>(null);
  const {
    mutate: getSaldoAhorro,
    data: dataSaldoAhorro,
    isPending: isPendingGetSaldoAhorro,
    error: getSaldoAhorroError,
  } = useGetSaldoAhorroByCodSoc();
  const [montoAmortizar, setMontoAmortizar] = useState<number>(
    Number(prestamo.amortizado?.monto ?? 0),
  );
  const [saldoAhorro, setSaldoAhorro] = useState<number>(0);
  const [saldoAhorroButton, setSaldoAhorroButton] = useState<boolean>(false);
  const { mutate, isPending } = useApruebaAmortizacion();

  const saldoCapital = prestamo.saldo_actual
    ? parseFloat(prestamo.saldo_actual)
    : 0;
  const cuotaMensual = prestamo.cuota_mensual
    ? parseFloat(prestamo.cuota_mensual)
    : 0;

  const montoRestante = useMemo(
    () => saldoCapital - (montoAmortizar || 0),
    [montoAmortizar],
  );

  // calcula las cuotas nuevas cuotas y las mensualidades
  const { numeroCuotas, montoMensual, montoUltimoMes } = useMemo(() => {
    return calculateAmortization(montoRestante, cuotaMensual);
  }, [montoRestante, cuotaMensual]);

  const handleImage = (file: File | null) => {
    setImagen(file);
    //console.log("imagen cargada : ", imagen);
    //console.log("Archivo recibido en modal:", file);
  };

  //para llamara datos del ahorros de cocio
  const handleGetSaldoAhorro = () => {
    if (saldoAhorroButton) {
      setSaldoAhorroButton(false);
      setSaldoAhorro(0);
      return;
    }

    getSaldoAhorro(prestamo.cod_socio ?? "", {
      onSuccess: (data) => {
        setSaldoAhorro(parseFloat(data?.ctaAhorro?.saldo_actual ?? "0.00"));
        console.log("Saldo de ahorro obtenido:", data);
        setSaldoAhorroButton(true);
      },
      onError: (error) => {
        console.error("Error al obtener saldo de ahorro:", error);
        setSaldoAhorroButton(false);
      },
    });
  };

  // maneja la confirmacion de la amortizacion
  const handleConfirmar = () => {
    mutate({
      codPrestamo,
      montoAmortizar,
      estado: "APROBADO",
      amortizacionId: amortizacion?.id ?? null,
      codAhorro: dataSaldoAhorro?.ctaAhorro?.codigo ?? null,
      file: imagen ?? undefined,
    });

    // console.log("codPrestamo:", codPrestamo);
    // console.log("montoAmortizar:", montoAmortizar);
    // console.log("estado:", "APROBADO");
    // console.log("amortizacionId:", amortizacion?.id ?? null);
    // console.log("codAhorro:", dataSaldoAhorro?.ctaAhorro?.codigo ?? null);
    // console.log("file:", imagen);

    // Cierra el modal después de confirmar
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col justify-center items-center gap-2">
          <p className="text-center font-bold text-blue-papelera">{nomSocio}</p>
        </div>
        <Separator className="border-dashed border-t-2 border-muted-foreground/40" />
        {/* content */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-2">
            <div className="border border-amber-600 bg-amber-50 text-amber-600 rounded-2xl w-auto p-2 text-center">
              <p className="text-sm"> Saldo Capital</p>
              <span className="text-lg font-bold">
                Bs. {saldoCapital.toFixed(2)}
              </span>
            </div>
            <div className="border border-green-600 bg-green-50 text-green-600 rounded-2xl w-auto p-2 text-center">
              <p className="text-sm">Total Pagado</p>
              <span className="text-lg">
                Bs. {prestamo.totalPagado ?? "0.00"}
              </span>
            </div>
            <div className="border border-blue-papelera bg-gray-100 rounded-2xl w-auto p-2 text-center">
              <p className="text-sm">Cuotas Restantes</p>
              <span className="text-blue-papelera text-lg">
                {cuotasRestantes}
              </span>
            </div>
            <div className="border border-blue-papelera  bg-gray-100  rounded-2xl w-auto p-2 text-center">
              <p className="text-sm">Cuota del Mes</p>
              <span className="text-blue-papelera text-lg">
                Bs. {prestamo.cuota_mensual ?? "0.00"}
              </span>
            </div>
            <div className="border border-blue-papelera  bg-gray-100  rounded-2xl w-auto p-2 text-center">
              <p className="text-sm">Cuota Ultimo Mes</p>
              <span className="text-blue-papelera text-lg">
                Bs. {prestamo.ultima_cuota ?? "0.00"}
              </span>
            </div>
          </div>

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
                Al realizar pagos adicionales al capital, la cuota mensual no
                cambia, pero se reduce el plazo del préstamo(cuotas).
                {/* se  oculta el div si es que existe prestamo.amortizado  */}
                {!prestamo.amortizado && (
                  <div className="flex gap-2 items-center justify-around mt-2">
                    {/* dar estilos al boton en caso de que sea falso */}
                    <Button
                      variant={"outline"}
                      className={
                        saldoAhorroButton
                          ? "hover:border-green-300  hover:text-green-600 hover:bg-green-50 text-green-600"
                          : "hover:border-gray-300 hover:text-gray-500 hover:bg-gray-100 text-gray-500"
                      }
                      onClick={handleGetSaldoAhorro}
                    >
                      {" "}
                      Amortizar con Ahorros{" "}
                    </Button>
                    {saldoAhorroButton ? (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Saldo de Ahorro Disponible:
                        </span>
                        <p className="text-lg font-bold">
                          Bs. {saldoAhorro?.toFixed(2) ?? "0.00"}
                        </p>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
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
                  disabled={prestamo.amortizado ? true : false}
                  value={montoAmortizar || ""}
                  onChange={(e) => {
                    // const value = e.target.value.replace(/\D/g, "");
                    const value = e.target.value
                      .replace(/[^0-9.]/g, "")
                      .replace(/(\..*?)\..*/g, "$1")
                      .replace(/^(\d*)(\.\d{0,2})?.*$/, "$1$2");
                    const numValue = Number(value);
                    if (saldoAhorroButton) {
                      if (numValue <= saldoAhorro) {
                        setMontoAmortizar(numValue);
                      }
                    } else {
                      if (numValue <= saldoCapital) {
                        setMontoAmortizar(numValue);
                      }
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
            <Banknote /> Nuevo Saldo Capital
          </div>
          <Separator className="border-dashed border-t-2 border-muted-foreground/40  " />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 ">
            <div className="flex flex-col border border-blue-papelera rounded-2xl p-2 gap-2">
              <span className="text-blue-papelera ">Monto</span>
              <div className="flex items-center justify-between gap-3   text-blue-papelera">
                <span className="text-xl font-semibold text-amber-700">
                  Bs.
                </span>
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
                  <span className="text-xl font-semibold text-amber-700">
                    Bs.
                  </span>
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
                  <span className="text-xl font-semibold text-amber-700">
                    Bs.
                  </span>
                  <p className=" text-3xl rounded-md border-b w-full text-right py-2 px-4  ">
                    {montoUltimoMes.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
          <Separator className="border-dashed border-t-2 border-muted-foreground/40" />

          <div className=" flex gap-2 font-bold mb-5">
            <HandCoins /> Comprobante de Transferencia
          </div>
          {/* comprobante de pago */}
          {isPending ? (
            <p>Aprobando Amortizacion por favor espere...</p>
          ) : (
            <div>
              {prestamo.amortizado?.comprobante ? (
                <div>
                  <Card className="w-full max-w-md mx-auto h-auto">
                    <CardContent>
                      <img
                        src={`https://lapapelera-rrhh.com/api-coop/${prestamo.amortizado.comprobante} `}
                        className="w-full h-auto object-cover rounded-md"
                        alt="Comprobante de Transferencia"
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <SubirImagenCard onUpload={handleImage} />
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            disabled={
              !montoAmortizar || montoAmortizar > saldoCapital || isPending
            }
            className="flex gap-2 px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
            onClick={handleConfirmar}
          >
            Confirmar
          </button>
        </div>
      </div>
    </>
  );
};
