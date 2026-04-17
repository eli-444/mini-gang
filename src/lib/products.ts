import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { SHOP_CURRENCY } from "@/lib/shop-config";
import type { Product } from "@/lib/types";

interface ListProductsOptions {
  q?: string;
  categorie?: string;
  age_range?: string;
  genre?: string;
  brand?: string;
  condition?: string;
  size_label?: string;
  min_price?: number;
  max_price?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  cursor?: string;
  limit?: number;
}

type VetementRow = {
  id: string;
  nom: string;
  description: string | null;
  prix_centimes: number;
  marque: string | null;
  etat: Product["condition"];
  categorie: string;
  age?: string | null;
  taille: string;
  genre: Product["sex"];
  statut: Product["status"];
  reserved_until?: string | null;
  cree_le: string;
  photos_vetements?: Array<{
    id: string;
    url: string;
    position: number;
    principale: boolean;
  }>;
};

const vetementSelectWithAgeAndReservation =
  "id,nom,description,prix_centimes,marque,etat,categorie,age,taille,genre,statut,reserved_until,cree_le,photos_vetements(id,url,position,principale)";
const vetementSelectWithAge =
  "id,nom,description,prix_centimes,marque,etat,categorie,age,taille,genre,statut,cree_le,photos_vetements(id,url,position,principale)";
const vetementSelectWithoutAgeAndReservation =
  "id,nom,description,prix_centimes,marque,etat,categorie,taille,genre,statut,reserved_until,cree_le,photos_vetements(id,url,position,principale)";
const vetementSelectWithoutAge =
  "id,nom,description,prix_centimes,marque,etat,categorie,taille,genre,statut,cree_le,photos_vetements(id,url,position,principale)";

function isMissingAgeColumn(error: { message?: string } | null) {
  return Boolean(error?.message?.toLowerCase().includes("vetements.age"));
}

function isMissingReservedUntilColumn(error: { message?: string } | null) {
  return Boolean(error?.message?.toLowerCase().includes("reserved_until"));
}

function getVetementSelect(includeAge: boolean, includeReservation: boolean) {
  if (includeAge && includeReservation) return vetementSelectWithAgeAndReservation;
  if (includeAge) return vetementSelectWithAge;
  if (includeReservation) return vetementSelectWithoutAgeAndReservation;
  return vetementSelectWithoutAge;
}

function mapVetementToProduct(row: VetementRow): Product {
  const images = [...(row.photos_vetements ?? [])].sort((a, b) => {
    if (a.principale !== b.principale) return a.principale ? -1 : 1;
    return a.position - b.position;
  });

  return {
    id: row.id,
    title: row.nom,
    description: row.description,
    price_cents: row.prix_centimes,
    currency: SHOP_CURRENCY,
    brand: row.marque,
    condition: row.etat,
    age_range: row.age ?? null,
    size_label: row.taille,
    sex: row.genre,
    status: row.statut,
    reserved_until: row.reserved_until ?? null,
    created_at: row.cree_le,
    product_images: images.map((image) => ({
      id: image.id,
      product_id: row.id,
      path: image.url,
      url: image.url,
      sort_order: image.position,
      principale: image.principale,
    })),
  };
}

export async function listProducts(options: ListProductsOptions) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return {
      products: [] as Product[],
      hasMore: false,
      nextCursor: null,
      total: 0,
    };
  }

  const supabase = createSupabaseAdminClient();
  const limit = options.limit ?? 24;
  const sort = options.sort ?? "newest";

  const runQuery = async (includeAge: boolean, includeReservation: boolean) => {
    let query = supabase
      .from("vetements")
      .select(getVetementSelect(includeAge, includeReservation), {
        count: "exact",
      })
      .eq("statut", "disponible")
      .limit(limit + 1);

    if (options.q) query = query.ilike("nom", `%${options.q}%`);
    if (options.categorie) query = query.eq("categorie", options.categorie);
    if (includeAge && options.age_range) query = query.eq("age", options.age_range);
    if (options.genre) query = query.eq("genre", options.genre);
    if (options.brand) query = query.ilike("marque", `%${options.brand}%`);
    if (options.condition) query = query.eq("etat", options.condition);
    if (options.size_label) query = query.eq("taille", options.size_label);
    if (typeof options.min_price === "number") query = query.gte("prix_centimes", options.min_price);
    if (typeof options.max_price === "number") query = query.lte("prix_centimes", options.max_price);

    if (options.cursor) {
      if (sort === "newest") query = query.lt("cree_le", options.cursor);
      if (sort === "price_asc") query = query.gt("prix_centimes", Number(options.cursor));
      if (sort === "price_desc") query = query.lt("prix_centimes", Number(options.cursor));
    }

    if (sort === "newest") query = query.order("cree_le", { ascending: false });
    if (sort === "price_asc") query = query.order("prix_centimes", { ascending: true });
    if (sort === "price_desc") query = query.order("prix_centimes", { ascending: false });

    return query;
  };

  let data = null;
  let error = null;
  let count = null;
  for (const [includeAge, includeReservation] of [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ] as const) {
    const result = await runQuery(includeAge, includeReservation);
    data = result.data;
    error = result.error;
    count = result.count;
    if (!isMissingAgeColumn(error) && !isMissingReservedUntilColumn(error)) break;
  }
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as VetementRow[];
  const hasMore = rows.length > limit;
  const products = (hasMore ? rows.slice(0, limit) : rows).map(mapVetementToProduct);
  const last = products[products.length - 1];

  let nextCursor: string | null = null;
  if (last) {
    if (sort === "newest") nextCursor = last.created_at;
    if (sort === "price_asc" || sort === "price_desc") nextCursor = String(last.price_cents);
  }

  return {
    products,
    hasMore,
    nextCursor: hasMore ? nextCursor : null,
    total: count ?? 0,
  };
}

export async function getProductById(id: string) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const runQuery = (includeAge: boolean, includeReservation: boolean) =>
    supabase
      .from("vetements")
      .select(getVetementSelect(includeAge, includeReservation))
      .eq("id", id)
      .eq("statut", "disponible")
      .single();

  let data = null;
  let error = null;
  for (const [includeAge, includeReservation] of [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ] as const) {
    const result = await runQuery(includeAge, includeReservation);
    data = result.data;
    error = result.error;
    if (!isMissingAgeColumn(error) && !isMissingReservedUntilColumn(error)) break;
  }

  if (error) return null;
  return mapVetementToProduct(data as unknown as VetementRow);
}

export async function getProductsByIds(ids: string[]) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  let productRows: Array<{ id: string; nom: string; prix_centimes: number; statut: string; reserved_until?: string | null }> | null = null;
  let productError: { message?: string } | null = null;
  const result = await supabase
    .from("vetements")
    .select("id,nom,prix_centimes,statut,reserved_until")
    .in("id", ids)
    .eq("statut", "disponible");
  productRows = result.data;
  productError = result.error;

  if (isMissingReservedUntilColumn(productError)) {
    const fallback = await supabase
      .from("vetements")
      .select("id,nom,prix_centimes,statut")
      .in("id", ids)
      .eq("statut", "disponible");
    productRows = fallback.data;
    productError = fallback.error;
  }

  if (productError) throw new Error(productError.message);
  return (productRows ?? []).map((row) => ({
    id: row.id,
    title: row.nom,
    price_cents: row.prix_centimes,
    status: row.statut,
    reserved_until: row.reserved_until,
  }));
}
