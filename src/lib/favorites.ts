import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getVisibleProductsByIds } from "@/lib/products";

type FavoriteUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function isMissingFavoritesTable(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("favoris_vetements") || message.includes("could not find the table");
}

export async function ensureFavoriteUserProfile(user: FavoriteUser) {
  const email = user.email?.trim().toLowerCase();
  if (!email) return;

  const metadata = user.user_metadata ?? {};
  const profile: {
    id: string;
    email: string;
    prenom?: string;
    nom?: string;
    telephone?: string;
  } = {
    id: user.id,
    email,
  };

  if (typeof metadata.prenom === "string") profile.prenom = metadata.prenom;
  if (typeof metadata.nom === "string") profile.nom = metadata.nom;
  if (typeof metadata.telephone === "string") profile.telephone = metadata.telephone;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("utilisateurs").upsert(profile, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function listFavoriteProductIds(userId: string, productIds?: string[]) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("favoris_vetements")
    .select("vetement_id")
    .eq("utilisateur_id", userId);

  if (productIds && productIds.length > 0) {
    query = query.in("vetement_id", [...new Set(productIds)]);
  }

  const { data, error } = await query;
  if (isMissingFavoritesTable(error)) return [] as string[];
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => row.vetement_id as string);
}

export async function listFavoriteProducts(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("favoris_vetements")
    .select("vetement_id,cree_le")
    .eq("utilisateur_id", userId)
    .order("cree_le", { ascending: false });

  if (isMissingFavoritesTable(error)) return [];
  if (error) throw new Error(error.message);

  const ids = (data ?? []).map((row) => row.vetement_id as string);
  return getVisibleProductsByIds(ids);
}

export async function isFavoriteProduct(userId: string, productId: string) {
  const ids = await listFavoriteProductIds(userId, [productId]);
  return ids.includes(productId);
}

export async function addFavoriteProduct(userId: string, productId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("favoris_vetements")
    .upsert(
      {
        utilisateur_id: userId,
        vetement_id: productId,
      },
      { onConflict: "utilisateur_id,vetement_id" },
    );

  if (isMissingFavoritesTable(error)) {
    throw new Error("La table des favoris n'est pas encore creee. Appliquez la migration supabase/sql/008_favorites_and_seller_labels.sql.");
  }
  if (error) throw new Error(error.message);
}

export async function removeFavoriteProduct(userId: string, productId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("favoris_vetements")
    .delete()
    .eq("utilisateur_id", userId)
    .eq("vetement_id", productId);

  if (error) throw new Error(error.message);
}
