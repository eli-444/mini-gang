export type FulfillmentMethod = "shipping" | "click_collect";

export const CLICK_COLLECT_CITY = "Vevey";
export const CLICK_COLLECT_POSTAL_CODE = "1800";

export function getFulfillmentLabel(method: string | null | undefined) {
  return method === "click_collect" ? "Click & Collect" : "Livraison en Suisse";
}
