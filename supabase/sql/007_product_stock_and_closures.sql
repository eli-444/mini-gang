-- Produits: stock interne, saison, prix neuf barre et nouveaux etats/statuts.

alter table public.vetements
drop constraint if exists vetements_etat_check;

alter table public.vetements
add constraint vetements_etat_check
check (etat in (
  'beaucoup_aime',
  'bon',
  'tres_bon',
  'comme_neuf',
  'neuf_etiquettes',
  'neuf',
  'correct'
));

alter table public.vetements
drop constraint if exists vetements_statut_check;

alter table public.vetements
add constraint vetements_statut_check
check (statut in ('brouillon', 'disponible', 'hors_ligne', 'reserve', 'vendu', 'archive'));

alter table public.vetements
drop constraint if exists vetements_categorie_check;

alter table public.vetements
add constraint vetements_categorie_check
check (categorie in (
  'bodies',
  'debardeurs',
  'tee_shirts',
  'polos',
  'blouses',
  'chemises',
  'pulls',
  'polaires',
  'gilets',
  'sweat_shirts',
  'robes',
  'pantalons',
  'shorts',
  'jupes',
  'salopettes',
  'combinaisons',
  'ensembles',
  'manteaux',
  'vestes',
  'doudounes',
  'ski',
  'pyjamas',
  'maillots_de_bain',
  'haut',
  'bas',
  'robe',
  'veste',
  'manteau',
  'chaussures',
  'accessoire',
  'autre'
));

alter table public.vetements
add column if not exists prix_neuf_centimes integer check (prix_neuf_centimes is null or prix_neuf_centimes >= 0),
add column if not exists saison text check (saison is null or saison in ('printemps', 'ete', 'automne', 'hiver', 'toutes_saisons')),
add column if not exists emplacement_stock text;

create index if not exists vetements_saison_idx on public.vetements(saison);
create index if not exists vetements_emplacement_stock_idx on public.vetements(emplacement_stock);

update public.vetements
set etat = 'beaucoup_aime'
where etat = 'correct';

update public.vetements
set etat = 'neuf_etiquettes'
where etat = 'neuf';
