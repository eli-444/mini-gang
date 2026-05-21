import type { ProductCondition, ProductStatus } from "@/lib/types";

export const productConditionOptions: Array<{ value: ProductCondition; label: string }> = [
  { value: "beaucoup_aime", label: "Beaucoup aime, beaucoup porte" },
  { value: "bon", label: "Bon etat" },
  { value: "tres_bon", label: "Tres bon etat" },
  { value: "comme_neuf", label: "Comme neuf" },
  { value: "neuf_etiquettes", label: "Neuf avec etiquettes" },
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
  { value: "reserve", label: "Reserve" },
];

export const productSeasonOptions = [
  { value: "printemps", label: "Printemps" },
  { value: "ete", label: "Ete" },
  { value: "automne", label: "Automne" },
  { value: "hiver", label: "Hiver" },
  { value: "toutes_saisons", label: "Toutes saisons" },
] as const;

export function getProductConditionLabel(value: string | null | undefined) {
  if (value === "neuf") return "Neuf";
  if (value === "correct") return "Beaucoup aime, beaucoup porte";
  return productConditionOptions.find((option) => option.value === value)?.label ?? value ?? "-";
}

export function getProductStatusLabel(value: string | null | undefined) {
  return adminProductStatusOptions.find((option) => option.value === value)?.label ?? value ?? "-";
}

export function getProductSeasonLabel(value: string | null | undefined) {
  return productSeasonOptions.find((option) => option.value === value)?.label ?? value ?? "-";
}
