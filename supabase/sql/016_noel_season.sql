-- Autorise la saison Noël dans les fiches vêtements.

alter table public.vetements
drop constraint if exists vetements_saison_check;

alter table public.vetements
add constraint vetements_saison_check
check (saison is null or saison in ('printemps_ete', 'automne_hiver', 'noel', 'toutes_saisons'));
