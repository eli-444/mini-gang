import type { ProductCondition, ProductStatus } from "@/lib/types";

export const productConditionOptions: Array<{ value: ProductCondition; label: string }> = [
  { value: "beaucoup_aime", label: "Beaucoup aimé, beaucoup porté" },
  { value: "bon", label: "Bon état" },
  { value: "tres_bon", label: "Très bon état" },
  { value: "comme_neuf", label: "Comme neuf" },
  { value: "neuf_etiquettes", label: "Neuf avec étiquettes" },
];

export const productStatusOptions: Array<{ value: ProductStatus; label: string }> = [
  { value: "brouillon", label: "Brouillon" },
  { value: "disponible", label: "En ligne" },
  { value: "hors_ligne", label: "Hors ligne" },
  { value: "vendu", label: "Vendu" },
  { value: "archive", label: "Archive" },
];

export const adminProductStatusOptions: Array<{ value: ProductStatus; label: string }> = [
  ...productStatusOptions,
  { value: "reserve", label: "Reservé" },
];

export const productSeasonOptions = [
  { value: "printemps_ete", label: "Printemps-Été" },
  { value: "automne_hiver", label: "Automne-Hiver" },
  { value: "toutes_saisons", label: "Toutes saisons" },
] as const;

export function getProductConditionLabel(value: string | null | undefined) {
  if (value === "neuf") return "Neuf";
  if (value === "correct") return "Beaucoup aimé, beaucoup porté";
  return productConditionOptions.find((option) => option.value === value)?.label ?? value ?? "-";
}

export function getProductStatusLabel(value: string | null | undefined) {
  return adminProductStatusOptions.find((option) => option.value === value)?.label ?? value ?? "-";
}

export function getProductSeasonLabel(value: string | null | undefined) {
  if (value === "printemps" || value === "ete") return "Printemps-Été";
  if (value === "automne" || value === "hiver") return "Automne-Hiver";
  return productSeasonOptions.find((option) => option.value === value)?.label ?? value ?? "-";
}
