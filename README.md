# Le Mini Gang MVP

MVP e-commerce Suisse Next.js + Supabase + Stripe/TWINT, optimise pour un cout infra mensuel proche de 0 CHF:
- Front: Next.js (App Router) deployable sur Cloudflare Pages
- DB/Auth/Storage: Supabase (Free)
- Paiements: carte bancaire via Stripe + TWINT via abstraction provider
- Emails transactionnels: Resend

## 1) Demarrage local

```bash
npm install
npm run dev
```

Application: `http://localhost:3000`

## 2) Variables d'environnement

Copier `.env.local` puis definir:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

PAYMENT_PROVIDER_DEFAULT=stripe
ENABLE_STRIPE=true
ENABLE_KLARNA=false
ENABLE_TWINT=false
TWINT_PROVIDER_MODE=stripe
TWINT_CURRENCY=chf

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

KLARNA_API_BASE_URL=
KLARNA_USERNAME=
KLARNA_PASSWORD=
KLARNA_WEBHOOK_SECRET=

RESEND_API_KEY=
ADMIN_NOTIFICATION_EMAIL=
PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENABLE_MONDIAL_RELAY=false
MONDIAL_RELAY_API_URL=
MONDIAL_RELAY_API_KEY=
BUYBACK_RECEIVER_NAME="Le Mini Gang"
BUYBACK_RECEIVER_LINE1="Atelier Mini Gang"
BUYBACK_RECEIVER_POSTAL_CODE=1000
BUYBACK_RECEIVER_CITY=Lausanne
BUYBACK_RECEIVER_COUNTRY=CH
```

## 3) Setup Supabase (SQL + RLS + Storage)

1. Creer un projet Supabase.
2. Ouvrir SQL Editor.
3. Executer `supabase/sql/001_init.sql`.
4. Executer `supabase/sql/002_admin_modules.sql`.
5. Executer `supabase/sql/003_sell_orders_wallet.sql`.
6. Executer les migrations suivantes dans l'ordre (`004`, `005`, `006`) si la base existe deja.
7. Dans `utilisateurs`, passer votre utilisateur admin en `role='admin'`.
8. Buckets et tables sont crees via SQL selon les modules actifs.

## 4) Paiements

### Stripe
- Endpoint webhook: `POST /api/webhooks/stripe`
- Evenements recommandes:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `checkout.session.async_payment_failed`
- Idempotence: table `payments_events(event_id unique)`

### Klarna
- Endpoint webhook/callback: `POST /api/webhooks/klarna`
- Activer `ENABLE_KLARNA=true` + creds API.
- Meme mecanisme idempotent via `payments_events`.

## 5) API principales

- `GET /api/products` (filtres + pagination + tri)
- `GET /api/products/[id]`
- `POST /api/checkout/create`
  - revalidation des prix
  - reservation stock TTL (20 min)
  - creation order draft
  - creation session provider
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/klarna`
- Sell / buyback seller: desactive pour le lancement Suisse, page `/vendre` orientee contact.
  - `POST /api/sell-orders/[id]/submit`
  - `POST /api/sell-orders/[id]/tracking`
  - `POST /api/sell-items/upload-url`
  - `POST /api/payouts/request`
  - `GET|POST /api/seller/profile`
- Admin:
  - `POST /api/admin/products`
  - `PATCH|DELETE /api/admin/products/[id]`
  - `POST /api/admin/products/[id]/images`
  - `GET /api/admin/orders`
  - `GET|PATCH /api/admin/orders/[id]`
  - `POST /api/admin/reservations/cleanup`
  - `GET /api/admin/sell-orders`
  - `GET /api/admin/sell-orders/[id]`
  - `POST /api/admin/sell-orders/[id]/mark-received`
  - `POST /api/admin/sell-orders/[id]/decide`
  - `GET /api/admin/payouts`
  - `POST /api/admin/payouts/[id]/mark-paid`

## 6) Anti double-vente (piece unique)

Lors du checkout:
- `products.status` passe a `reserved`
- `reserved_until = now + 15 minutes`
- update conditionnel atomique par produit

Webhook paiement confirme:
- `orders.status = paid`
- produits passes a `sold`

Expiration/annulation:
- route cleanup remet `reserved -> active` si TTL depasse.

## 7) Cloudflare Pages

Configuration recommandee:
- Framework preset: `Next.js`
- Build command: `npm run build`
- Build output directory: `.next`
- Variables env: toutes les variables listees plus haut

Important:
- Les routes API sont edge-compatible (fetch/web APIs)
- Pas de dependance Prisma/Node-only dans la couche critique runtime

## 8) Admin

- Connexion: `/admin/login` (Supabase Auth email/password)
- Dashboard: `/admin`
- Produits: `/admin/products`
- Commandes: `/admin/orders`
- Livraisons: `/admin/shipments`
- Retours: `/admin/returns`
- Sell Orders: `/admin/sell-orders`
- Clients: `/admin/customers`
- Rachat: `/admin/procurement`
- Analytics: `/admin/analytics`
- Parametres: `/admin/settings`

L'admin est structuree en layout type "Medusa" (sidebar + topbar) et isolee de la navigation publique.

## 9) Tracking Analytics (events business)

Table `analytics_events`:
- `page_view`
- `add_to_cart`
- `begin_checkout`
- `purchase`
- `return_request`

Le dashboard degrade proprement si certains events sont absents.

## 10) Vendre mes vetements

- Landing publique: `/vendre`
- Wizard vendeur: `/vendre/commencer`
- Espace vendeur:
  - `/mon-compte`
  - `/mon-compte/profil`
  - `/mon-compte/cagnotte`
  - `/mon-compte/ventes`
  - `/mon-compte/ventes/[order_number]`

Workflow:
- creation dossier `sell_orders` + `sell_order_items`
- estimation instantanee via `src/lib/pricingEngine.ts`
- generation bordereau PDF (QR code) via provider shipping
  - `MondialRelayProvider` si active
  - fallback `InternalPdfProvider`
- upload PDF dans bucket `sell-labels`
- decision admin item par item depuis `/admin/sell-orders/[id]`
- credit wallet (ledger) + creation produits si accepte
- demande retrait manuelle via `/mon-compte/cagnotte`

## 11) Observabilite / hardening

- Logs structures JSON (voir `src/lib/logger.ts`)
- Correlation IDs logges: `order_id`, `provider_session_id`, `event_id`
- Rate-limit en memoire pour endpoint checkout (`src/lib/rate-limit.ts`)
- Validation stricte Zod sur payloads API

## 12) Depannage

- `Payment provider not available`:
  - verifier `ENABLE_STRIPE` / `ENABLE_KLARNA` et credentials.
- `Missing environment variable`:
  - une variable obligatoire est absente.
- Webhook ignore:
  - event deja traite (`payments_events` idempotence).
- Produit indisponible:
  - deja reserve ou vendu.
