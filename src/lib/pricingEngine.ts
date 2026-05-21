export interface PricingInput {
  brand?: string | null;
  category: string;
  size_label?: string | null;
  age_range?: string | null;
  condition: "new" | "like_new" | "very_good" | "good" | "fair" | "neuf_etiquettes" | "comme_neuf" | "tres_bon" | "bon" | "beaucoup_aime";
  material?: string | null;
}

export interface PricingResult {
  estimated_buyback_cents: number;
  buyback_range_cents: [number, number];
  resale_range_cents: [number, number];
  new_price_range_cents: [number, number] | null;
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

type PriceRange = [number, number];

interface BrandPricingRule {
  brand: string;
  ageRange: string;
  category: string;
  newPrice: PriceRange;
  resalePrice: PriceRange;
  buybackPrice: PriceRange;
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
  bodies: [150, 300],
  debardeurs: [100, 250],
  tee_shirts: [200, 500],
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
  doudounes: [800, 2000],
  vestes: [700, 1600],
  manteaux: [1200, 2800],
  salopettes: [700, 1300],
  ensembles: [800, 1600],
  pyjamas: [400, 900],
  chemises: [400, 900],
  blouses: [400, 900],
  pulls: [500, 1000],
  polos: [400, 800],
  polaires: [500, 1000],
  sweat_shirts: [500, 900],
  jupes: [400, 900],
  pantalons: [400, 1000],
  shorts: [300, 700],
  combinaisons: [600, 1200],
  ski: [1200, 2800],
  maillots_de_bain: [300, 700],
};

const conditionMultipliers: Record<PricingInput["condition"], number> = {
  new: 1.2,
  like_new: 1.0,
  very_good: 0.85,
  good: 0.65,
  fair: 0.4,
  neuf_etiquettes: 1.2,
  comme_neuf: 1.0,
  tres_bon: 0.85,
  bon: 0.65,
  beaucoup_aime: 0.4,
};

const zaraPricingRules: BrandPricingRule[] = [
  { brand: "zara", ageRange: "0-18 mois", category: "blouses", newPrice: [1090, 1990], resalePrice: [400, 800], buybackPrice: [20, 80] },
  { brand: "zara", ageRange: "0-18 mois", category: "chemises", newPrice: [1090, 1990], resalePrice: [400, 800], buybackPrice: [20, 80] },
  { brand: "zara", ageRange: "0-18 mois", category: "combinaisons", newPrice: [1590, 2590], resalePrice: [600, 1000], buybackPrice: [60, 180] },
  { brand: "zara", ageRange: "0-18 mois", category: "debardeurs", newPrice: [590, 990], resalePrice: [200, 400], buybackPrice: [10, 20] },
  { brand: "zara", ageRange: "0-18 mois", category: "doudounes", newPrice: [1790, 4990], resalePrice: [700, 2000], buybackPrice: [70, 360] },
  { brand: "zara", ageRange: "0-18 mois", category: "ensembles", newPrice: [1790, 3590], resalePrice: [700, 1400], buybackPrice: [70, 250] },
  { brand: "zara", ageRange: "0-18 mois", category: "gilets", newPrice: [1090, 1990], resalePrice: [400, 800], buybackPrice: [20, 80] },
  { brand: "zara", ageRange: "0-18 mois", category: "jupes", newPrice: [990, 1790], resalePrice: [400, 700], buybackPrice: [20, 70] },
  { brand: "zara", ageRange: "0-18 mois", category: "manteaux", newPrice: [2990, 5990], resalePrice: [1200, 2400], buybackPrice: [220, 430] },
  { brand: "zara", ageRange: "0-18 mois", category: "pantalons", newPrice: [590, 2590], resalePrice: [200, 1000], buybackPrice: [10, 180] },
  { brand: "zara", ageRange: "0-18 mois", category: "polaires", newPrice: [1090, 1990], resalePrice: [400, 800], buybackPrice: [20, 80] },
  { brand: "zara", ageRange: "0-18 mois", category: "polos", newPrice: [990, 1790], resalePrice: [400, 700], buybackPrice: [20, 70] },
  { brand: "zara", ageRange: "0-18 mois", category: "pulls", newPrice: [1090, 1990], resalePrice: [400, 800], buybackPrice: [20, 80] },
  { brand: "zara", ageRange: "0-18 mois", category: "pyjamas", newPrice: [1090, 2290], resalePrice: [400, 900], buybackPrice: [20, 90] },
  { brand: "zara", ageRange: "0-18 mois", category: "robes", newPrice: [1190, 2490], resalePrice: [500, 1000], buybackPrice: [50, 180] },
  { brand: "zara", ageRange: "0-18 mois", category: "salopettes", newPrice: [1790, 2990], resalePrice: [700, 1200], buybackPrice: [70, 220] },
  { brand: "zara", ageRange: "0-18 mois", category: "shorts", newPrice: [590, 1590], resalePrice: [200, 600], buybackPrice: [10, 60] },
  { brand: "zara", ageRange: "0-18 mois", category: "sweat_shirts", newPrice: [1090, 1790], resalePrice: [400, 700], buybackPrice: [20, 70] },
  { brand: "zara", ageRange: "0-18 mois", category: "tee_shirts", newPrice: [690, 1290], resalePrice: [300, 500], buybackPrice: [20, 50] },
  { brand: "zara", ageRange: "0-18 mois", category: "vestes", newPrice: [1490, 3990], resalePrice: [600, 1600], buybackPrice: [60, 290] },
  { brand: "zara", ageRange: "2-6 ans", category: "blouses", newPrice: [1290, 2590], resalePrice: [500, 1000], buybackPrice: [50, 180] },
  { brand: "zara", ageRange: "2-6 ans", category: "chemises", newPrice: [1290, 2590], resalePrice: [500, 1000], buybackPrice: [50, 180] },
  { brand: "zara", ageRange: "2-6 ans", category: "combinaisons", newPrice: [1590, 2590], resalePrice: [600, 1000], buybackPrice: [60, 180] },
  { brand: "zara", ageRange: "2-6 ans", category: "debardeurs", newPrice: [790, 990], resalePrice: [300, 400], buybackPrice: [20, 20] },
  { brand: "zara", ageRange: "2-6 ans", category: "doudounes", newPrice: [2290, 5990], resalePrice: [900, 2400], buybackPrice: [90, 430] },
  { brand: "zara", ageRange: "2-6 ans", category: "ensembles", newPrice: [1790, 3590], resalePrice: [700, 1400], buybackPrice: [70, 250] },
  { brand: "zara", ageRange: "2-6 ans", category: "gilets", newPrice: [1290, 2590], resalePrice: [500, 1000], buybackPrice: [50, 180] },
  { brand: "zara", ageRange: "2-6 ans", category: "jupes", newPrice: [1090, 2590], resalePrice: [400, 1000], buybackPrice: [20, 180] },
  { brand: "zara", ageRange: "2-6 ans", category: "manteaux", newPrice: [3590, 6990], resalePrice: [1400, 2800], buybackPrice: [250, 490] },
  { brand: "zara", ageRange: "2-6 ans", category: "pantalons", newPrice: [790, 2990], resalePrice: [300, 1200], buybackPrice: [20, 220] },
  { brand: "zara", ageRange: "2-6 ans", category: "polaires", newPrice: [1290, 2590], resalePrice: [500, 1000], buybackPrice: [50, 180] },
  { brand: "zara", ageRange: "2-6 ans", category: "polos", newPrice: [1090, 1990], resalePrice: [400, 800], buybackPrice: [20, 80] },
  { brand: "zara", ageRange: "2-6 ans", category: "pulls", newPrice: [1290, 2590], resalePrice: [500, 1000], buybackPrice: [50, 180] },
  { brand: "zara", ageRange: "2-6 ans", category: "pyjamas", newPrice: [1090, 2290], resalePrice: [400, 900], buybackPrice: [20, 90] },
  { brand: "zara", ageRange: "2-6 ans", category: "robes", newPrice: [1490, 2990], resalePrice: [600, 1200], buybackPrice: [60, 220] },
  { brand: "zara", ageRange: "2-6 ans", category: "salopettes", newPrice: [1790, 2990], resalePrice: [700, 1200], buybackPrice: [70, 220] },
  { brand: "zara", ageRange: "2-6 ans", category: "shorts", newPrice: [790, 1990], resalePrice: [300, 800], buybackPrice: [20, 80] },
  { brand: "zara", ageRange: "2-6 ans", category: "sweat_shirts", newPrice: [1290, 1990], resalePrice: [500, 800], buybackPrice: [50, 80] },
  { brand: "zara", ageRange: "2-6 ans", category: "tee_shirts", newPrice: [790, 1490], resalePrice: [300, 600], buybackPrice: [20, 60] },
  { brand: "zara", ageRange: "2-6 ans", category: "vestes", newPrice: [1790, 4990], resalePrice: [700, 2000], buybackPrice: [70, 360] },
  { brand: "zara", ageRange: "7-12 ans", category: "blouses", newPrice: [1590, 3490], resalePrice: [600, 1400], buybackPrice: [60, 250] },
  { brand: "zara", ageRange: "7-12 ans", category: "chemises", newPrice: [1590, 3490], resalePrice: [600, 1400], buybackPrice: [60, 250] },
  { brand: "zara", ageRange: "7-12 ans", category: "combinaisons", newPrice: [2590, 3990], resalePrice: [1000, 1600], buybackPrice: [180, 290] },
  { brand: "zara", ageRange: "7-12 ans", category: "debardeurs", newPrice: [990, 1490], resalePrice: [400, 600], buybackPrice: [20, 60] },
  { brand: "zara", ageRange: "7-12 ans", category: "doudounes", newPrice: [3590, 7990], resalePrice: [1400, 3200], buybackPrice: [250, 1120] },
  { brand: "zara", ageRange: "7-12 ans", category: "ensembles", newPrice: [2590, 4990], resalePrice: [1000, 2000], buybackPrice: [180, 360] },
  { brand: "zara", ageRange: "7-12 ans", category: "gilets", newPrice: [1990, 3990], resalePrice: [800, 1600], buybackPrice: [80, 290] },
  { brand: "zara", ageRange: "7-12 ans", category: "jupes", newPrice: [1590, 3490], resalePrice: [600, 1400], buybackPrice: [60, 250] },
  { brand: "zara", ageRange: "7-12 ans", category: "manteaux", newPrice: [4990, 8990], resalePrice: [2000, 3600], buybackPrice: [360, 1260] },
  { brand: "zara", ageRange: "7-12 ans", category: "pantalons", newPrice: [990, 3990], resalePrice: [400, 1600], buybackPrice: [20, 290] },
  { brand: "zara", ageRange: "7-12 ans", category: "polaires", newPrice: [1990, 3490], resalePrice: [800, 1400], buybackPrice: [80, 250] },
  { brand: "zara", ageRange: "7-12 ans", category: "polos", newPrice: [1290, 2590], resalePrice: [500, 1000], buybackPrice: [50, 180] },
  { brand: "zara", ageRange: "7-12 ans", category: "pulls", newPrice: [1990, 3990], resalePrice: [800, 1600], buybackPrice: [80, 290] },
  { brand: "zara", ageRange: "7-12 ans", category: "pyjamas", newPrice: [1590, 2990], resalePrice: [600, 1200], buybackPrice: [60, 220] },
  { brand: "zara", ageRange: "7-12 ans", category: "robes", newPrice: [2290, 4590], resalePrice: [900, 1800], buybackPrice: [90, 320] },
  { brand: "zara", ageRange: "7-12 ans", category: "salopettes", newPrice: [2990, 4590], resalePrice: [1200, 1800], buybackPrice: [220, 320] },
  { brand: "zara", ageRange: "7-12 ans", category: "shorts", newPrice: [990, 2590], resalePrice: [400, 1000], buybackPrice: [20, 180] },
  { brand: "zara", ageRange: "7-12 ans", category: "sweat_shirts", newPrice: [1990, 2990], resalePrice: [800, 1200], buybackPrice: [80, 220] },
  { brand: "zara", ageRange: "7-12 ans", category: "tee_shirts", newPrice: [990, 1990], resalePrice: [400, 800], buybackPrice: [20, 80] },
  { brand: "zara", ageRange: "7-12 ans", category: "vestes", newPrice: [2590, 6990], resalePrice: [1000, 2800], buybackPrice: [180, 490] },
];

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function normalizeSearchText(value: string | null | undefined) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "et")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getBrandTier(brand: string | null | undefined): "premium" | "mid" | "value" {
  const normalizedBrand = normalizeText(brand);
  if (!normalizedBrand) return "value";
  if (premiumBrands.has(normalizedBrand)) return "premium";
  if (midBrands.has(normalizedBrand)) return "mid";
  return "value";
}

