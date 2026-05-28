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
    <section className="bg-[var(--mg-surface)] px-5 py-6 text-[var(--mg-ink)] md:px-8 md:py-8">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-black leading-tight md:text-3xl">Profil</h2>
      </div>
      <div className="mt-8 max-w-4xl">
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
