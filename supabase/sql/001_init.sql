-- Schema simplifie Le Mini Gang.
-- Attention: ce script supprime toutes les tables du schema public.

drop trigger if exists creer_utilisateur_apres_inscription on auth.users;
drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.creer_utilisateur_apres_inscription() cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.mettre_a_jour_modifie_le() cascade;
drop function if exists public.est_admin() cascade;
drop function if exists public.proteger_role_utilisateur() cascade;

do $$
declare
  table_a_supprimer record;
begin
  for table_a_supprimer in
    select format('%I.%I', n.nspname, c.relname) as nom_table
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and not exists (
        select 1
        from pg_depend d
        join pg_extension e on e.oid = d.refobjid
        where d.objid = c.oid
      )
  loop
    execute 'drop table if exists ' || table_a_supprimer.nom_table || ' cascade';
  end loop;
end $$;

create or replace function public.mettre_a_jour_modifie_le()
returns trigger
language plpgsql
as $$
begin
  new.modifie_le = now();
  return new;
end;
$$;

create table public.utilisateurs (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  prenom text,
  nom text,
  telephone text,
  role text not null default 'client' check (role in ('client', 'admin')),
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

create trigger maj_utilisateurs_modifie_le
before update on public.utilisateurs
for each row
execute function public.mettre_a_jour_modifie_le();

create or replace function public.est_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.utilisateurs where id = auth.uid()), false);
$$;

grant execute on function public.est_admin() to anon, authenticated;

create or replace function public.proteger_role_utilisateur()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role
     and not public.est_admin()
     and current_user not in ('postgres', 'service_role', 'supabase_admin')
  then
    raise exception 'Seul un admin peut modifier le role.';
  end if;

  return new;
end;
$$;

create trigger proteger_role_utilisateur
before update on public.utilisateurs
for each row
execute function public.proteger_role_utilisateur();

create or replace function public.creer_utilisateur_apres_inscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.utilisateurs (id, email, prenom, nom)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'prenom',
    new.raw_user_meta_data ->> 'nom'
  )
  on conflict (id) do update
  set email = excluded.email,
      modifie_le = now();

  return new;
end;
$$;

create trigger creer_utilisateur_apres_inscription
after insert on auth.users
for each row
execute function public.creer_utilisateur_apres_inscription();

insert into public.utilisateurs (id, email)
select id, email
from auth.users
where email is not null
on conflict (id) do update
set email = excluded.email,
    modifie_le = now();

create table public.vetements (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text,
  prix_centimes integer not null check (prix_centimes >= 0),
  categorie text not null check (categorie in ('haut', 'bas', 'robe', 'veste', 'manteau', 'chaussures', 'accessoire', 'autre')),
  age text check (age in ('3 mois', '6 mois', '9 mois', '12 mois', '2 ans', '3 ans', '4 ans', '5 ans', '6 ans', '7 ans', '8 ans', '9 ans', '10 ans', '11 ans', '12 ans')),
  taille text not null,
  marque text,
  couleur text,
  matiere text,
  genre text not null default 'mixte' check (genre in ('femme', 'homme', 'enfant', 'mixte')),
  etat text not null check (etat in ('neuf', 'tres_bon', 'bon', 'correct')),
  statut text not null default 'disponible' check (statut in ('brouillon', 'disponible', 'reserve', 'vendu', 'archive')),
  mis_en_avant boolean not null default false,
  cree_par uuid references public.utilisateurs(id) on delete set null,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

create trigger maj_vetements_modifie_le
before update on public.vetements
for each row
execute function public.mettre_a_jour_modifie_le();

create index vetements_statut_idx on public.vetements(statut);
create index vetements_categorie_idx on public.vetements(categorie);
create index vetements_age_idx on public.vetements(age);
create index vetements_taille_idx on public.vetements(taille);
create index vetements_mis_en_avant_idx on public.vetements(mis_en_avant);

create table public.photos_vetements (
  id uuid primary key default gen_random_uuid(),
  vetement_id uuid not null references public.vetements(id) on delete cascade,
  url text not null,
  texte_alt text,
  position integer not null default 0 check (position >= 0),
  principale boolean not null default false,
  cree_le timestamptz not null default now()
);

create index photos_vetements_vetement_id_idx on public.photos_vetements(vetement_id);
create unique index une_photo_principale_par_vetement on public.photos_vetements(vetement_id) where principale = true;

create table public.commandes (
  id uuid primary key default gen_random_uuid(),
  utilisateur_id uuid not null references public.utilisateurs(id) on delete restrict,
  email text not null,
  prenom text not null,
  nom text not null,
  telephone text,
  adresse_ligne_1 text not null,
  adresse_ligne_2 text,
  code_postal text not null,
  ville text not null,
  pays text not null default 'Suisse',
  total_centimes integer not null check (total_centimes >= 0),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'payee', 'preparee', 'envoyee', 'livree', 'annulee', 'remboursee')),
  stripe_session_id text unique,
  stripe_payment_intent_id text unique,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

