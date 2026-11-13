-- Autorise les commandes sans compte et ajoute la promotion de livraison offerte.

alter table public.commandes
alter column utilisateur_id drop not null;

alter table public.admin_settings
add column if not exists free_shipping_promo_enabled boolean not null default false;

-- Les codes promo à usage unique restent contrôlés par email pour les invités.
alter table public.codes_promo_utilisations
alter column utilisateur_id drop not null;

alter table public.codes_promo_utilisations
drop constraint if exists codes_promo_utilisations_customer_check;

alter table public.codes_promo_utilisations
add constraint codes_promo_utilisations_customer_check
check (utilisateur_id is not null or nullif(btrim(email), '') is not null);

create unique index if not exists codes_promo_utilisations_guest_email_unique
on public.codes_promo_utilisations(code_promo_id, lower(email))
where utilisateur_id is null and email is not null;
