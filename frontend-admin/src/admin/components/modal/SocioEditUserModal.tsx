import { useUpdateUserSocio } from "@/admin/hooks/socios/useUpdateUserSocio";
import { useModal } from "@/admin/hooks/useModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { infoAlert, successAlert } from "@/lib/alerts";
import { useState } from "react";

type Role = "socio" | "admin" | "";

interface Props {
  usuario: string;
  rol: string;
  nombre: string;
  codSocio: string;
  idSocio?: number;
}

export const SocioEditUserModal = ({
  usuario,
  idSocio,
  rol,
  nombre = "",
  codSocio = "",
}: Props) => {
  const { close } = useModal();
  const { mutateAsync, isPending } = useUpdateUserSocio();
  const [role, setRole] = useState<Role>(rol === "" ? "socio" : "admin");
  const [username, setUsername] = useState(usuario);

  const handleSubmit = async () => {
    try {
      await mutateAsync({
        idSocio: idSocio || 0,
        rol: role,
        userName: username,
        codSocio,
      });
      await successAlert("Usuario Actualizado");
    } catch (error) {
      console.error("Error al actualizar el socio:", error);
      infoAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al actualizar el perfil",
      );
    }

    close();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <p className="text-center font-bold text-blue-papelera">{nombre}</p>
      </div>

      <Separator className="border-dashed border-t-2 border-muted-foreground/40" />

      <div className="grid gap-6">
        {/* Usuario */}
        <div>
          <label className="block text-sm font-semibold mb-2">Usuario</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-11 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            placeholder="rchoquehuanca"
          />
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-semibold mb-2">Rol</label>
          <Select value={role} onValueChange={(val) => setRole(val as Role)}>
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="Seleccione opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="socio">Socio</SelectItem>
              <SelectItem value="admin">Socio - Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={close}
          className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100"
        >
          Cancelar
        </button>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm bg-green-900 text-white hover:bg-green-700 disabled:opacity-50"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};
