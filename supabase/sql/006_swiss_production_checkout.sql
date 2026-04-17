-- Production Suisse: CHF, reservations, livraisons et SAV.

alter table public.vetements
add column if not exists reserved_until timestamptz;

create index if not exists vetements_reserved_until_idx
on public.vetements(reserved_until)
where statut = 'reserve';

alter table public.commandes
add column if not exists sous_total_centimes integer not null default 0 check (sous_total_centimes >= 0),
add column if not exists frais_livraison_centimes integer not null default 0 check (frais_livraison_centimes >= 0),
add column if not exists accepted_terms_at timestamptz,
add column if not exists internal_notes text;

alter table public.commandes
alter column pays set default 'Suisse';

update public.commandes
set sous_total_centimes = total_centimes
where sous_total_centimes = 0 and total_centimes > 0;

alter table public.admin_settings
add column if not exists shipping_fee_cents integer not null default 790 check (shipping_fee_cents >= 0);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commandes(id) on delete cascade,
  carrier text not null,
  tracking_number text,
  tracking_url text,
  status text not null default 'preparation' check (status in ('preparation', 'expediee', 'livree', 'incident')),
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

drop trigger if exists maj_shipments_modifie_le on public.shipments;
create trigger maj_shipments_modifie_le
before update on public.shipments
for each row
execute function public.mettre_a_jour_modifie_le();

create index if not exists shipments_order_id_idx on public.shipments(order_id);
create index if not exists shipments_status_idx on public.shipments(status);

create table if not exists public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commandes(id) on delete cascade,
  user_id uuid not null references public.utilisateurs(id) on delete cascade,
  status text not null default 'demande' check (status in ('demande', 'accepte', 'refuse', 'rembourse', 'clos')),
  reason text not null,
  message text not null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

drop trigger if exists maj_returns_modifie_le on public.returns;
create trigger maj_returns_modifie_le
before update on public.returns
for each row
execute function public.mettre_a_jour_modifie_le();

create index if not exists returns_order_id_idx on public.returns(order_id);
create index if not exists returns_user_id_idx on public.returns(user_id);
create index if not exists returns_status_idx on public.returns(status);

alter table public.shipments enable row level security;
alter table public.returns enable row level security;

drop policy if exists "shipments_client_voir_ses_livraisons_ou_admin" on public.shipments;
create policy "shipments_client_voir_ses_livraisons_ou_admin" on public.shipments
for select to authenticated using (
  exists (
    select 1
    from public.commandes c
    where c.id = shipments.order_id
      and (c.utilisateur_id = auth.uid() or public.est_admin())
  )
);

drop policy if exists "shipments_admin_insert" on public.shipments;
create policy "shipments_admin_insert" on public.shipments
for insert to authenticated with check (public.est_admin());

drop policy if exists "shipments_admin_update" on public.shipments;
create policy "shipments_admin_update" on public.shipments
for update to authenticated using (public.est_admin()) with check (public.est_admin());

drop policy if exists "shipments_admin_delete" on public.shipments;
create policy "shipments_admin_delete" on public.shipments
for delete to authenticated using (public.est_admin());

drop policy if exists "returns_client_voir_ses_retours_ou_admin" on public.returns;
create policy "returns_client_voir_ses_retours_ou_admin" on public.returns
for select to authenticated using (user_id = auth.uid() or public.est_admin());

drop policy if exists "returns_client_insert" on public.returns;
create policy "returns_client_insert" on public.returns
for insert to authenticated with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.commandes c
    where c.id = returns.order_id
      and c.utilisateur_id = auth.uid()
  )
);

drop policy if exists "returns_admin_update" on public.returns;
create policy "returns_admin_update" on public.returns
for update to authenticated using (public.est_admin()) with check (public.est_admin());
