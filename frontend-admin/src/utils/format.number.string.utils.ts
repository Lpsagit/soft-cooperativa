// utils/numberFormat.ts

/**
 * Convierte string (DB) → número seguro
 */
export function parseToNumber(value: string | number): number {
  if (typeof value === "number") return value;

  const normalized = value
    .replace(/\./g, "") // quita miles
    .replace(",", "."); // decimal a punto

  const result = Number(normalized);

  return isNaN(result) ? 0 : result;
}

/**
 * Formatea número → string tipo banco (es-BO)
 */
export function formatNumberString(value: string | number): string {
  const numberValue = Number(value);
  const parts = new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
  }).formatToParts(numberValue);
  return parts
    .filter((p) => p.type !== "currency")
    .map((p) => p.value)
    .join("")
    .trim();
}

/**
 * Formato para inputs (mientras el usuario escribe)
 */
export function formatInputCurrency(value: string): string {
  // eliminar todo excepto números y coma
  let cleaned = value.replace(/[^\d,]/g, "");

  const parts = cleaned.split(",");

  // parte entera
  let integerPart = parts[0];
  integerPart = integerPart.replace(/^0+(?=\d)/, ""); // evita 0001

  // agregar separador de miles
  integerPart = new Intl.NumberFormat("es-BO", {
    maximumFractionDigits: 0,
  }).format(Number(integerPart || "0"));

  // parte decimal
  const decimalPart = parts[1]?.slice(0, 2) || "";

  return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
}
