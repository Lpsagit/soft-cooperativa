import {
  Mail,
  Smartphone,
  MapPin,
  Building2,
  Users,
  Lock,
  Pencil,
} from "lucide-react";

interface ProfileModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onUpdate?: () => void;
}

export const BienvenidaPapelerito: React.FC<ProfileModalProps> = ({
  isOpen = true,
  onClose,
  onUpdate,
}) => {
  if (!isOpen) return null;

  return (
    <div className=" rounded-2xl sm:rounded-3xl bg-white flex flex-col">
      {/* Encabezado */}
      <div className="">
        <div className="mb-5 sm:mb-7">
          <div className="flex items-center "></div>

          <h2 className="text-xl sm:text-2xl font-bold text-blue-950 text-center">
            Actualiza tu perfil
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Por favor, completa o verifica la siguiente información. Esto nos
            permitirá brindarte una mejor atención, facilitar tus operaciones y
            mantenerte siempre informado.
          </p>
        </div>

        {/* Contenedor principal */}
        <div className="space-y-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
          {/* Grid responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Correo */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800">
                  Correo electrónico
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Te enviaremos notificaciones, comunicados y alertas
                  importantes.
                </p>
              </div>
            </div>

            {/* Cuenta bancaria */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                <Building2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800">
                  Cuenta bancaria
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Para depósitos, transferencias y otros servicios.
                </p>
              </div>
            </div>

            {/* Celular */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Smartphone className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800">Celular</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Para contacto rápido y seguro cuando sea necesario.
                </p>
              </div>
            </div>

            {/* Número de referencia */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Users className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800">
                  Número de referencia
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Nos ayuda a identificarte en nuestras operaciones.
                </p>
              </div>
            </div>

            {/* Dirección */}
            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <MapPin className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800">Dirección</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Para gestiones de la cooperativa.
                </p>
              </div>
            </div>
          </div>

          {/* Recomendación de seguridad */}
          <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 sm:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Lock className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h4 className="text-xs font-bold text-emerald-900">
                Te recomendamos cambiar tu contraseña
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                Por tu seguridad, utiliza una contraseña nueva y única para
                proteger tu cuenta y tu información personal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones fijos en la parte inferior */}
      <div className="shrink-0 border-t border-slate-100 bg-white p-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onUpdate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 active:scale-[0.98] sm:w-auto"
          >
            <Pencil className="h-4 w-4" />
            Actualizar ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default BienvenidaPapelerito;
