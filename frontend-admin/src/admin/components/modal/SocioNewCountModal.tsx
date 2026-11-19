import { useModal } from "@/admin/hooks/useModal";
import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { useAltaSocio } from "@/admin/hooks/socios/useAltaSocio";
type SocioForm = {
  numEmp: string;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  ci: string;
  numReferencia: string;
  direccion: string;
  cuentaBancaria?: string;
  plantaId: string;
};
export const SocioNewCountModal = () => {
  const { close } = useModal();
  const { mutate, isPending } = useAltaSocio();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SocioForm>({
    defaultValues: {
      numEmp: "",
      email: "",
      celular: "",
      ci: "",
      numReferencia: "",
      direccion: "",
      cuentaBancaria: "",
      nombre: "",
      apellido: "",
      plantaId: "",
    },
  });
  const onSubmit = (formData: SocioForm) => {
    console.log("Datos del socio:", formData);
    mutate(formData);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {" "}
      {/* ========================= DATOS PERSONALES ========================== */}{" "}
      <div className="space-y-4">
        {" "}
        <div>
          {" "}
          <h3 className="text-base font-semibold text-gray-900">
            {" "}
            Datos personales{" "}
          </h3>{" "}
          <p className="text-sm text-gray-500 mt-1">
            {" "}
            Información de identificación del socio.{" "}
          </p>{" "}
        </div>{" "}
        <Separator />{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {" "}
          {/* Número empleado */}{" "}
          <div>
            {" "}
            <label
              htmlFor="numEmp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {" "}
              Número de empleado{" "}
              <span className="text-red-500 ml-1">*</span>{" "}
            </label>{" "}
            <input
              id="numEmp"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ej. 1111"
              disabled={isPending}
              {...register("numEmp", {
                required: "El número de empleado es obligatorio",
                pattern: {
                  value: /^\d+$/,
                  message: "Solo se permiten números",
                },
              })}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.numEmp ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
            />{" "}
            {errors.numEmp && (
              <p className="mt-1.5 text-sm text-red-600">
                {" "}
                {errors.numEmp.message}{" "}
              </p>
            )}{" "}
          </div>{" "}
          {/* CI */}{" "}
          <div>
            {" "}
            <label
              htmlFor="ci"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {" "}
              Carnet de identidad{" "}
              <span className="text-red-500 ml-1">*</span>{" "}
            </label>{" "}
            <input
              id="ci"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Ej. 1234567"
              disabled={isPending}
              {...register("ci", {
                required: "El carnet de identidad es obligatorio",
                pattern: {
                  value: /^\d+$/,
                  message: "Ingresa solamente números",
                },
              })}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.ci ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
            />{" "}
            {errors.ci && (
              <p className="mt-1.5 text-sm text-red-600">
                {" "}
                {errors.ci.message}{" "}
              </p>
            )}{" "}
          </div>{" "}
          {/* Nombres */}{" "}
          <div>
            {" "}
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {" "}
              Nombres <span className="text-red-500 ml-1">*</span>{" "}
            </label>{" "}
            <input
              id="nombre"
              type="text"
              autoComplete="given-name"
              placeholder="Ej. Juan Carlos"
              disabled={isPending}
              {...register("nombre", {
                required: "El nombre es obligatorio",
                minLength: {
                  value: 2,
                  message: "El nombre debe tener al menos 2 caracteres",
                },
              })}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.nombre ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
            />{" "}
            {errors.nombre && (
              <p className="mt-1.5 text-sm text-red-600">
                {" "}
                {errors.nombre.message}{" "}
              </p>
            )}{" "}
          </div>{" "}
          {/* Apellidos */}{" "}
          <div>
            {" "}
            <label
              htmlFor="apellido"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {" "}
              Apellidos <span className="text-red-500 ml-1">*</span>{" "}
            </label>{" "}
            <input
              id="apellido"
              type="text"
              autoComplete="family-name"
              placeholder="Ej. Pérez García"
              disabled={isPending}
              {...register("apellido", {
                required: "Los apellidos son obligatorios",
                minLength: {
                  value: 2,
                  message: "Los apellidos deben tener al menos 2 caracteres",
                },
              })}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.apellido ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
            />{" "}
            {errors.apellido && (
              <p className="mt-1.5 text-sm text-red-600">
                {" "}
                {errors.apellido.message}{" "}
              </p>
            )}{" "}
          </div>{" "}
          {/* planta */}
          <div>
            <label
              htmlFor="planta"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Planta
              <span className="text-red-500 ml-1">*</span>
            </label>

            <select
              id="planta"
              disabled={isPending}
              {...register("plantaId", {
                required: "La planta es obligatoria",
              })}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white
      outline-none transition-all
      focus:ring-2 focus:ring-blue-500
      ${
        errors.plantaId
          ? "border-red-500 focus:ring-red-500"
          : "border-gray-300"
      }`}
            >
              <option value="">Seleccionar planta</option>
              <option value="r1">La Paz</option>
              <option value="r2">Cochabamba</option>
              <option value="r3">Santa Cruz</option>
            </select>

            {errors.plantaId && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.plantaId.message}
              </p>
            )}
          </div>
        </div>{" "}
      </div>{" "}
      {/* ========================= INFORMACIÓN DE CONTACTO ========================== */}{" "}
      <div className="space-y-4">
        {" "}
        <div>
          {" "}
          <h3 className="text-base font-semibold text-gray-900">
            {" "}
            Información de contacto{" "}
          </h3>{" "}
          <p className="text-sm text-gray-500 mt-1">
            {" "}
            Datos utilizados para comunicarse con el socio.{" "}
          </p>{" "}
        </div>{" "}
        <Separator />{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {" "}
          {/* Celular */}{" "}
          <div>
            {" "}
            <label
              htmlFor="celular"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {" "}
              Celular <span className="text-red-500 ml-1">*</span>{" "}
            </label>{" "}
            <input
              id="celular"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Ej. 77777777"
              disabled={isPending}
              {...register("celular", {
                required: "El número de celular es obligatorio",
                pattern: {
                  value: /^\d{8}$/,
                  message: "El celular debe tener 8 dígitos",
                },
              })}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.celular ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
            />{" "}
            {errors.celular && (
              <p className="mt-1.5 text-sm text-red-600">
                {" "}
                {errors.celular.message}{" "}
              </p>
            )}{" "}
          </div>{" "}
          {/* Email */}{" "}
          <div>
            {" "}
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {" "}
              Correo electrónico{" "}
            </label>{" "}
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              disabled={isPending}
              {...register("email")}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
            />
          </div>{" "}
          {/* Dirección */}{" "}
          <div className="md:col-span-2">
            {" "}
            <label
              htmlFor="direccion"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {" "}
              Dirección
            </label>{" "}
            <input
              id="direccion"
              type="text"
              autoComplete="street-address"
              placeholder="Ej. Zona Central, Av. Principal #555"
              disabled={isPending}
              {...register("direccion")}
              className={`w-full px-3 py-2.5 rounded-lg border bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.direccion ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
            />
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* ========================= REFERENCIA ========================== */}{" "}
      <div className="space-y-4">
        {" "}
        <div>
          {" "}
          <h3 className="text-base font-semibold text-gray-900">
            {" "}
            Contacto de referencia{" "}
          </h3>{" "}
          <p className="text-sm text-gray-500 mt-1">
            {" "}
            Persona de contacto en caso de ser necesario.{" "}
          </p>{" "}
        </div>{" "}
        <Separator />{" "}
        <div>
          {" "}
          <label
            htmlFor="numReferencia"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {" "}
            Número de referencia{" "}
          </label>{" "}
          <input
            id="numReferencia"
            type="tel"
            inputMode="numeric"
            placeholder="Ej. 78888888 - HERMANO(A)"
            disabled={isPending}
            {...register("numReferencia")}
            className={`w-full px-3 py-2.5 rounded-lg border bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.numReferencia ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
          />
        </div>{" "}
      </div>{" "}
      {/* ========================= INFORMACIÓN BANCARIA ========================== */}{" "}
      <div className="space-y-4">
        {" "}
        <div>
          {" "}
          <h3 className="text-base font-semibold text-gray-900">
            {" "}
            Información bancaria{" "}
          </h3>{" "}
          <p className="text-sm text-gray-500 mt-1">
            {" "}
            Información utilizada para transferencias y operaciones
            bancarias.{" "}
          </p>{" "}
        </div>{" "}
        <Separator />{" "}
        <div>
          {" "}
          <label
            htmlFor="cuentaBancaria"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {" "}
            Cuenta bancaria{" "}
          </label>{" "}
          <input
            id="cuentaBancaria"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ej. 12256015451215 - Bisa"
            disabled={isPending}
            {...register("cuentaBancaria")}
            className={`w-full px-3 py-2.5 rounded-lg border bg-white outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.cuentaBancaria ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
          />
        </div>{" "}
      </div>{" "}
      {/* ========================= BOTONES ========================== */}{" "}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {" "}
        <button
          type="button"
          onClick={close}
          disabled={isPending}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {" "}
          Cancelar{" "}
        </button>{" "}
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium bg-green-900 text-white hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {" "}
          {isPending ? "Guardando..." : "Crear socio"}{" "}
        </button>{" "}
      </div>{" "}
    </form>
  );
};
