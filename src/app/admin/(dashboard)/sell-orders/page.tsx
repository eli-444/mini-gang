import Link from "next/link";

export default function AdminSellOrdersPage() {
  return (
    <section className="admin-card p-5">
      <h1 className="text-2xl font-bold text-slate-900">Module rachat retire</h1>
      <p className="mt-2 text-sm text-slate-600">
        La nouvelle base ne contient que les utilisateurs, vetements, photos, commandes et articles de commande.
      </p>
      <Link href="/admin/products" className="mt-4 inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white">
        Gerer les vetements
      </Link>
    </section>
  );
}
