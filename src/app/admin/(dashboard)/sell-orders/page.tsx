import Link from "next/link";

export default function AdminSellOrdersPage() {
  return (
    <section className="admin-card p-5">
      <h1 className="text-2xl font-bold text-slate-900">Module vendeur inactif</h1>
      <p className="mt-2 text-sm text-slate-600">
        Le schema Supabase actuellement verifie ne contient pas de tables <code>sell_orders</code> ni <code>payouts</code>.
      </p>
      <p className="mt-2 text-sm text-slate-600">
        Cette section reste visible pour conserver la structure admin, mais le flux vendeur n&apos;est pas branche sur la base active.
      </p>
      <Link href="/admin/products" className="mt-4 inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white">
        Gerer les vetements
      </Link>
    </section>
  );
}
