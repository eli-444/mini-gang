# Suivi modifications Mini Gang

Derniere mise a jour: 2026-05-10

## Contexte

Objectif global: faire evoluer Mini Gang en boutique e-commerce + outil interne de gestion de stock + systeme flexible pour ouvrir/fermer temporairement le rachat et les commandes sans modifier le code.

Les changements ci-dessous ont ete faits dans le code, mais la migration Supabase doit encore etre appliquee en base.

## Fichiers importants ajoutes

- `src/lib/product-categories.ts`
  - Liste officielle des categories boutique:
    - Bodies
    - Debardeurs
    - Tee-shirts
    - Polos
    - Blouses
    - Chemises
    - Pulls
    - Polaires
    - Gilets
    - Sweat-shirts
    - Robes
    - Pantalons
    - Shorts
    - Jupes
    - Salopettes
    - Combinaisons
    - Ensembles
    - Manteaux
    - Vestes
    - Doudounes
    - Vestes/pantalons de ski
    - Pyjamas
    - Maillots de bains
  - Conserve aussi les anciennes categories en compatibilite: `haut`, `bas`, `robe`, `veste`, `manteau`, `chaussures`, `accessoire`, `autre`.

- `src/lib/product-options.ts`
  - Options d'etat produit.
  - Options de statut produit.
  - Options de saison.
  - Helpers d'affichage des labels.

- `supabase/sql/007_product_stock_and_closures.sql`
  - Migration a appliquer dans Supabase.
  - Ajoute/autorise:
    - nouveaux etats produit
    - nouveau statut `hors_ligne`
    - nouvelles categories boutique
    - `prix_neuf_centimes`
    - `saison`
    - `emplacement_stock`

## Produit / stock

Changements faits:

- Ajout des champs cote produit:
  - marque
  - photos recto/verso via l'ordre des images
  - taille
  - etat du vetement
  - prix neuf barre: `prix_neuf_centimes`
  - prix de vente: `prix_centimes`
  - saison
  - emplacement stock/local: `emplacement_stock`

- Statuts dashboard:
  - `brouillon`
  - `disponible` = En ligne
  - `hors_ligne`
  - `vendu`
  - `archive`
  - `reserve` conserve pour le checkout/reservations.

- La boutique continue de n'afficher que les produits `statut = disponible`.

Fichiers touches:

- `src/lib/types.ts`
- `src/lib/products.ts`
- `src/lib/admin-data.ts`
- `src/lib/validation.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/components/admin/new-product-form.tsx`
- `src/components/admin/edit-product-form.tsx`
- `src/app/admin/(dashboard)/products/page.tsx`
- `src/app/admin/(dashboard)/products/[id]/page.tsx`

## Fiche produit client

Changements faits:

- Affiche:
  - categorie lisible
  - etat lisible
  - taille
  - age
  - marque
  - saison
  - prix de vente
  - prix neuf barre si present
- Ajout d'un zoom photo sur la galerie produit.
- Galerie compatible jusqu'a 6 images.

Fichiers touches:

- `src/app/boutique/[slug]/page.tsx`
- `src/components/product-image-carousel.tsx`
- `src/components/product-card.tsx`

## Boutique / filtres

Changements faits:

- Ajout du filtre `Saison`.
- Remplacement des anciennes categories visibles par la liste officielle.
- Compatibilite gardee avec les anciennes categories en base.

Fichiers touches:

- `src/components/product-filters-form.tsx`
- `src/lib/products.ts`
- `src/lib/validation.ts`

## Livraison / commandes

Changements faits:

- Livraison fixe par defaut: `790` centimes CHF.
- Livraison gratuite a partir de `8000` centimes CHF.
- Blocage des commandes possible depuis les settings admin.
- Quand les commandes sont fermees:
  - message affiche sur la homepage
  - message affiche dans le panier/checkout
  - API checkout bloque la creation de commande
  - date de reouverture optionnelle

Fichiers touches:

