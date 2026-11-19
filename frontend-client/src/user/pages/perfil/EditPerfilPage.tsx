import { useAuthStore } from "@/auth/store/auth.store";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Button } from "@/components/ui/button";
import { infoAlert, successAlert } from "@/lib/alerts";
import { CustomJumbotron } from "@/user/components/CustomJumbotron";
import { useSocio } from "@/user/hooks/useSocio";
import { Landmark, Mail, MapPin, Phone, User, UserCheck } from "lucide-react";
import { useEffect } from "react";

import { useForm } from "react-hook-form";

type UpdatePerfilForm = {
  socio: {
    id: number;
    codSocio: string;
    email: string;
    celular: string;
    numReferencia: string;
    direccion: string;
    cuentaBancaria?: string;
  };
};

export const EditPerfilPage = () => {
  const { isLoading, data, isError, mutation } = useSocio();
  const { userAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePerfilForm>();

  useEffect(() => {
    if (!data) return;

    reset({
      socio: {
        id: data.socio.id,
        codSocio: data.socio.codSocio ?? "",
        email: data.socio.email ?? "",
        celular: data.socio.celular ?? "",
        numReferencia: data.socio.numReferencia ?? "",
        direccion: data.socio.direccion ?? "",
        cuentaBancaria: data.socio.cuentaBancaria ?? "",
      },
    });
  }, [data, reset]);

  const onSubmit = async (formData: UpdatePerfilForm) => {
    try {
      await mutation.mutateAsync(formData.socio);
      console.log("Socio actualizado:", formData);
      await successAlert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el socio:", error);
      infoAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al actualizar el perfil",
      );
    }

    // await mutation.mutateAsync(formData.socio, {
    // onSuccess: (formData) => {
    // console.log("Socio actualizado:", formData);
    // },
    // onError: (error) => {
    // console.error("Error al actualizar el socio:", error);
    // },
    // });
    // console.log("Datos a enviar:", socioLike);
  };

  if (isLoading) return <CustomFullScreenLoading />;
  if (isError || !data) {
    return <div>Error cargando el perfil</div>;
  }

  return (
    <>
      <CustomJumbotron
        title="Mi Perfil"
        subTitle="Editar mis datos de Perfil"
      />
      <div className="container mx-auto px-4 mt-6">
        {/* cargar el formulario */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Nombre de Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={userAuth?.userName ?? ""}
                  readOnly
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:ring-2  focus:border-transparent transition-all"
                  placeholder="Ingresa tu nombre de usuario"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register("socio.email", {
                    required: true,
                  })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              {errors.socio?.email && (
                <p className="text-red-500 text-sm mt-1">
                  El correo electrónico es requerido.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Celular
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register("socio.celular", {
                    required: true,
                  })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="77777777"
                />
              </div>
              {errors.socio?.celular && (
                <p className="text-red-500 text-sm mt-1">
                  El celular es requerido.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="reference_number"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Número de Referencia
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register("socio.numReferencia", {
                    required: true,
                  })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="78888888 - Esposo(a)"
                />
              </div>
              {errors.socio?.numReferencia && (
                <p className="text-red-500 text-sm mt-1">
                  El número de referencia es requerido.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Dirección
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register("socio.direccion", {
                    required: true,
                  })}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="z/mi soza c/mi calle #555"
                />
              </div>
              {errors.socio?.direccion && (
                <p className="text-red-500 text-sm mt-1">
                  La dirección es requerida.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="bank_account"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Cuenta Bancaria
              </label>
              <div className="relative">
                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register("socio.cuentaBancaria")}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="12256015451215 - (BISA, BNB, FIE ,...)"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-center">
            <Button
              disabled={mutation.isPending}
              className="md:w-2xl w-full h-11 flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
