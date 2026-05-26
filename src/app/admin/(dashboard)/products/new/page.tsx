import { NewProductForm } from "@/components/admin/new-product-form";

export default function AdminNewProductPage() {
  return (
    <section>
      <div className="admin-card overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-white/65 px-5 py-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Nouvelle pièce</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">Ajouter un vêtement</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Remplis la fiche dans l&apos;ordre naturel: identité, prix, filtres boutique, stock, photos puis publication.
            Tu peux enregistrer en brouillon pour gérer le stock sans afficher l&apos;article en ligne.
          </p>
        </div>
        <div className="grid gap-3 px-5 py-4 text-sm font-semibold text-slate-700 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs uppercase tracking-[0.1em] text-slate-500">Conseil photo</span>
            <strong className="mt-1 block text-slate-950">Recto puis verso</strong>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs uppercase tracking-[0.1em] text-slate-500">Visibilité</span>
            <strong className="mt-1 block text-slate-950">Brouillon par défaut</strong>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block text-xs uppercase tracking-[0.1em] text-slate-500">Stock local</span>
            <strong className="mt-1 block text-slate-950">Emplacement recommandé</strong>
          </div>
        </div>
      </div>
      <NewProductForm />
    </section>
  );
}
