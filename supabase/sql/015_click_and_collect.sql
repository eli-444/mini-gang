-- Mode de remise choisi par le client pour chaque commande.

alter table public.commandes
add column if not exists mode_livraison text not null default 'livraison';

alter table public.commandes
drop constraint if exists commandes_mode_livraison_check;

alter table public.commandes
add constraint commandes_mode_livraison_check
check (mode_livraison in ('livraison', 'click_collect'));

create index if not exists commandes_mode_livraison_idx
on public.commandes(mode_livraison);
