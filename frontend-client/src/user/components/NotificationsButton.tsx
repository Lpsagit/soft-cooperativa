import { useState } from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type Notification = {
  id: number;
  title: string;
  description: string;
  read: boolean;
};

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "Nuevo depósito",
    description: "Se registró un nuevo ahorro",
    read: false,
  },
  {
    id: 2,
    title: "Préstamo aprobado",
    description: "Tu préstamo fue aprobado",
    read: false,
  },
  {
    id: 3,
    title: "Pago registrado",
    description: "Pago recibido correctamente",
    read: false,
  },
  {
    id: 4,
    title: "Amortizacion registrada",
    description: "Amortizacion recibido correctamente",
    read: false,
  },
];

export const NotificationsButton = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold">Notificaciones</h4>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:underline"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        <Separator />

        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              No hay notificaciones
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 text-sm cursor-pointer hover:bg-muted ${
                  !notification.read ? "bg-muted/50" : ""
                }`}
              >
                <p className="font-medium">{notification.title}</p>
                <p className="text-muted-foreground text-xs">
                  {notification.description}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
