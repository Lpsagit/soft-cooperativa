import { useNavigate } from "react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useAuthStore } from "@/auth/store/auth.store";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isPosting, setIsPosting] = useState(false);

  const handleLogin = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsPosting(true);

    try {
      const formData = new FormData(event.currentTarget);

      const userName = formData.get("user") as string;
      const password = formData.get("pass") as string;

      const isValid = await login(userName, password);

      if (isValid) {
        navigate("/");
        return;
      }

      toast.error("Usuario y/o contraseña no válidos");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error("No se pudo iniciar sesión. Inténtalo nuevamente.");
    } finally {
      setIsPosting(false);
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0  ">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                {/* Logo */}
                <div className="flex items-center pb-2">
                  <img
                    className="w-36"
                    src="/cooperativa/lpsa4.png"
                    alt="logo la papelera"
                  />
                </div>
                <div className="flex flex-col items-center whitespace-nowrap mt-2">
                  <span className="font-montserrat text-xl m-0 whitespace-nowrap">
                    Iniciar Sesión
                  </span>
                  <p className="text-muted-foreground m-0 px-2 whitespace-nowrap">
                    Socios
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Usuario</Label>
                <Input
                  type="text"
                  id="user"
                  name="user"
                  placeholder="Mi usuario"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="pass"
                  required
                  placeholder="Contraseña"
                />
              </div>
              <Button
                className="w-full hover:bg-blue-800 bg-blue-900"
                disabled={isPosting}
              >
                Ingresar
              </Button>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              // src="/fachada.png"
              src="/cooperativa/fondo-login.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
