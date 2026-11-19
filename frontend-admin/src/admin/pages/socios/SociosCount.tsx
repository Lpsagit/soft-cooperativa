import { AdminTitle } from "@/admin/components/AdminTitle";
import { SocioCloseCountModal } from "@/admin/components/modal/SocioCloseCountModal";
import { SocioEditModal } from "@/admin/components/modal/SocioEditModal";
import { SocioEditUserModal } from "@/admin/components/modal/SocioEditUserModal";
import { ProfileField } from "@/admin/components/ProfileField";
import { useGetSocio } from "@/admin/hooks/socios/useGetSocio";
import { useResetPasswordSocio } from "@/admin/hooks/socios/useResetPasswordSocio";
import { useModal } from "@/admin/hooks/useModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { confirmResetPassword, infoAlert, successAlert } from "@/lib/alerts";
import { formatDate } from "@/utils/date.utils";
import { plantaName } from "@/utils/planta.name.util";
import { X } from "lucide-react";
import { Link, useParams } from "react-router";

export const SociosCount = () => {
  const { open } = useModal();
  const { id: cod_socio } = useParams();
  const { socio, isLoading, isError } = useGetSocio(cod_socio ?? null);
  const { mutateAsync } = useResetPasswordSocio();

  const handleEditSocioModal = () => {
    if (!socio) return;
    open({
      content: <SocioEditModal socio={socio} />,
      title: "Editar Socio",
      size: "lg",
    });
  };
  const handleCloseCountModal = () => {
    if (!socio) return;
    open({
      content: <SocioCloseCountModal socio={socio} />,
      title: "Cerrar Cuenta de Socio",
      size: "md",
    });
  };
  const handleEditUserModal = () => {
    if (!socio) return;
    open({
      content: (
        <SocioEditUserModal
          idSocio={socio.id}
          usuario={socio.user_socio || ""}
          codSocio={socio.cod_socio}
          rol={socio.user_admin || ""}
          nombre={socio.nom_completo}
        />
      ),
      title: "Editar Acceso al sistema",
      size: "sm",
    });
  };
  const handleResetPass = async () => {
    const confirmed = await confirmResetPassword();
    if (!confirmed) return;
    // llamar a query para actualizar
    try {
      await mutateAsync(socio?.id || 0);
      successAlert("Contraseña Reestablecida...!!!");
    } catch (error) {
      console.error("Error al reestablecer Contraseña:", error);
      infoAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al reestablecer Contraseña",
      );
    }

    await successAlert("Contraseña Socio Restablecida");
  };
  const handleResetPassAdmin = async () => {
    const confirmed = await confirmResetPassword();
    if (!confirmed) return;
    await successAlert("Contraseña Administrador Restablecida");
  };

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar socio</div>;

  return (
    <>
      <div className="flex justify-between items-center">
        <AdminTitle
          title={`Cuenta Socio`}
          subtitle={`Aquí podrás ver y editar la informacion de un socio.`}
        />
        <div className="flex justify-end mb-10 gap-4">
          <Button variant="outline">
            <Link to="/socios" className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cerrar
            </Link>
          </Button>
        </div>
      </div>
      {/* content socio*/}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-5 pb-5">
        <div className="flex justify-between items-center ">
          <h2 className="text-xl font-semibold text-slate-800 ">
            Datos del Socio{" "}
            {socio?.is_active ? (
              <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                ACTIVO
              </Badge>
            ) : (
              <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                Baja
              </Badge>
            )}
          </h2>
          <div className="flex flex-wrap gap-3 mt-3 justify-center  mb-2">
            <Button
              variant="outline"
              //   className=" transition-all duration-200 bg-amber-100 text-amber-700 hover:bg-amber-500 cursor-pointer hover:text-white"
              onClick={handleEditSocioModal}
            >
              Editar
            </Button>

            {socio?.is_active ? (
              <Button
                variant="outline"
                onClick={handleCloseCountModal}
                className=" bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 hover:bg-red-500 cursor-pointer hover:text-white"
              >
                Cerrar Cuenta
              </Button>
            ) : (
              <></>
              // <Button
              //   variant="outline"
              //   onClick={handleCloseCountModal}
              //   className=" bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 hover:bg-green-500 cursor-pointer hover:text-white"
              // >
              //   Reabrir Cuenta
              // </Button>
            )}
          </div>
        </div>
        <div className="container mx-auto px-4 border-t border-slate-200">
          <div className="flex flex-col md:flex-row w-full gap-5 p-6 mt-3 items-center ">
            <div className="flex-[3.5] p-5">
              <div className="flex justify-center ">
                <Avatar className="rounded-full w-50 h-50">
                  {" "}
                  <AvatarImage
                    src={`https://lapapelera-rrhh.com/sistema_rrhh/sis_personal/assets/img/fotos_personal/${socio?.foto}`}
                    alt="imagen"
                  />
                  <AvatarFallback>ER</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex flex-col w-full gap-2 text-center mt-5">
                <div className="text-center text-xl font-bold text-blue-papelera mb-3">
                  <p className="px-3 py-1 bg-gray-200 rounded-2xl">
                    {socio?.nom_completo}
                  </p>
                </div>
              </div>
            </div>
            {/* Columna de Información */}
            <div className="flex-[6.5] grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* */}
              <ProfileField
                label="Número De Carnet"
                value={`${socio?.ci} ${socio?.extencion_ci}`}
              />
              <ProfileField label="Direccion" value={socio?.direccion || "-"} />

              <ProfileField label="Celular" value={socio?.celular || "-"} />

              <ProfileField
                label="Correo Electronico"
                value={socio?.email || "-"}
              />
              <ProfileField
                label="Cuenta Bancaria"
                value={socio?.cuenta_bancaria || "-"}
              />
              <ProfileField
                label="Numero Referencia"
                value={socio?.num_referencia || "-"}
              />
              <ProfileField
                label="Fecha de ingreso"
                value={formatDate(socio?.fecha_ingreso) || "-"}
              />
              <ProfileField
                label="Planta"
                value={plantaName(socio?.planta_id) || "-"}
              />
            </div>
          </div>
        </div>
      </div>
      {/* content access */}
      {/* si fue dado de baja no mostrar el div de abajo */}
      {socio?.is_active && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-5 mt-5">
          <div className="flex justify-between items-center ">
            <h2 className="text-xl font-semibold text-slate-800 ">
              Datos de Accesso al Sistema
            </h2>
            <div className="flex flex-wrap gap-3 mt-3 justify-center  mb-2">
              <Button
                variant="outline"
                //   className=" transition-all duration-200 bg-amber-100 text-amber-700 hover:bg-amber-500 cursor-pointer hover:text-white"
                onClick={handleEditUserModal}
              >
                Editar
              </Button>

              <Button
                variant="outline"
                onClick={handleResetPass}
                className=" transition-all duration-200 bg-amber-100 text-amber-700 hover:bg-amber-500 cursor-pointer hover:text-white"
              >
                Restablecer contraseña
              </Button>
              {socio?.user_admin && (
                <Button
                  variant="outline"
                  onClick={handleResetPassAdmin}
                  className=" transition-all duration-200 bg-amber-100 text-amber-700 hover:bg-amber-500 cursor-pointer hover:text-white"
                >
                  Restablecer contraseña admin
                </Button>
              )}
            </div>
          </div>
          <div className="border-t border-slate-200 px-10 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* */}
              <ProfileField
                label="Usuario Socio"
                value={socio?.user_socio || "-"}
              />
              <ProfileField
                label="Rol"
                value={socio?.user_admin ? "Administrador" : "Socio"}
              />
              {socio?.user_admin && (
                <ProfileField
                  label="Usuario Administrador"
                  value={socio?.user_admin || "-"}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
