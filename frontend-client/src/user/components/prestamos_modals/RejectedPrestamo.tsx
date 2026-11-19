import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BanknoteX } from "lucide-react";

interface Props {
  onClose: () => void;
}

export const RejectedPrestamo = ({ onClose }: Props) => {
  return (
    <div className="space-y-4">
      <Alert
        className="
        relative
        border
        border-border
        border-l-5
        border-l-red-300
        bg-background
      "
      >
        <BanknoteX className="h-4 w-4 text-red-500!" />

        <AlertDescription className="text-muted-foreground">
          La solicitud fue rechazada:
          <p className="font-semibold">
            El monto solicitado no se podrá pagar en 4 cuotas.{" "}
          </p>
          Por favor anule la solicitud para poder realizar otra.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
        <div className="border border-blue-600 bg-blue-50 text-blue-900 rounded-2xl w-auto p-2 text-center">
          <p className="text-sm"> Monto Solicitado</p>
          <span className="text-lg font-bold">Bs. 10,000</span>
        </div>
        <div className="border border-blue-600 bg-blue-50 text-blue-900  rounded-2xl w-auto p-2 text-center">
          <p className="text-sm">Cuotas</p>
          <span className=" font-bold text-lg">4</span>
        </div>
        <div className="border border-blue-600 bg-blue-50 text-blue-900   rounded-2xl w-auto p-2 text-center">
          <p className="text-sm">Cuota Mensual</p>
          <span className=" font-bold text-lg">Bs. 2,500</span>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button className="bg-red-800">Anular Solicitud</Button>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};
