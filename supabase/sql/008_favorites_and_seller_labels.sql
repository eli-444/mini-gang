-- Favoris client: liste de vetements sauvegardes par compte.

create table if not exists public.favoris_vetements (
  id uuid primary key default gen_random_uuid(),
  utilisateur_id uuid not null references public.utilisateurs(id) on delete cascade,
  vetement_id uuid not null references public.vetements(id) on delete cascade,
  cree_le timestamptz not null default now(),
  unique (utilisateur_id, vetement_id)
);

create index if not exists favoris_vetements_utilisateur_id_idx
on public.favoris_vetements(utilisateur_id);

create index if not exists favoris_vetements_vetement_id_idx
on public.favoris_vetements(vetement_id);

alter table public.favoris_vetements enable row level security;

drop policy if exists "favoris_client_voir_ses_favoris_ou_admin" on public.favoris_vetements;
create policy "favoris_client_voir_ses_favoris_ou_admin" on public.favoris_vetements
for select to authenticated using (utilisateur_id = auth.uid() or public.est_admin());

drop policy if exists "favoris_client_ajouter" on public.favoris_vetements;
create policy "favoris_client_ajouter" on public.favoris_vetements
for insert to authenticated with check (utilisateur_id = auth.uid());

drop policy if exists "favoris_client_supprimer" on public.favoris_vetements;
create policy "favoris_client_supprimer" on public.favoris_vetements
for delete to authenticated using (utilisateur_id = auth.uid() or public.est_admin());
