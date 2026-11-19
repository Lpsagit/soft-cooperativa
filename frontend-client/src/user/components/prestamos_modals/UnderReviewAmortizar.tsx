import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSocio } from "@/user/hooks/useSocio";
import { Info } from "lucide-react";

interface Props {
  onClose: () => void;
}
export const UnderReviewAmortizar = ({ onClose }: Props) => {
  const { data } = useSocio();
  const amortizacion = data?.socio.prestamo?.amortizacion[0];
  //console.log("amortizacion", amortizacion);
  return (
    <div className=" space-y-4">
      <Alert
        className="
        relative
        border
        border-border
        border-l-5
        border-l-blue-300
        bg-background
      "
      >
        <Info className="h-4 w-4 text-blue-500!" />

        <AlertDescription className="text-sm text-muted-foreground">
          La Transferencia bancaria esta en revisión...
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <div className="border border-blue-600 bg-blue-50 text-blue-900 rounded-2xl w-auto p-2 text-center">
          <p className="text-sm"> Monto Original</p>
          <span className="text-lg font-bold">
            Bs. {amortizacion?.saldo_original ?? "0.00"}
          </span>
        </div>
        <div className="border border-orange-600 bg-orange-50 text-orange-900 rounded-2xl w-auto p-2 text-center">
          <p className="text-sm"> Monto Amortizar</p>
          <span className="text-lg font-bold">
            Bs. {amortizacion?.monto ?? "0.00"}
          </span>
        </div>
        <div className="border border-green-600 bg-green-50 text-green-900 rounded-2xl w-auto p-2 text-center">
          <p className="text-sm"> Saldo Despues de Amortizar</p>
          <span className="text-lg font-bold">
            Bs. {amortizacion?.nuevo_saldo ?? "0.00"}
          </span>
        </div>
      </div>
      <div className="flex justify-end ">
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};
