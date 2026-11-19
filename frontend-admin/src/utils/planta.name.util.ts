export const PLANTA_CONFIG = {
  r1: "Corrugado",
  r2: "Bolsas y Sacos",
  r3: "Packaging",
} as const;

export type PlantaId = keyof typeof PLANTA_CONFIG;

export const plantaName = (plantaId: string | undefined) => {
  return PLANTA_CONFIG[plantaId as PlantaId] || "-";
};
