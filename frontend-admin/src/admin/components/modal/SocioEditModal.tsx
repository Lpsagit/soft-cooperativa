import { useUpdateSocio } from "@/admin/hooks/socios/useUpdateSocio";
import { useModal } from "@/admin/hooks/useModal";
import { Separator } from "@/components/ui/separator";
import type { Socio } from "@/interfaces/socios.list.response";
import { infoAlert, successAlert } from "@/lib/alerts";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface Props {
  socio: Socio;
}
type UpdateSocioForm = {
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

export const SocioEditModal = ({ socio }: Props) => {
  const { close } = useModal();
  const { register, handleSubmit, reset } = useForm<UpdateSocioForm>();
  const { mutateAsync, isPending } = useUpdateSocio();

  const onSubmit = async (formData: UpdateSocioForm) => {
    try {
      await mutateAsync(formData);
      console.log("Socio actualizado:", formData);
      close();
      await successAlert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el socio:", error);
      infoAlert(
        typeof error === "string"
          ? error
          : "Error desconocido al actualizar el perfil",
      );
    }
  };

  useEffect(() => {
    if (socio) {
      reset({
        socio: {
          id: socio.id,
          codSocio: socio.cod_socio,
          celular: socio.celular ?? "",
          direccion: socio.direccion ?? "",
          cuentaBancaria: socio.cuenta_bancaria ?? "",
          numReferencia: socio.num_referencia ?? "",
          email: socio.email ?? "",
        },
      });
    }
  }, [socio, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="flex flex-col justify-center items-center gap-2">
          <p className="text-center font-bold text-blue-papelera">
            {socio.nom_completo}
          </p>
        </div>
        <Separator className="border-dashed border-t-2 border-muted-foreground/40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Celular
            </label>
            <div className="relative">
              <input
                type="tel"
                {...register("socio.celular")}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="77777777"
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
              <input
                type="text"
                {...register("socio.email")}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="bank_account"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Cuenta Bancaria
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("socio.cuentaBancaria")}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="12256015451215 - (BISA, BNB, FIE ,...)"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Dirección
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("socio.direccion")}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="z/mi soza c/mi calle #555"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label
              htmlFor="reference_number"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Número de Referencia
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("socio.numReferencia")}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="78888888 - Esposo(a)"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm bg-green-900 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            disabled={isPending}
          >
            {isPending ? "Guardando" : "Guardar"}
          </button>
        </div>
      </div>
    </form>
  );
};
