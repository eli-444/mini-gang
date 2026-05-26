import Link from "next/link";
import { notFound } from "next/navigation";
import { EditProductForm } from "@/components/admin/edit-product-form";
import { getProductCategoryLabel } from "@/lib/product-categories";
import { getProductConditionLabel, getProductSeasonLabel, getProductStatusLabel } from "@/lib/product-options";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toChf } from "@/lib/utils";

type AdminProductRow = {
  id: string;
  nom: string;
  description: string | null;
  marque: string | null;
  etat: string;
  categorie: string;
  age?: string | null;
  taille: string;
  genre: string;
  statut: string;
  prix_centimes: number;
  prix_neuf_centimes?: number | null;
  couleur: string | null;
  matiere: string | null;
  saison?: string | null;
  emplacement_stock?: string | null;
  mis_en_avant: boolean;
  cree_le: string;
};

type SupabaseTableQuery = {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      maybeSingle: () => Promise<{ data: unknown; error: { message?: string } | null }>;
    };
  };
};

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const vetementsTable = supabase.from("vetements") as unknown as SupabaseTableQuery;

  const loadProduct = async (includeAge: boolean) =>
    vetementsTable
      .select(`id,nom,description,marque,etat,categorie,saison,${includeAge ? "age," : ""}taille,genre,statut,prix_centimes,prix_neuf_centimes,couleur,matiere,emplacement_stock,mis_en_avant,cree_le,photos_vetements(id,url,position,principale)`)
      .eq("id", id)
      .maybeSingle();
  const loadLegacyProduct = async (includeAge: boolean) =>
    vetementsTable
      .select(`id,nom,description,marque,etat,categorie,${includeAge ? "age," : ""}taille,genre,statut,prix_centimes,couleur,matiere,mis_en_avant,cree_le,photos_vetements(id,url,position,principale)`)
      .eq("id", id)
      .maybeSingle();

  const [productRes, { data: productEvents }, { data: orderItems }] = await Promise.all([
    loadProduct(true),
    Promise.resolve({ data: [] as Array<{ type: string }> }),
    supabase.from("articles_commande").select("id,commande_id").eq("vetement_id", id),
  ]);

  let { data: productData, error: productError } = productRes;
  if (productError?.message?.toLowerCase().includes("prix_neuf_centimes") || productError?.message?.toLowerCase().includes("saison") || productError?.message?.toLowerCase().includes("emplacement_stock")) {
    ({ data: productData, error: productError } = await loadLegacyProduct(true));
  }
  if (productError?.message?.toLowerCase().includes("vetements.age")) {
    ({ data: productData, error: productError } = await loadProduct(false));
    if (productError?.message?.toLowerCase().includes("prix_neuf_centimes") || productError?.message?.toLowerCase().includes("saison") || productError?.message?.toLowerCase().includes("emplacement_stock")) {
      ({ data: productData, error: productError } = await loadLegacyProduct(false));
    }
  }

  if (productError) throw new Error(productError.message);
  const product = productData as unknown as AdminProductRow | null;
  if (!product) notFound();

  const views = (productEvents ?? []).filter((event) => event.type === "product_view").length;
  const addToCart = (productEvents ?? []).filter((event) => event.type === "add_to_cart").length;
  const conversions = orderItems?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="admin-card overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/65 px-5 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Fiche stock</p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">{product.nom}</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              Modifie les informations client, la visibilité boutique, les photos et l&apos;emplacement physique.
            </p>
          </div>
          <Link href="/admin/products" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-black">
            Retour liste
          </Link>
        </div>
        <div className="grid gap-3 px-5 py-4 text-sm font-semibold text-slate-700 md:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs uppercase tracking-[0.1em] text-slate-500">Statut</span>
            <strong className="mt-1 block text-slate-950">{getProductStatusLabel(product.statut)}</strong>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs uppercase tracking-[0.1em] text-slate-500">Prix</span>
            <strong className="mt-1 block text-slate-950">{toChf(product.prix_centimes)}</strong>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs uppercase tracking-[0.1em] text-slate-500">Taille</span>
            <strong className="mt-1 block text-slate-950">{product.taille || product.age || "-"}</strong>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs uppercase tracking-[0.1em] text-slate-500">Emplacement</span>
            <strong className="mt-1 block text-slate-950">{product.emplacement_stock ?? "-"}</strong>
          </div>
        </div>
      </div>

      <EditProductForm product={{ ...product, age: product.age ?? null }} />

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="admin-card p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Résumé</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Infos produit</h2>
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div><dt className="text-slate-500">Marque</dt><dd>{product.marque ?? "-"}</dd></div>
            <div><dt className="text-slate-500">Etat</dt><dd>{getProductConditionLabel(product.etat)}</dd></div>
            <div><dt className="text-slate-500">Taille</dt><dd>{product.taille ?? "-"}</dd></div>
            <div><dt className="text-slate-500">Age</dt><dd>{product.age ?? "-"}</dd></div>
            <div><dt className="text-slate-500">Categorie</dt><dd>{getProductCategoryLabel(product.categorie)}</dd></div>
            <div><dt className="text-slate-500">Saison</dt><dd>{getProductSeasonLabel(product.saison)}</dd></div>
            <div><dt className="text-slate-500">Genre</dt><dd>{product.genre}</dd></div>
            <div><dt className="text-slate-500">Prix</dt><dd>{toChf(product.prix_centimes)}</dd></div>
            <div><dt className="text-slate-500">Prix neuf barre</dt><dd>{product.prix_neuf_centimes ? toChf(product.prix_neuf_centimes) : "-"}</dd></div>
            <div><dt className="text-slate-500">Emplacement</dt><dd>{product.emplacement_stock ?? "-"}</dd></div>
            <div>
              <dt className="text-slate-500">Statut</dt>
              <dd><span className={`admin-status ${product.statut}`}>{getProductStatusLabel(product.statut)}</span></dd>
            </div>
            <div><dt className="text-slate-500">Ajoute le</dt><dd>{new Date(product.cree_le).toLocaleDateString("fr-FR")}</dd></div>
          </dl>
          <p className="mt-4 text-sm text-slate-700">{product.description ?? "Sans description."}</p>
        </article>

        <article className="admin-card p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Lecture</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Performance</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p className="rounded-md bg-slate-50 p-2">Vues produit: <strong>{views}</strong></p>
            <p className="rounded-md bg-slate-50 p-2">Ajouts panier: <strong>{addToCart}</strong></p>
            <p className="rounded-md bg-slate-50 p-2">Conversions: <strong>{conversions}</strong></p>
          </div>
        </article>
      </section>
    </div>
  );
}
