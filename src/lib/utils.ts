import { SHOP_CURRENCY, formatShopMoney } from "@/lib/shop-config";

export function toChf(cents: number) {
  return formatShopMoney(cents);
}

export function formatMoney(cents: number, currency = SHOP_CURRENCY) {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency,
  });
}

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL;
  return "http://localhost:3000";
}
