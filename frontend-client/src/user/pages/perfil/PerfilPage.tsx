import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CustomJumbotron } from "@/user/components/CustomJumbotron";
import { ProfileField } from "@/user/components/ProfileField";
import {
  Calendar1,
  EditIcon,
  IdCard,
  Landmark,
  Mail,
  MapPinHouse,
  Phone,
  User,
  UserCheck,
} from "lucide-react";
import { useSocio } from "@/user/hooks/useSocio";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { useAuthStore } from "@/auth/store/auth.store";
import { formatDate } from "@/utils/date.utils";
import BienvenidaPapelerito from "@/user/components/user_modals/BienvenidaPapelerito";
import { useModalStore } from "@/user/store/modal.store";

export const PerfilPage = () => {
  const { isLoading, data, isError } = useSocio();
  const { userAuth } = useAuthStore();
  const { openModal, closeModal } = useModalStore();

  if (isLoading) return <CustomFullScreenLoading />;
  if (isError || !data) {
    return <div>Error cargando el perfil</div>;
  }

  return (
    <>
      <CustomJumbotron title="Mi Perfil" subTitle="" />
      <div className="container mx-auto px-4 ">
        <div className="flex flex-col  gap-6 p-6 mt-3 items-center ">
          {/* Avatar */}
          <div className="flex justify-center lg:justify-start px-0 lg:px-10">
            <Avatar className="rounded-full w-32 h-32">
              {" "}
              <AvatarImage src="silueta1.png" alt="imagen" />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </div>

          {/* Columna de Información */}
          <div className="flex flex-col w-full gap-2 text-center lg:text-left">
            <div className="text-center text-2xl font-bold text-blue-papelera mb-3">
              <p className="px-3 py-1 bg-gray-200 rounded-2xl">
                {data?.socio.nombre ?? "-"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {/* */}
            <ProfileField
              label="Usuario"
              value={userAuth?.userName ?? "-"}
              icon={User}
            />
            <ProfileField
              label="Número De Carnet"
              value={data?.socio.ci ?? "-"}
              icon={IdCard}
            />
            <ProfileField
              label="Direccion"
              value={data?.socio.direccion ?? "-"}
              icon={MapPinHouse}
            />

            <ProfileField
              label="Celular"
              value={data?.socio.celular ?? "-"}
              icon={Phone}
            />

            <ProfileField
              label="Correo Electronico"
              value={data?.socio.email ?? "-"}
              icon={Mail}
            />
            <ProfileField
              label="Cuenta Bancaria"
              value={data?.socio.cuentaBancaria ?? "-"}
              icon={Landmark}
            />
            <ProfileField
              label="Numero Referencia"
              value={data?.socio.numReferencia ?? "-"}
              icon={UserCheck}
            />
            <ProfileField
              label="Fecha de ingreso"
              value={formatDate(data?.socio.fechaIngreso) ?? "-"}
              icon={Calendar1}
            />
            <div className="col-span-1 flex w-full">
              <Link to="/edit-perfil" className="w-full">
                <Button variant="warning" className="w-full ">
                  <EditIcon className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
