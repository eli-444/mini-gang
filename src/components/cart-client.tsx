"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { FREE_SHIPPING_THRESHOLD_CENTS, SHOP_COUNTRY_CODE, SHOP_COUNTRY_LABEL } from "@/lib/shop-config";
import type { PaymentProviderName } from "@/lib/types";
import { toChf } from "@/lib/utils";

interface ProductLite {
  id: string;
  title: string;
  price_cents: number;
}

export function CartClient({
  providers,
  defaultProvider,
  shippingFeeCents,
  ordersEnabled = true,
  ordersClosedMessage,
  ordersReopenDate,
}: {
  providers: Array<{
    name: PaymentProviderName;
    label: string;
    description: string;
    enabled: boolean;
  }>;
  defaultProvider: PaymentProviderName;
  shippingFeeCents: number;
  ordersEnabled?: boolean;
  ordersClosedMessage?: string;
  ordersReopenDate?: string;
}) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState<PaymentProviderName>(defaultProvider);
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    country: SHOP_COUNTRY_CODE,
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (items.length === 0) {
        setProducts([]);
        return;
      }
      const requests = await Promise.all(items.map((item) => fetch(`/api/products/${item.productId}`)));
      const valid = (await Promise.all(requests.map((request) => request.json()))).filter((item) => item?.id);
      setProducts(valid);
    };
    void run();
  }, [items]);

  const subtotal = useMemo(() => products.reduce((sum, item) => sum + item.price_cents, 0), [products]);
  const effectiveShippingFeeCents = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : shippingFeeCents;
  const total = subtotal + effectiveShippingFeeCents;
  const selectedProvider = providers.find((item) => item.name === provider);
  const canCheckout =
    products.length > 0 &&
    email.length > 0 &&
    shipping.name.length > 1 &&
    shipping.phone.length > 5 &&
    shipping.line1.length > 1 &&
    shipping.postalCode.length > 1 &&
    shipping.city.length > 1 &&
    acceptTerms &&
    ordersEnabled &&
    Boolean(selectedProvider?.enabled);

  const createCheckout = async () => {
    if (!selectedProvider?.enabled) {
      alert("Ce mode de paiement n'est pas encore configure.");
      return;
    }
    if (!ordersEnabled) {
      alert(ordersClosedMessage || "Les commandes sont temporairement suspendues.");
      return;
    }

    const response = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        email,
        items: items.map((item) => ({ productId: item.productId })),
        shipping,
        acceptTerms,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      alert(payload.error ?? "Checkout impossible");
      return;
    }
    window.location.href = payload.redirectUrl;
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-5">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--mg-pop-rose)]">Commande</p>
        <h1 className="mt-1 text-2xl font-black leading-tight text-[var(--mg-on-dark)] md:text-3xl">Panier</h1>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-[var(--mg-ink)]">Articles</h2>
            <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-black text-[var(--mg-ink)]/70">
              {products.length} article{products.length > 1 ? "s" : ""}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-black/10 p-4">
              <p className="text-sm font-semibold text-[var(--mg-ink)]">Votre panier est vide.</p>
              <p className="mt-1 text-xs leading-5 text-[var(--mg-ink)]/60">Les pieces ajoutees depuis la boutique apparaitront ici.</p>
            </div>
          ) : null}

          <div className="mt-3 divide-y divide-black/10">
            {products.map((product) => (
              <article key={product.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[var(--mg-ink)]">{product.title}</p>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--mg-ink)]/60">{toChf(product.price_cents)}</p>
                </div>
                <button type="button" onClick={() => removeItem(product.id)} className="shrink-0 text-xs font-black text-[var(--mg-accent)] underline">
                  Retirer
                </button>
              </article>
            ))}
          </div>
        </section>

      <section className="space-y-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm md:p-5">
        <h2 className="text-base font-black text-[var(--mg-ink)]">Paiement</h2>
        {!ordersEnabled ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
            <p>{ordersClosedMessage || "Les commandes sont temporairement suspendues."}</p>
            {ordersReopenDate ? <p className="mt-1 text-xs">Reouverture prevue: {ordersReopenDate}</p> : null}
          </div>
        ) : null}
        <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-sm">
          <div className="flex justify-between">
            <span>Sous-total articles</span>
            <strong>{toChf(subtotal)}</strong>
          </div>
          <div className="mt-2 flex justify-between">
            <span>Livraison Suisse</span>
            <strong>{effectiveShippingFeeCents === 0 && subtotal > 0 ? "Offerte" : toChf(effectiveShippingFeeCents)}</strong>
          </div>
          {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD_CENTS ? (
            <p className="mt-1 text-xs text-[var(--mg-ink)]/55">
              Livraison offerte des {toChf(FREE_SHIPPING_THRESHOLD_CENTS)} d&apos;achat.
            </p>
          ) : null}
          <div className="mt-3 flex justify-between border-t border-black/10 pt-3 text-base">
            <span>Total</span>
            <strong>{toChf(total)}</strong>
          </div>
        </div>
        <div className="grid gap-2">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            value={shipping.name}
            onChange={(event) => setShipping((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Nom complet"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            value={shipping.phone}
            onChange={(event) => setShipping((prev) => ({ ...prev, phone: event.target.value }))}
            type="tel"
            placeholder="Telephone"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            value={shipping.line1}
            onChange={(event) => setShipping((prev) => ({ ...prev, line1: event.target.value }))}
            placeholder="Adresse ligne 1"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            value={shipping.line2}
            onChange={(event) => setShipping((prev) => ({ ...prev, line2: event.target.value }))}
            placeholder="Adresse ligne 2 (optionnel)"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={shipping.postalCode}
            onChange={(event) => setShipping((prev) => ({ ...prev, postalCode: event.target.value }))}
            placeholder="NPA"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <input
            value={shipping.city}
            onChange={(event) => setShipping((prev) => ({ ...prev, city: event.target.value }))}
            placeholder="Ville"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <select
          value={shipping.country}
          onChange={(event) => setShipping((prev) => ({ ...prev, country: event.target.value }))}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        >
          <option value={SHOP_COUNTRY_CODE}>{SHOP_COUNTRY_LABEL}</option>
        </select>
        <div className="space-y-2">
          {providers.map((item) => (
            <label
              key={item.name}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                item.enabled ? "border-black/10 bg-white" : "border-black/5 bg-black/[0.03] opacity-60"
              }`}
            >
              <input
                type="radio"
                className="mt-1"
                disabled={!item.enabled}
                checked={provider === item.name}
                onChange={() => setProvider(item.name)}
              />
              <span>
                <span className="block font-semibold">{item.label}</span>
                <span className="block text-xs text-[var(--mg-ink)]/60">
                  {item.description}
                  {!item.enabled ? " A configurer dans les variables d'environnement." : ""}
                </span>
              </span>
            </label>
          ))}
        </div>
        <label className="flex items-start gap-2 rounded-lg border border-black/10 p-3 text-xs leading-5 text-[var(--mg-ink)]/75">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            J&apos;accepte les CGV, la politique de retours et le traitement de mes donnees pour finaliser la commande.
          </span>
        </label>
        <button
          type="button"
          disabled={!canCheckout}
          onClick={createCheckout}
          className="w-full rounded-full bg-[var(--mg-accent)] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"
        >
          Continuer vers le paiement
        </button>
      </section>
    </div>
    </div>
  );
}
