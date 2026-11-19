import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { QrCode, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocio } from "@/user/hooks/useSocio";

type Metodo = "qr" | "deposito";

const linkBackendImage = import.meta.env.VITE_API_URL_IMAGE;

export const MetodoTransferencia = () => {
  const { data } = useSocio();
  const [metodo, setMetodo] = useState<Metodo>("qr");

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="space-y-4">
        {/* Selector */}
        <RadioGroup
          value={metodo}
          onValueChange={(value) => setMetodo(value as Metodo)}
          className="grid grid-cols-2 gap-4"
        >
          <Label
            htmlFor="qr"
            className={`flex items-center justify-center gap-2 border rounded-lg p-3 cursor-pointer transition
              ${
                metodo === "qr" ? "border-primary bg-muted" : "hover:bg-muted"
              }`}
          >
            <RadioGroupItem value="qr" id="qr" />
            <QrCode className="w-4 h-4" />
            QR
          </Label>

          <Label
            htmlFor="deposito"
            className={`flex items-center justify-center gap-2 border rounded-lg p-3 cursor-pointer transition
              ${
                metodo === "deposito"
                  ? "border-primary bg-muted"
                  : "hover:bg-muted"
              }`}
          >
            <RadioGroupItem value="deposito" id="deposito" />
            <Landmark className="w-4 h-4" />
            Depósito
          </Label>
        </RadioGroup>

        <Separator />

        {/* Contenido dinámico */}
        {metodo === "qr" && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Escanea el código QR para realizar la transferencia
            </p>

            <div className="border rounded-lg p-3">
              <img
                src={`${linkBackendImage}${data?.socio.urlImageQrCoop}`}
                alt="QR de transferencia"
                className="w-48 h-48 object-contain"
              />
            </div>
            {/* <a
              //href="public/QrCode.png"
              //todo: aplicar en el futuro
              href={`http://localhost:3000/uploads/img/amortizado_con_ahorros.jpeg`}
              download="QR-Transferencia.png"
              target="_blank"
              // rel="noopener noreferrer"
            >
               <Button variant="outline" size="sm" className="gap-2">
                Descargar QR
              </Button> 
            </a>*/}
          </div>
        )}

        {metodo === "deposito" && (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Por favor conumiquese al siguiente número para coordinar el
              deposito personalmente con el administrador
            </p>

            <div className="border rounded-lg p-3 space-y-1">
              <p>
                <strong>Nombre:</strong> Miguel Novillo
              </p>
              <p>
                <strong>Celular:</strong> --------
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
