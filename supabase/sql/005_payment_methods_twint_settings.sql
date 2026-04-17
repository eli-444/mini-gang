alter table public.commandes
add column if not exists payment_provider text,
add column if not exists provider_session_id text,
add column if not exists provider_payment_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'commandes_payment_provider_check'
      and conrelid = 'public.commandes'::regclass
  ) then
    alter table public.commandes
    add constraint commandes_payment_provider_check
    check (payment_provider in ('stripe', 'klarna', 'twint') or payment_provider is null);
  end if;
end $$;

update public.commandes
set payment_provider = coalesce(payment_provider, case when stripe_session_id is not null then 'stripe' else null end),
    provider_session_id = coalesce(provider_session_id, stripe_session_id),
    provider_payment_id = coalesce(provider_payment_id, stripe_payment_intent_id);

create unique index if not exists commandes_provider_session_id_unique
on public.commandes(provider_session_id)
where provider_session_id is not null;

create unique index if not exists commandes_provider_payment_id_unique
on public.commandes(provider_payment_id)
where provider_payment_id is not null;

create table if not exists public.admin_settings (
  id text primary key default 'main' check (id = 'main'),
  merchant_bank_holder text not null default '',
  merchant_bank_name text not null default '',
  merchant_iban text not null default '',
  merchant_iban_last4 text not null default '',
  card_payments_enabled boolean not null default true,
  twint_payments_enabled boolean not null default false,
  twint_merchant_id text not null default '',
  twint_api_base_url text not null default '',
  twint_api_key_reference text not null default '',
  updated_by uuid references public.utilisateurs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

alter table public.admin_settings
add column if not exists modifie_le timestamptz not null default now();

drop trigger if exists maj_admin_settings_updated_at on public.admin_settings;
create trigger maj_admin_settings_updated_at
before update on public.admin_settings
for each row
execute function public.mettre_a_jour_modifie_le();

alter table public.admin_settings enable row level security;

drop policy if exists "admin_settings_admin_select" on public.admin_settings;
drop policy if exists "admin_settings_admin_insert" on public.admin_settings;
drop policy if exists "admin_settings_admin_update" on public.admin_settings;

create policy "admin_settings_admin_select" on public.admin_settings
for select to authenticated using (public.est_admin());

create policy "admin_settings_admin_insert" on public.admin_settings
for insert to authenticated with check (public.est_admin());

create policy "admin_settings_admin_update" on public.admin_settings
for update to authenticated using (public.est_admin()) with check (public.est_admin());

insert into public.admin_settings (id)
values ('main')
on conflict (id) do nothing;
