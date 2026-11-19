import { useCargarExcelDescuentoPlanilla } from "@/admin/hooks/descuentos/useCargarExcelDescuentoPlanilla";
import { useModal } from "@/admin/hooks/useModal";
import { successAlert } from "@/lib/alerts";
import { mesLiteral } from "@/utils/mesLiterar";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  mes: string;
  anio: string;
  idDescuentoPlantilla: number;
}

export const DescuentosCargaModal = ({
  mes,
  anio,
  idDescuentoPlantilla,
}: Props) => {
  const { close } = useModal();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending, isError, error } =
    useCargarExcelDescuentoPlanilla();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  // 👉 esto permite click en toda la card
  const handleClick = () => {
    inputRef.current?.click();
  };

  //? para manejar la carga del archivo y enviarlo al backend, ojo tambien tomar el periodo
  const handleUpload = async () => {
    if (!idDescuentoPlantilla) return;
    if (!file) return;

    mutate({
      idDescuentoPlanilla: idDescuentoPlantilla,
      file,
      mes,
      anio,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-800">
            {mesLiteral(mes)} - {anio}
          </h2>
        </div>
      </div>
      <div
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : file
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-300 hover:border-slate-400"
        }`}
      >
        {/* INPUT OCULTO */}
        <input
          ref={inputRef}
          type="file"
          accept=".xls,.xlsx"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* CONTENIDO */}
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="h-8 w-8 text-emerald-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-emerald-700">
                  {file.name}
                </p>
                <p className="text-xs text-emerald-600">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // 🔥 importante
                setFile(null);
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Quitar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <div>
              <p className="text-lg font-medium text-slate-700">
                Arrastra el archivo Excel aquí
              </p>
              <p className="text-sm text-slate-500">
                o haz clic para seleccionar
              </p>
            </div>
            <p className="text-xs text-slate-400">Solo archivos .xls o .xlsx</p>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={close}
          className="px-4 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          Cancelar
        </button>
        {isError && (
          <div className="text-sm text-red-500">Error: {error.message}</div>
        )}
        {file && (
          <button
            className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            onClick={handleUpload}
            disabled={isPending}
          >
            {isPending ? "Cargando..." : "Cargar"}
          </button>
        )}
      </div>
    </div>
  );
};
