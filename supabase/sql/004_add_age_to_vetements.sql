alter table public.vetements
add column if not exists age text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'vetements_age_check'
      and conrelid = 'public.vetements'::regclass
  ) then
    alter table public.vetements
    add constraint vetements_age_check
    check (age in ('3 mois', '6 mois', '9 mois', '12 mois', '2 ans', '3 ans', '4 ans', '5 ans', '6 ans', '7 ans', '8 ans', '9 ans', '10 ans', '11 ans', '12 ans'));
  end if;
end $$;

create index if not exists vetements_age_idx on public.vetements(age);
