"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { FREE_SHIPPING_THRESHOLD_CENTS, SHOP_COUNTRY_CODE, SHOP_COUNTRY_LABEL } from "@/lib/shop-config";
import type { PaymentProviderName } from "@/lib/types";
import { toChf } from "@/lib/utils";

type StripeEmbeddedCheckout = {
  mount: (selector: string) => void;
  destroy: () => void;
};

type StripeBrowserClient = {
  initEmbeddedCheckout: (options: { fetchClientSecret: () => Promise<string> }) => Promise<StripeEmbeddedCheckout>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeBrowserClient;
  }
}

interface ProductLite {
  id: string;
  title: string;
  price_cents: number;
  brand?: string | null;
  size_label?: string | null;
  age_range?: string | null;
  image_url?: string | null;
  status: string;
  available: boolean;
}

type CheckoutPayload = {
  redirectUrl?: string;
  clientSecret?: string;
  error?: string;
};

function getCartImageSrc(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/vetements/${path.replace(/^\/+/, "")}`;
}

function getProductMeta(product: ProductLite) {
  return [product.brand, product.size_label, product.age_range].filter(Boolean).join(" · ");
}

function unavailableLabel(status: string) {
  if (status === "vendu") return "Ce vêtement vient d'être acheté par quelqu'un d'autre.";
  if (status === "reserve") return "Ce vêtement est déjà réservé dans un autre panier.";
  if (status === "introuvable") return "Ce vêtement n'est plus disponible.";
  return "Ce vêtement n'est plus disponible à la commande.";
}

function WarningIcon() {
  return (
    <span
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 border-[#9a6a00] bg-[var(--mg-pop-sun)] text-base font-black leading-none text-[var(--mg-ink)]"
      aria-hidden="true"
    >
      !
    </span>
  );
}

function RequiredMark() {
  return <span className="font-black text-[var(--mg-pop-rose)]">*</span>;
}

function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-[var(--mg-ink)]/68">
      {children} {required ? <RequiredMark /> : null}
    </span>
  );
}

function inputClass(hasValue: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm font-semibold outline-none transition focus:border-[var(--mg-ink)] focus:ring-2 focus:ring-[var(--mg-pop-sun)]/35 ${
    hasValue ? "border-black/12 bg-white" : "border-[var(--mg-pop-rose)]/45 bg-[var(--mg-rose-soft)]/45"
  }`;
}

function loadStripeScript() {
  if (window.Stripe) return Promise.resolve();
  const existing = document.getElementById("stripe-js");
  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Stripe.js n'a pas pu charger.")), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "stripe-js";
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Stripe.js n'a pas pu charger."));
    document.head.appendChild(script);
  });
}

