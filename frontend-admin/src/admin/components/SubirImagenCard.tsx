import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ImageUploadDropzoneProps {
  onUpload?: (file: File | null) => void;
}

export const SubirImagenCard = ({ onUpload }: ImageUploadDropzoneProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateFile = (newFile: File | null) => {
    setFile(newFile);

    if (newFile) {
      onUpload?.(newFile); // auto upload
    }
  };

  // 👉 generar preview
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

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
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      updateFile(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      updateFile(selectedFile);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent>
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
          {/* INPUT */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* CONTENIDO */}
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="preview"
                className="mx-auto max-h-48 rounded-lg object-contain"
              />

              <div className="flex justify-between items-center">
                <div className="text-left">
                  <p className=" text-sm font-medium text-emerald-700 max-w-70 truncate">
                    {file?.name}
                  </p>
                  {file && (
                    <p className="text-xs text-emerald-600">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFile(null); // ✅ quitar imagen
                    onUpload?.(null); // ✅ notificar que se quitó la imagen
                    if (inputRef.current) inputRef.current.value = ""; // limpiar input
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-slate-400" />
              <div>
                <p className="text-lg font-medium text-slate-700">
                  Arrastra una imagen aquí
                </p>
                <p className="text-sm text-slate-500">
                  o haz clic para seleccionar
                </p>
              </div>
              <p className="text-xs text-slate-400">JPG, PNG o JPEG.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