create trigger maj_commandes_modifie_le
before update on public.commandes
for each row
execute function public.mettre_a_jour_modifie_le();

create index commandes_utilisateur_id_idx on public.commandes(utilisateur_id);
create index commandes_statut_idx on public.commandes(statut);

create table public.articles_commande (
  id uuid primary key default gen_random_uuid(),
  commande_id uuid not null references public.commandes(id) on delete cascade,
  vetement_id uuid references public.vetements(id) on delete set null,
  nom_vetement text not null,
  taille text not null,
  prix_centimes integer not null check (prix_centimes >= 0),
  cree_le timestamptz not null default now()
);

create index articles_commande_commande_id_idx on public.articles_commande(commande_id);
create index articles_commande_vetement_id_idx on public.articles_commande(vetement_id);
alter table public.utilisateurs enable row level security;
alter table public.vetements enable row level security;
alter table public.photos_vetements enable row level security;
alter table public.commandes enable row level security;
alter table public.articles_commande enable row level security;

create policy "utilisateurs_voir_son_profil_ou_admin" on public.utilisateurs
for select using (id = auth.uid() or public.est_admin());

create policy "utilisateurs_modifier_son_profil_ou_admin" on public.utilisateurs
for update using (id = auth.uid() or public.est_admin())
with check (id = auth.uid() or public.est_admin());

create policy "utilisateurs_creer_son_profil" on public.utilisateurs
for insert with check (id = auth.uid() or public.est_admin());

create policy "vetements_visibles_par_tous" on public.vetements
for select using (statut = 'disponible' or public.est_admin());

create policy "vetements_admin_creation" on public.vetements
for insert to authenticated with check (public.est_admin());

create policy "vetements_admin_modification" on public.vetements
for update to authenticated using (public.est_admin()) with check (public.est_admin());

create policy "vetements_admin_suppression" on public.vetements
for delete to authenticated using (public.est_admin());

create policy "photos_vetements_visibles_par_tous" on public.photos_vetements
for select using (
  exists (
    select 1
    from public.vetements v
    where v.id = photos_vetements.vetement_id
      and (v.statut = 'disponible' or public.est_admin())
  )
);

create policy "photos_vetements_admin_creation" on public.photos_vetements
for insert to authenticated with check (public.est_admin());

create policy "photos_vetements_admin_modification" on public.photos_vetements
for update to authenticated using (public.est_admin()) with check (public.est_admin());

create policy "photos_vetements_admin_suppression" on public.photos_vetements
for delete to authenticated using (public.est_admin());

create policy "commandes_client_voir_ses_commandes_ou_admin" on public.commandes
for select to authenticated using (utilisateur_id = auth.uid() or public.est_admin());

create policy "commandes_client_creer_sa_commande" on public.commandes
for insert to authenticated with check (utilisateur_id = auth.uid() and statut = 'en_attente');

create policy "commandes_admin_modification" on public.commandes
for update to authenticated using (public.est_admin()) with check (public.est_admin());

create policy "commandes_admin_suppression" on public.commandes
for delete to authenticated using (public.est_admin());

create policy "articles_commande_client_voir_ses_articles_ou_admin" on public.articles_commande
for select to authenticated using (
  exists (
    select 1
    from public.commandes c
    where c.id = articles_commande.commande_id
      and (c.utilisateur_id = auth.uid() or public.est_admin())
  )
);

create policy "articles_commande_client_creation" on public.articles_commande
for insert to authenticated with check (
  exists (
    select 1
    from public.commandes c
    where c.id = articles_commande.commande_id
      and c.utilisateur_id = auth.uid()
      and c.statut = 'en_attente'
  )
);

create policy "articles_commande_admin_modification" on public.articles_commande
for update to authenticated using (public.est_admin()) with check (public.est_admin());

create policy "articles_commande_admin_suppression" on public.articles_commande
for delete to authenticated using (public.est_admin());

insert into storage.buckets (id, name, public)
values ('vetements', 'vetements', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "vetements_bucket_public_read" on storage.objects;
drop policy if exists "vetements_bucket_admin_write" on storage.objects;
drop policy if exists "vetements_bucket_admin_update" on storage.objects;
drop policy if exists "vetements_bucket_admin_delete" on storage.objects;

create policy "vetements_bucket_public_read"
on storage.objects for select
using (bucket_id = 'vetements');

create policy "vetements_bucket_admin_write"
on storage.objects for insert to authenticated
with check (bucket_id = 'vetements' and public.est_admin());

create policy "vetements_bucket_admin_update"
on storage.objects for update to authenticated
using (bucket_id = 'vetements' and public.est_admin())
with check (bucket_id = 'vetements' and public.est_admin());

create policy "vetements_bucket_admin_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'vetements' and public.est_admin());

-- Exemple pour passer ton compte en admin apres inscription:
-- update public.utilisateurs set role = 'admin' where email = 'ton-email@example.com';
