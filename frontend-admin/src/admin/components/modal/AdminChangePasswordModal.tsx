import { useModal } from "@/admin/hooks/useModal";
import { useAuthStore } from "@/auth/store/auth.store";
import { Separator } from "@/components/ui/separator";
import { changePasswordErrorAlert, successAlert } from "@/lib/alerts";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useChangePassword } from "@/admin/hooks/useChangePassword";

export const AdminChangePasswordModal = () => {
  const { close } = useModal();
  const { userAuth, logout } = useAuthStore();
  const changePasswordMutation = useChangePassword();

  const [password, setPassword] = useState("");
  const [newPass, setNewPass] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const handleSubmit = async () => {
    if (!password || !newPass) return;

    try {
      await changePasswordMutation.mutateAsync({
        userName: userAuth?.userName || "",
        password,
        newPassword: newPass,
      });
      close();
      await successAlert("Contraseña actualizada");

      // 🔥 Cerrar sesión
      logout();
    } catch (error: any) {
      console.log(error.response?.data);
      await changePasswordErrorAlert();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2">
        <p className="text-center font-bold text-blue-papelera">
          {userAuth?.nombre}
        </p>
      </div>

      <Separator className="border-dashed border-t-2 border-muted-foreground/40" />

      <div className="grid gap-6">
        {/* Contraseña actual */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Contraseña Actual
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Nueva contraseña */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Nueva Contraseña
          </label>

          <div className="relative">
            <input
              type={showNewPass ? "text" : "password"}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full h-11 px-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />

            <button
              type="button"
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
          disabled={!password || !newPass || changePasswordMutation.isPending}
          className="px-4 py-2 rounded-lg text-sm bg-green-900 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {changePasswordMutation.isPending && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}

          {changePasswordMutation.isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
};
