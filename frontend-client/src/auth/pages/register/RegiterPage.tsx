import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const RegiterPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0  ">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                {/* Logo */}
                <div className="flex items-center pb-2">
                  <img
                    className="w-36"
                    src="/lpsa4.png"
                    alt="logo la papelera"
                  />
                </div>
                <div className="flex items-center whitespace-nowrap mt-2">
                  <span className="font-montserrat text-xl m-0 whitespace-nowrap">
                    Solicita Una Cuenta
                  </span>
                  {/* <p className="text-muted-foreground m-0 px-2 whitespace-nowrap">
                    La Papelera S.A.
                  </p> */}
                </div>

                {/* <Link to="/" className="flex items-center whitespace-nowrap">
                  <span className="font-montserrat font-bold text-xl m-0 whitespace-nowrap">
                    Cooperativa |
                  </span>
                  <p className="text-muted-foreground m-0 px-2 whitespace-nowrap">
                    La Papelera S.A.
                  </p>
                </Link> */}
                {/* <p className="text-balance text-muted-foreground">
                  Ingrese a nuestro sistema
                </p> */}
              </div>
              <div className="grid gap-2">
                <Label>Número de Empleado</Label>
                <Input
                  type="number"
                  placeholder="Número de empleado"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="ci">Cédula de Identidad</Label>
                </div>
                <Input
                  id="ci"
                  type="number"
                  required
                  placeholder="Cédula de Identidad sin extencion"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="email">Correo Electronico</Label>
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="ejemplo@gmail.com"
                />
              </div>
              <Button className="w-full hover:bg-amber-700 bg-amber-600">
                Solicitar
              </Button>

              <div className="text-center text-sm">
                Regresar a{" "}
                <Link to="/auth/login" className="underline underline-offset-4">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              // src="/fachada.png"
              src="/fondo-login.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
