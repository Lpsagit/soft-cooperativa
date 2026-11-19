import { Link } from "react-router";

import { KeyRound, LogOut } from "lucide-react";
import { NotificationsButton } from "./NotificationsButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/auth/store/auth.store";
import { useModal } from "../hooks/useModal";
import { AdminChangePasswordModal } from "./modal/AdminChangePasswordModal";

export const AdminHeader: React.FC = () => {
  const { userAuth, logout } = useAuthStore();
  const { open } = useModal();

  const handleChangePassword = () => {
    open({
      title: "Cambiar Contraseña",
      content: <AdminChangePasswordModal />,
      size: "sm",
    });
  };
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 h-18">
      <div className="flex items-center justify-between">
        {/*  */}
        <div className="flex-1 max-w-md">
          <div className="relative"></div>
        </div>
        <div className="flex items-center space-x-4">
          {/* <NotificationsButton /> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="w-10 h-10">
                <AvatarImage
                  className=""
                  src="/cooperativa/admin_coop/silueta1.png"
                  // src="https://lapapelera-rrhh.com/sistema_rrhh/sis_personal/assets/img/fotos_personal/1929_1929_ronald.jpg"
                />
                <AvatarFallback>111111</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>
                <p className=" text-center py-1.5 rounded-2xl pointer-events-none inset-ring inset-ring-gray-200 shadow text-blue-papelera">
                  {userAuth?.nombre}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer text-blue-papelera flex items-center gap-2 transition-transform duration-150 active:scale-95 hover:bg-gray-100"
                onClick={handleChangePassword}
              >
                <KeyRound className="mr-2 h-4 w-4 text-blue-papelera" /> Cambiar
                Contraseña
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link to="/auth/login">
                <DropdownMenuItem
                  className="cursor-pointer text-blue-papelera flex items-center gap-2 transition-transform duration-150 active:scale-95 hover:bg-gray-100"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <p className="text-red-500 ">Cerrar Sesion</p>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Actions 
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MessageSquare size={20} />
          </button>

          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={20} />
          </button>

          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:shadow-lg transition-shadow">
            JD
          </div>
        </div>*/}
      </div>
    </header>
  );
};
