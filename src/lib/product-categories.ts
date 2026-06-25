export const productCategoryOptions = [
  { value: "bodies", label: "Bodies" },
  { value: "debardeurs", label: "Debardeurs" },
  { value: "tee_shirts", label: "Tee-shirts" },
  { value: "polos", label: "Polos" },
  { value: "blouses", label: "Blouses" },
  { value: "chemises", label: "Chemises" },
  { value: "pulls", label: "Pulls" },
  { value: "polaires", label: "Polaires" },
  { value: "gilets", label: "Gilets" },
  { value: "sweat_shirts", label: "Sweat-shirts" },
  { value: "robes", label: "Robes" },
  { value: "pantalons", label: "Pantalons" },
  { value: "shorts", label: "Shorts" },
  { value: "jupes", label: "Jupes" },
  { value: "salopettes", label: "Salopettes" },
  { value: "combinaisons", label: "Combinaisons" },
  { value: "ensembles", label: "Ensembles" },
  { value: "manteaux", label: "Manteaux" },
  { value: "vestes", label: "Vestes" },
  { value: "doudounes", label: "Doudounes" },
  { value: "ski", label: "Vestes/pantalons de ski" },
  { value: "pyjamas", label: "Pyjamas" },
  { value: "maillots_de_bain", label: "Maillots de bains" },
] as const;

export const legacyProductCategoryOptions = [
  { value: "haut", label: "Haut" },
  { value: "bas", label: "Bas" },
  { value: "robe", label: "Robe" },
  { value: "veste", label: "Veste" },
  { value: "manteau", label: "Manteau" },
  { value: "chaussures", label: "Chaussures" },
  { value: "accessoire", label: "Accessoire" },
  { value: "autre", label: "Autre" },
] as const;

export const allProductCategoryOptions = [...productCategoryOptions, ...legacyProductCategoryOptions] as const;

export type ProductCategory = (typeof allProductCategoryOptions)[number]["value"];

export const productCategoryValues = allProductCategoryOptions.map((option) => option.value) as [
  ProductCategory,
  ...ProductCategory[],
];

export function getProductCategoryLabel(value: string | null | undefined) {
  return allProductCategoryOptions.find((option) => option.value === value)?.label ?? value ?? "-";
}

export function isMerchCategory(value: string | null | undefined) {
  return value === "accessoire" || value === "autre";
}
