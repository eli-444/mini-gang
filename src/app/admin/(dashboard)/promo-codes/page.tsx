import { PromoCodeActions } from "@/components/admin/promo-code-actions";
import { PromoCodeForm } from "@/components/admin/promo-code-form";
import { listPromoCodes } from "@/lib/admin-data";

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR");
}

export default async function AdminPromoCodesPage() {
  const data = await listPromoCodes();

  return (
    <div className="space-y-5">
      <div className="admin-card p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Boutique</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Codes promo</h1>
      </div>

      <section className="admin-card p-5">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Nouveau code</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">Remise en pourcentage</h2>
        </div>
        <PromoCodeForm />
      </section>

      <section className="admin-table-wrap">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Liste</p>
            <h2 className="text-lg font-bold text-slate-950">Codes existants</h2>
          </div>
        </div>

        {data.error ? (
          <p className="p-4 text-sm font-semibold text-red-700">
            Migration Supabase a appliquer: <span className="font-mono">011_promo_codes.sql</span>
          </p>
        ) : null}

        {!data.error ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Remise</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Usage</th>
                  <th className="px-3 py-2">Utilisations</th>
                  <th className="px-3 py-2">Expiration</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((promo) => (
                  <tr key={promo.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-black text-slate-950">{promo.code}</td>
                    <td className="px-3 py-2">{promo.percentage}%</td>
                    <td className="px-3 py-2">
                      <span className={`admin-status ${promo.active ? "disponible" : "hors_ligne"}`}>
                        {promo.active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{promo.unique_usage ? "Unique" : "Multiple"}</td>
                    <td className="px-3 py-2">{promo.usage_count}</td>
                    <td className="px-3 py-2">{formatDate(promo.expires_at)}</td>
                    <td className="px-3 py-2">
                      <PromoCodeActions promoId={promo.id} promoCode={promo.code} active={promo.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Aucun code promo.</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
