import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";

interface Props {
  onClose: () => void;
}
export const ApprovedAmortizar = ({ onClose }: Props) => {
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
        <CircleCheck className=" text-green-600!" />
        <AlertDescription>
          Deposito bancario registrado exitosamente.
        </AlertDescription>
      </Alert>
      <div className="flex justify-end gap-2">
        <Button variant="success">Realizar Otra Amortización</Button>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};
