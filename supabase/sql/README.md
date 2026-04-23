# SQL Status

Etat verifie le `2026-04-23` sur la base Supabase active du projet:

- Le schema distant correspond au schema final e-commerce present dans `000_final_schema.sql`.
- En migrations incrementales, l'equivalent observe est `001_init.sql` + `004_add_age_to_vetements.sql` + `005_payment_methods_twint_settings.sql` + `006_swiss_production_checkout.sql`.
- `002_admin_modules.sql` et `003_sell_orders_wallet.sql` sont des reliquats neutralises: ils ne creent rien dans la base actuelle.

Tables confirmees dans Supabase:

- `admin_settings`
- `articles_commande`
- `commandes`
- `photos_vetements`
- `returns`
- `shipments`
- `utilisateurs`
- `vetements`

Tables absentes dans Supabase aujourd'hui:

- `articles_commandes`
- `sell_orders`
- `payouts`

Conseil d'utilisation:

- Base neuve: executer `000_final_schema.sql`.
- Base existante deja initialisee: appliquer seulement les migrations incrementales manquantes.
