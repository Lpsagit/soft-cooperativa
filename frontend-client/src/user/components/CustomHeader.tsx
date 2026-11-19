import { User, PiggyBank, KeyRound, LogOut, Home, Wallet } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router";
import { useAuthStore } from "@/auth/store/auth.store";
import { useModalStore } from "../store/modal.store";
import { ChangePasswordModal } from "./user_modals/ChangePasswordModal";

export const CustomHeader = () => {
  const { userAuth, logout } = useAuthStore();
  const { openModal, closeModal } = useModalStore();
  const handleChangePasswordModal = () => {
    openModal(
      <ChangePasswordModal onClose={closeModal} />,
      "Cambiar Contraseña",
    );
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <img className="w-36 " src="/cooperativa/lpsa4.png" alt="" />
          </div>

          {/* Navigation - Desktop 
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Mis Ahorros
            </a>
            <a
              href="#"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Mis Prestamos
            </a>
          </nav>*/}

          {/* Search and Cart */}
          <div className="flex items-center space-x-4">
            {/* <NotificationsButton /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    className=""
                    src="/cooperativa/silueta1.png"
                    // src="https://lapapelera-rrhh.com/sistema_rrhh/sis_personal/assets/img/fotos_personal/1929_1929_ronald.jpg"
                  />
                  <AvatarFallback>
                    {userAuth?.nombre.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                  <p className=" text-center py-1.5 rounded-2xl pointer-events-none inset-ring inset-ring-gray-200 shadow text-blue-papelera">
                    {userAuth?.nombre}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/">
                  <DropdownMenuItem className="cursor-pointer text-blue-papelera flex items-center gap-2 transition-transform duration-150 active:scale-95 hover:bg-gray-100">
                    <Home className="mr-2 h-4 w-4 text-blue-papelera" /> Inicio
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link to="/perfil">
                  <DropdownMenuItem className="cursor-pointer text-blue-papelera flex items-center gap-2 transition-transform duration-150 active:scale-95 hover:bg-gray-100">
                    <User className="mr-2 h-4 w-4 text-blue-papelera" /> Mi
                    Perfil
                  </DropdownMenuItem>
                </Link>
                <Link to="/ahorros">
                  <DropdownMenuItem className="cursor-pointer text-blue-papelera flex items-center gap-2 transition-transform duration-150 active:scale-95 hover:bg-gray-100">
                    <PiggyBank className="mr-2 h-4 w-4 text-blue-papelera" />{" "}
                    Mis Ahorros
                  </DropdownMenuItem>
                </Link>
                <Link to="/prestamos">
                  <DropdownMenuItem className="cursor-pointer text-blue-papelera flex items-center gap-2 transition-transform duration-150 active:scale-95 hover:bg-gray-100">
                    <Wallet className="mr-2 h-4 w-4 text-blue-papelera" /> Mis
                    Préstamos
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-blue-papelera flex items-center gap-2 transition-transform duration-150 active:scale-95 hover:bg-gray-100"
                  onClick={handleChangePasswordModal}
                >
                  <KeyRound className="mr-2 h-4 w-4 text-blue-papelera" />{" "}
                  Cambiar Contraseña
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
        </div>
      </div>
    </header>
  );
};
