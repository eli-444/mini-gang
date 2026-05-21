import Link from "next/link";
import { SellOrderWizard } from "@/components/sell/sell-order-wizard";
import { getSiteContentSettings } from "@/lib/site-content-settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function VendreCommencerPage() {
  const settings = await getSiteContentSettings();
  if (!settings.sell_service_enabled) {
    return (
      <section className="mg-shell rounded-[18px] bg-white p-5">
        <h1 className="font-display text-3xl text-[var(--mg-ink)]">Rachat ferme</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--mg-ink)]/70">
          {settings.sell_closed_message || "Le service de rachat est temporairement ferme. Nous rouvrirons prochainement les demandes d'envoi de vetements."}
        </p>
        <Link href="/vendre" className="mt-4 inline-flex rounded-full border border-[var(--mg-ring)] px-4 py-2 text-sm font-semibold">
          Voir les conditions
        </Link>
      </section>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SellOrderWizard defaultEmail={user?.email} />;
}
