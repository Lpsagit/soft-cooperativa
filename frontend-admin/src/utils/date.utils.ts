//* PARA FORMATEAR Y MOSTRAR SOLO FECHAS
export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return "-";

  let normalized = dateStr;

  // Si viene con espacio tipo "2026-01-29 00:00:00"
  if (dateStr.includes(" ")) {
    normalized = dateStr.replace(" ", "T");
  }

  const date = new Date(normalized);

  if (isNaN(date.getTime())) return "Fecha inválida";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

//* PARA FORMATEAR Y MOSTRAR FECHA Y HORA
export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return "-";

  const normalized = dateStr.includes(" ")
    ? dateStr.replace(" ", "T")
    : dateStr;

  const date = new Date(normalized);

  if (isNaN(date.getTime())) return "Fecha inválida";

  return date.toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
