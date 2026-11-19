import { Link, useLocation } from "react-router";
import {
  Home,
  Users,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  Banknote,
  FileText,
  Landmark,
  ClipboardList,
} from "lucide-react";
import { CustomLogo } from "@/components/custom/CustomLogo";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
}) => {
  const { pathname } = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    { icon: PiggyBank, label: "Ahorros", to: "/ahorros" },
    { icon: Banknote, label: "Prestamos", to: "/prestamos" },
    { icon: Users, label: "Socios", to: "/socios" },
    { icon: ClipboardList, label: "Descuentos Planilla", to: "/descuentos" },
    { icon: Landmark, label: "Cta. Bancaria", to: "/cuenta-bancaria" },
    // { icon: FileText, label: "Reportes" },
  ];

  //console.log({ pathname });

  const isActiveRoute = (to: string) => {
    //todo: borrar lo de abajo
    if (pathname.includes("/products/") && to === "/products") {
      return true;
    }
    // no borrar
    if (pathname.includes("/socios/") && to === "/socios") {
      return true;
    }
    if (pathname.includes("/ahorros/") && to === "/ahorros") {
      return true;
    }
    if (pathname.includes("/prestamos/") && to === "/prestamos") {
      return true;
    }

    return pathname === to; // true, false
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out  ${
        isCollapsed ? "w-18" : "w-64"
      } flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between h-18">
        {!isCollapsed && <CustomLogo />}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={index}>
                <Link
                  to={item.to || "/"}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                    isActiveRoute(item.to || "/xxxx")
                      ? "bg-gray-50 text-blue-800 border-r-2 border-blue-800"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="px-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Desarrollado por
              </p>
              <p className="text-xs text-gray-500 truncate">
                Ronald Choquehuanca
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