export function CartClient({
  providers,
  defaultProvider,
  shippingFeeCents,
  ordersEnabled = true,
  ordersClosedMessage,
  ordersReopenDate,
  stripePublishableKey,
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
  stripePublishableKey?: string;
}) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [email, setEmail] = useState("");
  const provider = defaultProvider;
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
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (items.length === 0) {
        setProducts([]);
        return;
      }
      const response = await fetch("/api/products/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const payload = await response.json().catch(() => ({ products: [] }));
      setProducts(payload.products ?? []);
    };
    void run();
  }, [items]);

  useEffect(() => {
    setCheckoutClientSecret(null);
    setCheckoutError(null);
  }, [items, provider]);

  useEffect(() => {
    if (!checkoutClientSecret) return;
    let cancelled = false;
    let embeddedCheckout: StripeEmbeddedCheckout | null = null;

    const mountStripe = async () => {
      setIsStripeLoading(true);
      setCheckoutError(null);
      try {
        await loadStripeScript();
        if (!stripePublishableKey) throw new Error("La clé publique Stripe est manquante.");
        const stripe = window.Stripe?.(stripePublishableKey);
        if (!stripe) throw new Error("Stripe.js n'est pas disponible.");
        embeddedCheckout = await stripe.initEmbeddedCheckout({
          fetchClientSecret: async () => checkoutClientSecret,
        });
        if (cancelled) {
          embeddedCheckout.destroy();
          return;
        }
        embeddedCheckout.mount("#stripe-embedded-checkout");
      } catch (error) {
        if (!cancelled) {
          setCheckoutError(error instanceof Error ? error.message : "Paiement Stripe impossible.");
        }
      } finally {
        if (!cancelled) setIsStripeLoading(false);
      }
    };

    void mountStripe();

    return () => {
      cancelled = true;
      embeddedCheckout?.destroy();
    };
  }, [checkoutClientSecret, stripePublishableKey]);

  const availableProducts = useMemo(() => products.filter((item) => item.available), [products]);
  const unavailableProducts = useMemo(() => products.filter((item) => !item.available), [products]);
  const subtotal = useMemo(() => availableProducts.reduce((sum, item) => sum + item.price_cents, 0), [availableProducts]);
  const effectiveShippingFeeCents = subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : shippingFeeCents;
  const total = subtotal + effectiveShippingFeeCents;
  const selectedProvider = providers.find((item) => item.name === provider);
  const requiredFieldsComplete =
    email.length > 0 &&
    shipping.name.length > 1 &&
    shipping.phone.length > 5 &&
    shipping.line1.length > 1 &&
    shipping.postalCode.length > 1 &&
    shipping.city.length > 1;
  const canCheckout =
    products.length > 0 &&
    unavailableProducts.length === 0 &&
    requiredFieldsComplete &&
    acceptTerms &&
    ordersEnabled &&
    Boolean(selectedProvider?.enabled) &&
    !checkoutClientSecret;

  const createCheckout = async () => {
    setCheckoutError(null);
    if (!selectedProvider?.enabled) {
      setCheckoutError("Ce mode de paiement n'est pas encore configuré.");
      return;
    }
    if (!ordersEnabled) {
      setCheckoutError(ordersClosedMessage || "Les commandes sont temporairement suspendues.");
      return;
    }
    if (!requiredFieldsComplete || !acceptTerms) {
      setCheckoutError("Complétez les champs obligatoires et acceptez les CGV avant de continuer.");
      return;
    }

    setIsCreatingCheckout(true);
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
    const payload = (await response.json().catch(() => ({}))) as CheckoutPayload;
    setIsCreatingCheckout(false);

    if (!response.ok) {
      setCheckoutError(payload.error ?? "Checkout impossible");
      return;
    }
    if (provider === "stripe" && payload.clientSecret) {
      setCheckoutClientSecret(payload.clientSecret);
      return;
    }
    if (payload.redirectUrl) {
      window.location.href = payload.redirectUrl;
      return;
    }
    setCheckoutError("Réponse de paiement incomplète.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black leading-tight text-[var(--mg-on-dark)] md:text-5xl">Panier</h1>
        </div>
        <p className="max-w-md text-sm font-semibold leading-6 text-[var(--mg-on-dark-muted)]">
          Les champs marqués <RequiredMark /> sont obligatoires. Le paiement carte s&apos;affiche directement ici après validation.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_430px]">
        <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--mg-pop-rose)]">Étape 1</p>
              <h2 className="text-xl font-black text-[var(--mg-ink)]">Articles sélectionnés</h2>
            </div>
            <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-xs font-black text-[var(--mg-ink)]/70">
              {products.length} article{products.length > 1 ? "s" : ""}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-black/10 p-5">
              <p className="text-sm font-semibold text-[var(--mg-ink)]">Votre panier est vide.</p>
              <p className="mt-1 text-xs leading-5 text-[var(--mg-ink)]/60">Les pièces ajoutées depuis la boutique apparaîtront ici.</p>
            </div>
          ) : null}

          <div className="mt-4 divide-y divide-black/10">
            {products.map((product) => {
              const imageSrc = getCartImageSrc(product.image_url);
              const meta = getProductMeta(product);

              return (
                <article
                  key={product.id}
                  className={`flex items-center justify-between gap-4 py-4 ${product.available ? "" : "bg-[var(--mg-pop-sun)]/12 px-2"}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {!product.available ? <WarningIcon /> : null}
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-[var(--mg-cream)]">
                      {imageSrc ? (
                        <img src={imageSrc} alt={product.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-[0.62rem] font-black uppercase leading-3 text-[var(--mg-ink)]/45">
                          Mini Gang
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      {product.brand ? <p className="truncate text-xs font-black uppercase text-[var(--mg-pop-rose)]">{product.brand}</p> : null}
                      <p className="truncate text-base font-black text-[var(--mg-ink)]">{product.title}</p>
                      {meta ? <p className="mt-0.5 truncate text-sm font-semibold text-[var(--mg-ink)]/60">{meta}</p> : null}
                      {product.available ? (
                        <p className="mt-2 text-base font-black text-[var(--mg-ink)]">{toChf(product.price_cents)}</p>
                      ) : (
                        <p className="mt-1 text-xs font-black leading-5 text-[#8a5300]">{unavailableLabel(product.status)}</p>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={() => removeItem(product.id)} className="shrink-0 text-xs font-black text-[var(--mg-accent)] underline">
                    Retirer
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm md:p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--mg-pop-rose)]">Étape 2</p>
            <h2 className="mt-1 text-xl font-black text-[var(--mg-ink)]">Livraison</h2>
            {!ordersEnabled ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                <p>{ordersClosedMessage || "Les commandes sont temporairement suspendues."}</p>
                {ordersReopenDate ? <p className="mt-1 text-xs">Réouverture prévue: {ordersReopenDate}</p> : null}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              <label>
                <FieldLabel required>Email</FieldLabel>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="hello@exemple.ch"
                  className={inputClass(email.length > 0)}
                />
              </label>
              <label>
                <FieldLabel required>Nom complet</FieldLabel>
                <input
                  value={shipping.name}
                  onChange={(event) => setShipping((prev) => ({ ...prev, name: event.target.value }))}
                  autoComplete="name"
                  placeholder="Prénom Nom"
                  className={inputClass(shipping.name.length > 1)}
                />
              </label>
              <label>
                <FieldLabel required>Téléphone</FieldLabel>
                <input
                  value={shipping.phone}
                  onChange={(event) => setShipping((prev) => ({ ...prev, phone: event.target.value }))}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+41 ..."
                  className={inputClass(shipping.phone.length > 5)}
                />
              </label>
              <label>
                <FieldLabel required>Adresse</FieldLabel>
                <input
                  value={shipping.line1}
                  onChange={(event) => setShipping((prev) => ({ ...prev, line1: event.target.value }))}
                  autoComplete="address-line1"
                  placeholder="Rue et numéro"
                  className={inputClass(shipping.line1.length > 1)}
                />
              </label>
              <label>
                <FieldLabel>Complément</FieldLabel>
                <input
                  value={shipping.line2}
                  onChange={(event) => setShipping((prev) => ({ ...prev, line2: event.target.value }))}
                  autoComplete="address-line2"
                  placeholder="Appartement, étage..."
                  className={inputClass(true)}
                />
              </label>
              <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                <label>
                  <FieldLabel required>NPA</FieldLabel>
                  <input
                    value={shipping.postalCode}
                    onChange={(event) => setShipping((prev) => ({ ...prev, postalCode: event.target.value }))}
                    autoComplete="postal-code"
                    placeholder="1000"
                    className={inputClass(shipping.postalCode.length > 1)}
                  />
                </label>
                <label>
                  <FieldLabel required>Ville</FieldLabel>
                  <input
                    value={shipping.city}
                    onChange={(event) => setShipping((prev) => ({ ...prev, city: event.target.value }))}
                    autoComplete="address-level2"
                    placeholder="Lausanne"
                    className={inputClass(shipping.city.length > 1)}
                  />
                </label>
              </div>
              <label>
                <FieldLabel required>Pays</FieldLabel>
                <select
                  value={shipping.country}
                  onChange={(event) => setShipping((prev) => ({ ...prev, country: event.target.value }))}
                  className={inputClass(true)}
                >
                  <option value={SHOP_COUNTRY_CODE}>{SHOP_COUNTRY_LABEL}</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-black/10 bg-white p-4 shadow-sm md:p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--mg-pop-rose)]">Étape 3</p>
            <h2 className="mt-1 text-xl font-black text-[var(--mg-ink)]">Paiement</h2>
            {unavailableProducts.length > 0 ? (
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#e1a300] bg-[var(--mg-pop-sun)]/18 p-3 text-sm font-semibold text-[var(--mg-ink)]">
                <WarningIcon />
                <p>Retirez les vêtements signalés du panier avant de continuer. Un article unique peut être acheté par quelqu&apos;un d&apos;autre entre temps.</p>
              </div>
            ) : null}

            <div className="mt-4 rounded-lg border border-black/10 bg-black/[0.02] p-3 text-sm">
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
                  Livraison offerte dès {toChf(FREE_SHIPPING_THRESHOLD_CENTS)} d&apos;achat.
                </p>
              ) : null}
              <div className="mt-3 flex justify-between border-t border-black/10 pt-3 text-base">
                <span>Total</span>
                <strong>{toChf(total)}</strong>
              </div>
            </div>

            <label className="mt-4 flex items-start gap-2 rounded-lg border border-black/10 p-3 text-xs leading-5 text-[var(--mg-ink)]/75">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
                disabled={Boolean(checkoutClientSecret)}
                className="mt-0.5"
              />
              <span>
                <RequiredMark /> J&apos;accepte les CGV, la politique de retours et le traitement de mes données pour finaliser la commande.
              </span>
            </label>

            {checkoutError ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{checkoutError}</p>
            ) : null}

            {!checkoutClientSecret ? (
              <button
                type="button"
                disabled={!canCheckout || isCreatingCheckout}
                onClick={createCheckout}
                className="mt-4 w-full rounded-full bg-[var(--mg-accent)] px-4 py-3 text-sm font-black text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreatingCheckout ? "Preparation du paiement..." : "Afficher le formulaire de paiement"}
              </button>
            ) : null}
          </section>
        </aside>
      </div>

      {checkoutClientSecret ? (
        <section className="mt-6 rounded-xl border border-black/10 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--mg-pop-rose)]">Étape 4</p>
            <h2 className="mt-1 text-xl font-black text-[var(--mg-ink)]">Paiement sécurisé Stripe</h2>
            <p className="mt-1 text-sm font-semibold text-[var(--mg-ink)]/65">Votre vêtement est réservé pendant que vous finalisez le paiement.</p>
          </div>
          {isStripeLoading ? <p className="text-sm font-semibold text-[var(--mg-ink)]/70">Chargement du formulaire Stripe...</p> : null}
          <div id="stripe-embedded-checkout" className="min-h-[560px]" />
        </section>
      ) : null}
    </div>
  );
}
