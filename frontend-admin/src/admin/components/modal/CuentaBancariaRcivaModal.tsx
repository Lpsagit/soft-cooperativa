import { useInsertRcivaIntereses } from "@/admin/hooks/cuenta-bancaria/useInsertRcivaIntereses";
import { useModal } from "@/admin/hooks/useModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

interface Props {
  ctaBancariaId: number;
}
type RcIvaInteresesForm = {
  fechaRegistro: string;
  montoRcIva: string;
  montoInteres: string;
};

export const CuentaBancariaRcivaModal = ({ ctaBancariaId }: Props) => {
  const { close } = useModal();
  const { mutate, isPending } = useInsertRcivaIntereses();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RcIvaInteresesForm>();

  const onSubmit = (formData: RcIvaInteresesForm) => {
    //Lógica para manejar la presentación del formulario
    mutate({
      montoRcIva: formData.montoRcIva,
      montoInteres: formData.montoInteres,
      ctaBancariaId,
      fechaRegistro: formData.fechaRegistro,
    });
    console.log(formData);
    //reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        {/* content */}
        <div className="space-y-3">
          <p className="text-md text-muted-foreground">
            Ingrese los valores para RC-IVA e Intereses generados en la cuenta
            bancaria general de la cooperativa.
          </p>

          <Label htmlFor="fecha">Fecha</Label>
          <Input
            type="date"
            id="fecha"
            {...register("fechaRegistro", {
              required: "La fecha es obligatoria",
            })}
          />
          {errors.fechaRegistro && (
            <p className="text-sm text-red-500">
              {errors.fechaRegistro.message}
            </p>
          )}
          <Label htmlFor="rciva">RC-IVA</Label>
          <Input
            type="text"
            id="rciva"
            inputMode="decimal"
            placeholder="0.00"
            {...register("montoRcIva", {
              required: "El monto es obligatorio",
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Ingrese un monto válido (máximo 2 decimales)",
              },
              validate: (value) =>
                Number(value) > 0 || "El monto debe ser mayor a 0",
            })}
          />
          {errors.montoRcIva && (
            <p className="text-sm text-red-500">{errors.montoRcIva.message}</p>
          )}
          <Label htmlFor="intereses">Intereses</Label>
          <Input
            type="text"
            id="intereses"
            inputMode="decimal"
            placeholder="0.00"
            {...register("montoInteres", {
              required: "El monto es obligatorio",
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Ingrese un monto válido (máximo 2 decimales)",
              },
              validate: (value) =>
                Number(value) > 0 || "El monto debe ser mayor a 0",
            })}
          />
          {errors.montoInteres && (
            <p className="text-sm text-red-500">
              {errors.montoInteres.message}
            </p>
          )}
          <p className="text-sm text-red-600">
            Asegurese de ingresar los valores correctos, ya que estos afectarán
            los registros contables y financieros de la cooperativa.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>{" "}
    </form>
  );
};
