import { requireUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProfileForm } from "@/components/account/profile-form";

export default async function MonCompteProfilPage() {
  const { user } = await requireUser("/auth/login");
  const supabase = createSupabaseAdminClient();

  const { data: profile } = await supabase
    .from("utilisateurs")
    .select("email,prenom,nom,telephone,cree_le")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="mg-shell rounded-[18px] bg-white p-5">
      <h2 className="text-lg font-semibold text-[var(--mg-ink)]">Profil client</h2>
      <p className="mt-1 text-sm text-[var(--mg-ink)]/70">
        Modifiez vos informations personnelles. L&apos;email reste verrouille pour proteger le compte.
      </p>
      <div className="mt-5">
        <ProfileForm
          profile={{
            email: profile?.email ?? user.email ?? "",
            prenom: profile?.prenom ?? "",
            nom: profile?.nom ?? "",
            telephone: profile?.telephone ?? "",
            createdAt: profile?.cree_le ? new Date(profile.cree_le).toLocaleDateString("fr-FR") : null,
          }}
        />
      </div>
    </section>
  );
}