- `src/lib/shop-config.ts`
- `src/components/cart-client.tsx`
- `src/app/panier/page.tsx`
- `src/app/panier/checkout/page.tsx`
- `src/app/api/checkout/create/route.ts`
- `src/app/page.tsx`
- `src/components/admin/site-content-settings-form.tsx`
- `src/lib/site-content-settings.ts`
- `src/app/api/admin/settings/site-content/route.ts`

## Rachat / depot

Changements faits:

- Ajout d'une option admin pour ouvrir/fermer le service de rachat.
- Message de fermeture personnalisable.
- Zones texte administrables pour:
  - conditions de reprise
  - marques refusees
  - explications clients
- Minimum colis: 10 vetements.
- Maximum colis: 50 vetements.
- Textes adaptes pour ne plus faire payer les frais d'envoi aux clients.

Important:

- Le vrai parcours rachat complet reste encore a reconstruire.
- Pour l'instant, l'ouverture/fermeture et les textes sont prets.
- L'API historique `sell-orders/create` reste desactivee/simplifiee.

Fichiers touches:

- `src/app/vendre/page.tsx`
- `src/app/vendre/commencer/page.tsx`
- `src/components/sell/sell-order-wizard.tsx`
- `src/lib/validation.ts`
- `src/lib/site-content-settings.ts`
- `src/components/admin/site-content-settings-form.tsx`

## Moteur de prix rachat / revente

Source recue:

- Fichier disponible: `C:\Users\arthu\Downloads\Tableau prix ZARA.pdf`
- Le fichier annonce comme `.xlsx` n'etait pas present, seulement le PDF.
- Le PDF a ete extrait avec Python + `pypdf`.
- 141 lignes ZARA detectees.

Changements faits:

- `src/lib/pricingEngine.ts` enrichi pour retourner:
  - estimation de rachat
  - fourchette de rachat
  - fourchette prix de revente
  - fourchette prix neuf
- Ajout de regles ZARA agregees par:
  - marque
  - tranche age:
    - `0-18 mois`
    - `2-6 ans`
    - `7-12 ans`
  - categorie boutique
- Les prix neuf/revente sont pour l'admin/interne.
- La fourchette de rachat pourra etre affichee au client pour eviter la negociation.

Important:

- Le moteur est pret cote code.
- Il n'est pas encore branche sur une vraie interface client de rachat.
- Prochaine etape logique: formulaire rachat qui appelle `estimateBuyback(...)` quand la cliente choisit marque + age + categorie + etat.

## Verification deja faite

Commandes passees avec succes:

```bash
npm run lint
npm run build
```

## A faire ensuite

1. Appliquer la migration Supabase:
   - `supabase/sql/007_product_stock_and_closures.sql`

2. Tester dans l'admin:
   - creation produit avec nouvelle categorie
   - saison
   - prix neuf barre
   - emplacement stock
   - statut brouillon/en ligne/hors ligne
   - photos recto/verso

3. Verifier cote boutique:
   - seuls les produits `disponible` apparaissent
   - filtre saison OK
   - categories OK
   - fiche produit affiche prix neuf barre et zoom

4. Brancher le moteur de prix sur le futur formulaire rachat:
   - entree cliente: marque, age/taille, categorie, etat
   - sortie cliente: fourchette de rachat
   - garder prix neuf / prix revente cote admin seulement

5. Ajouter plus tard:
   - textes CGV definitifs
   - liste officielle des marques refusees
   - conditions rachat finales
   - interface stock plus pratique: recherche par emplacement, filtres stock, export eventuel.

## Notes pour le prochain chat

- Ne pas repartir de zero: les fondations sont deja en place.
- Priorite suivante recommandee: appliquer SQL + tester admin produit.
- Ensuite: construire le vrai formulaire rachat connecte au moteur `estimateBuyback`.
- Attention: les anciennes categories existent encore pour compatibilite, mais les nouvelles fiches doivent utiliser les categories de `productCategoryOptions`.
