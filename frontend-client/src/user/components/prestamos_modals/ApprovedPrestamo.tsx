import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Banknote } from "lucide-react";

interface Props {
  onClose: () => void;
}
export const ApprovedPrestamo = ({ onClose }: Props) => {
  return (
    <div className="space-y-4">
      <Alert
        className="
        relative
        border
        border-border
        border-l-5
        border-l-green-600
        bg-background
        mb-5
      "
      >
        <Banknote className=" text-green-600!" />
        <AlertTitle>El Préstamo fue Aprobado.</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          Por favor verifique la transacción y confirme la misma dando click en
          el boton confirmar depósito.
        </AlertDescription>
      </Alert>
      <div className="flex content-center justify-center border-dashed border-2 rounded-2xl p-2 border-muted-foreground/20">
        <img src="/Recibo02.jpg" alt="" className=" md:max-w-1/2 " />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="success">Confirmar Depósito</Button>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};
