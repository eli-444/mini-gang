export interface PricingInput {
  brand?: string | null;
  category: string;
  size_label?: string | null;
  age_range?: string | null;
  condition: "new" | "like_new" | "very_good" | "good" | "fair";
  material?: string | null;
}

export interface PricingResult {
  estimated_buyback_cents: number;
  explanation: string;
  meta: {
    brandTier: "premium" | "mid" | "value";
    baseCategoryCents: number;
    conditionMultiplier: number;
    tierMultiplier: number;
    materialMultiplier: number;
    demandMultiplier: number;
  };
}

const premiumBrands = new Set([
  "bonpoint",
  "petit bateau",
  "jacadi",
  "bobo choses",
  "tartine et chocolat",
  "catimini",
  "bonmot",
]);

const midBrands = new Set([
  "zara kids",
  "hm kids",
  "h&m kids",
  "vertbaudet",
  "okaidi",
  "sergent major",
  "tao",
  "tape a l oeil",
  "tape a l'oeil",
]);

const categoryRanges: Record<string, [number, number]> = {
  body: [150, 300],
  "body/pyjama": [150, 300],
  pyjama: [150, 300],
  "t-shirt": [200, 400],
  tshirt: [200, 400],
  top: [200, 400],
  pantalon: [300, 700],
  legging: [300, 700],
  short: [250, 550],
  sweat: [350, 800],
  gilet: [350, 800],
  robe: [350, 800],
  combinaison: [350, 800],
  manteau: [800, 2000],
  doudoune: [800, 2000],
};

const conditionMultipliers: Record<PricingInput["condition"], number> = {
  new: 1.2,
  like_new: 1.0,
  very_good: 0.85,
  good: 0.65,
  fair: 0.4,
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getBrandTier(brand: string | null | undefined): "premium" | "mid" | "value" {
  const normalizedBrand = normalizeText(brand);
  if (!normalizedBrand) return "value";
  if (premiumBrands.has(normalizedBrand)) return "premium";
  if (midBrands.has(normalizedBrand)) return "mid";
  return "value";
}

function getCategoryBaseCents(category: string) {
  const normalizedCategory = normalizeText(category);
  const range = categoryRanges[normalizedCategory] ?? [250, 500];
  return Math.round((range[0] + range[1]) / 2);
}

function getMaterialMultiplier(material?: string | null) {
  const normalizedMaterial = normalizeText(material);
  if (!normalizedMaterial) return 1;
  if (normalizedMaterial.includes("laine") || normalizedMaterial.includes("coton bio")) {
    return 1.05;
  }
  return 1;
}

function getDemandMultiplier(input: PricingInput) {
  const age = normalizeText(input.age_range);
  const size = normalizeText(input.size_label);
  if (age.includes("12-24") || age.includes("2-3y") || size === "24m" || size === "2a") {
    return 1.05;
  }
  return 1;
}

function getTierMultiplier(tier: "premium" | "mid" | "value") {
  if (tier === "premium") return 2;
  if (tier === "mid") return 1.2;
  return 1;
}

export function estimateBuyback(input: PricingInput): PricingResult {
  const brandTier = getBrandTier(input.brand);
  const baseCategoryCents = getCategoryBaseCents(input.category);
  const conditionMultiplier = conditionMultipliers[input.condition];
  const tierMultiplier = getTierMultiplier(brandTier);
  const materialMultiplier = getMaterialMultiplier(input.material);
  const demandMultiplier = getDemandMultiplier(input);

  const estimated = Math.max(
    80,
    Math.round(baseCategoryCents * tierMultiplier * conditionMultiplier * materialMultiplier * demandMultiplier),
  );

  const explanation = [
    `base ${baseCategoryCents}c`,
    `tier ${brandTier} x${tierMultiplier}`,
    `etat x${conditionMultiplier}`,
    materialMultiplier > 1 ? `matiere bonus x${materialMultiplier}` : null,
    demandMultiplier > 1 ? `demande taille x${demandMultiplier}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return {
    estimated_buyback_cents: estimated,
    explanation,
    meta: {
      brandTier,
      baseCategoryCents,
      conditionMultiplier,
      tierMultiplier,
      materialMultiplier,
      demandMultiplier,
    },
  };
}
