import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSocio } from "@/user/hooks/useSocio";
import { Info } from "lucide-react";

interface Props {
  onClose: () => void;
}
export const UnderReviewPrestamo = ({ onClose }: Props) => {
  const { data } = useSocio();
  const prestamo = data?.socio.prestamo;
  return (
    <div className=" space-y-4">
      <Alert
        className="
        relative
        border
        border-border
        border-l-5
        border-l-amber-300
        bg-background
      "
      >
        <Info className="h-4 w-4 text-amber-500!" />

        <AlertDescription className="text-sm font-semibold">
          La solicitud se encuentra en revisión...
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2">
        <div className="border border-blue-600 bg-blue-50 text-blue-900 rounded-2xl w-auto p-2 text-center">
          <p className="text-sm"> Monto Solicitado</p>
          <span className="text-lg font-bold">
            Bs. {prestamo?.montoSolicitado}
          </span>
        </div>
        <div className="border border-blue-600 bg-blue-50 text-blue-900  rounded-2xl w-auto p-2 text-center">
          <p className="text-sm">Cuotas</p>
          <span className="text-blue-papelera text-lg">{prestamo?.cuotas}</span>
        </div>
        <div className="border border-blue-600 bg-blue-50 text-blue-900   rounded-2xl w-auto p-2 text-center">
          <p className="text-sm">Cuota Mensual</p>
          <span className="text-blue-papelera text-lg">
            Bs. {prestamo?.cuotaMensual}
          </span>
        </div>
        {prestamo?.ultimaCuota !== prestamo?.cuotaMensual ? (
          <div className="border border-blue-600 bg-blue-50 text-blue-900   rounded-2xl w-auto p-2 text-center">
            <p className="text-sm">Ultima Cuota</p>
            <span className="text-blue-papelera text-lg">
              Bs. {prestamo?.ultimaCuota}
            </span>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="flex justify-end ">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};
