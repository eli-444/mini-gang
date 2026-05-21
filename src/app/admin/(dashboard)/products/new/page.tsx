import { NewProductForm } from "@/components/admin/new-product-form";

export default function AdminNewProductPage() {
  return (
    <section className="admin-card p-6">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Stock</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">Ajouter une fiche vetement</h1>
      <p className="mt-1 text-sm text-slate-500">La fiche peut rester en brouillon, hors ligne ou passer en boutique.</p>
      <NewProductForm />
    </section>
  );
}