function getPricingAgeRange(ageRange?: string | null, sizeLabel?: string | null) {
  const value = `${normalizeSearchText(ageRange)} ${normalizeSearchText(sizeLabel)}`;
  const months = value.match(/(\d+)_?mois/);
  if (months && Number(months[1]) <= 18) return "0-18 mois";
  const years = value.match(/(\d+)_?(?:ans|a)/);
  if (years) {
    const year = Number(years[1]);
    if (year <= 1) return "0-18 mois";
    if (year <= 6) return "2-6 ans";
    return "7-12 ans";
  }
  if (value.includes("0_18")) return "0-18 mois";
  if (value.includes("2_6")) return "2-6 ans";
  if (value.includes("7_12")) return "7-12 ans";
  return null;
}

function getBrandPricingRule(input: PricingInput) {
  const brand = normalizeSearchText(input.brand);
  if (!brand.includes("zara")) return null;

  const category = normalizeSearchText(input.category);
  const ageRange = getPricingAgeRange(input.age_range, input.size_label);
  const candidates = zaraPricingRules.filter((rule) => rule.category === category);
  if (ageRange) {
    const exact = candidates.find((rule) => rule.ageRange === ageRange);
    if (exact) return exact;
  }
  return candidates[0] ?? null;
}

function applyRangeMultiplier(range: PriceRange, multiplier: number): PriceRange {
  return [Math.max(0, Math.round(range[0] * multiplier)), Math.max(0, Math.round(range[1] * multiplier))];
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

  const pricingRule = getBrandPricingRule(input);
  const ruleMultiplier = conditionMultiplier * materialMultiplier * demandMultiplier;
  const fallbackEstimated = Math.max(
    80,
    Math.round(baseCategoryCents * tierMultiplier * ruleMultiplier),
  );
  const buybackRange = pricingRule
    ? applyRangeMultiplier(pricingRule.buybackPrice, ruleMultiplier)
    : [Math.max(80, Math.round(fallbackEstimated * 0.75)), Math.max(80, Math.round(fallbackEstimated * 1.25))] as PriceRange;
  const resaleRange = pricingRule
    ? pricingRule.resalePrice
    : [Math.round(baseCategoryCents * 0.8), Math.round(baseCategoryCents * 1.2)] as PriceRange;
  const estimated = Math.round((buybackRange[0] + buybackRange[1]) / 2);

  const explanation = [
    pricingRule ? `table ${pricingRule.brand.toUpperCase()} ${pricingRule.ageRange}` : null,
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
    buyback_range_cents: buybackRange,
    resale_range_cents: resaleRange,
    new_price_range_cents: pricingRule?.newPrice ?? null,
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
