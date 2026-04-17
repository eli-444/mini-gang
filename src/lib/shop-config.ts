export const SHOP_CURRENCY = "CHF";
export const SHOP_CURRENCY_LOWER = "chf";
export const SHOP_COUNTRY_CODE = "CH";
export const SHOP_COUNTRY_LABEL = "Suisse";
export const SHIPPING_FEE_CENTS_DEFAULT = 790;
export const RESERVATION_TTL_MINUTES = 20;
export const SUPPORT_EMAIL = "hello@leminigang.com";

export function formatShopMoney(cents: number) {
  return (cents / 100).toLocaleString("fr-CH", {
    style: "currency",
    currency: SHOP_CURRENCY,
  });
}
