import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { productCategoryOptions } from "@/lib/product-categories";
import { SHOP_CURRENCY } from "@/lib/shop-config";
import type { Product } from "@/lib/types";

interface ListProductsOptions {
  q?: string;
  shop_section?: "vetements" | "merch" | "merche";
  categorie?: string;
  age_range?: string;
  genre?: string;
  brand?: string;
  condition?: string;
  saison?: string;
  size_label?: string;
  min_price?: number;
  max_price?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  featuredFirst?: boolean;
  cursor?: string;
  limit?: number;
}

type VetementRow = {
  id: string;
  nom: string;
  description: string | null;
  prix_centimes: number;
  prix_neuf_centimes?: number | null;
  marque: string | null;
  etat: Product["condition"];
  categorie: string;
  saison?: string | null;
  age?: string | null;
  taille: string;
  genre: Product["sex"];
  statut: Product["status"];
  quantite_stock?: number | null;
  emplacement_stock?: string | null;
  mis_en_avant?: boolean | null;
  reserved_until?: string | null;
  cree_le: string;
  photos_vetements?: Array<{
    id: string;
    url: string;
    position: number;
    principale: boolean;
  }>;
};

type SupabaseListResult = {
  data: unknown[] | null;
  error: { message?: string } | null;
  count: number | null;
};

type SupabaseSingleResult = {
  data: unknown | null;
  error: { message?: string } | null;
};

type ProductQueryBuilder = PromiseLike<SupabaseListResult> & {
  select: (columns: string, options?: { count?: "exact" }) => ProductQueryBuilder;
  eq: (column: string, value: unknown) => ProductQueryBuilder;
  in: (column: string, values: unknown[]) => ProductQueryBuilder;
  ilike: (column: string, pattern: string) => ProductQueryBuilder;
  or: (filters: string) => ProductQueryBuilder;
  gte: (column: string, value: unknown) => ProductQueryBuilder;
  lte: (column: string, value: unknown) => ProductQueryBuilder;
  lt: (column: string, value: unknown) => ProductQueryBuilder;
  gt: (column: string, value: unknown) => ProductQueryBuilder;
  limit: (count: number) => ProductQueryBuilder;
  order: (column: string, options: { ascending: boolean }) => ProductQueryBuilder;
};

type ProductSingleQueryBuilder = PromiseLike<SupabaseSingleResult> & {
  select: (columns: string) => ProductSingleQueryBuilder;
  eq: (column: string, value: unknown) => ProductSingleQueryBuilder;
  single: () => Promise<SupabaseSingleResult>;
};

type SupabaseVetementsTable = {
  select: ProductQueryBuilder["select"] & ProductSingleQueryBuilder["select"];
};

const vetementSelectWithAgeAndReservation =
  "id,nom,description,prix_centimes,prix_neuf_centimes,marque,etat,categorie,saison,age,taille,genre,statut,quantite_stock,emplacement_stock,mis_en_avant,reserved_until,cree_le,photos_vetements(id,url,position,principale)";
const vetementSelectWithAge =
  "id,nom,description,prix_centimes,prix_neuf_centimes,marque,etat,categorie,saison,age,taille,genre,statut,quantite_stock,emplacement_stock,mis_en_avant,cree_le,photos_vetements(id,url,position,principale)";
const vetementSelectWithoutAgeAndReservation =
  "id,nom,description,prix_centimes,prix_neuf_centimes,marque,etat,categorie,saison,taille,genre,statut,quantite_stock,emplacement_stock,mis_en_avant,reserved_until,cree_le,photos_vetements(id,url,position,principale)";
const vetementSelectWithoutAge =
  "id,nom,description,prix_centimes,prix_neuf_centimes,marque,etat,categorie,saison,taille,genre,statut,quantite_stock,emplacement_stock,mis_en_avant,cree_le,photos_vetements(id,url,position,principale)";
const vetementSelectLegacyWithAgeAndReservation =
  "id,nom,description,prix_centimes,marque,etat,categorie,age,taille,genre,statut,reserved_until,cree_le,photos_vetements(id,url,position,principale)";
const vetementSelectLegacyWithAge =
  "id,nom,description,prix_centimes,marque,etat,categorie,age,taille,genre,statut,cree_le,photos_vetements(id,url,position,principale)";
const vetementSelectLegacyWithoutAgeAndReservation =
  "id,nom,description,prix_centimes,marque,etat,categorie,taille,genre,statut,reserved_until,cree_le,photos_vetements(id,url,position,principale)";
const vetementSelectLegacyWithoutAge =
  "id,nom,description,prix_centimes,marque,etat,categorie,taille,genre,statut,cree_le,photos_vetements(id,url,position,principale)";

function isMissingAgeColumn(error: { message?: string } | null) {
  return Boolean(error?.message?.toLowerCase().includes("vetements.age"));
}

function isMissingReservedUntilColumn(error: { message?: string } | null) {
  return Boolean(error?.message?.toLowerCase().includes("reserved_until"));
}

function isMissingProductExpansionColumn(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return ["prix_neuf_centimes", "saison", "emplacement_stock", "quantite_stock", "reference_vetement", "mis_en_avant"].some((column) =>
    message.includes(column),
  );
}

function getVetementSelect(includeAge: boolean, includeReservation: boolean, includeExpansion = true) {
  if (!includeExpansion) {
    if (includeAge && includeReservation) return vetementSelectLegacyWithAgeAndReservation;
    if (includeAge) return vetementSelectLegacyWithAge;
    if (includeReservation) return vetementSelectLegacyWithoutAgeAndReservation;
    return vetementSelectLegacyWithoutAge;
  }
  if (includeAge && includeReservation) return vetementSelectWithAgeAndReservation;
  if (includeAge) return vetementSelectWithAge;
  if (includeReservation) return vetementSelectWithoutAgeAndReservation;
  return vetementSelectWithoutAge;
}

function cleanSearchTerm(value: string) {
  return value.trim().replace(/[%*,(){}\[\]"'\\]/g, " ").replace(/\s+/g, " ").slice(0, 80);
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildProductSearchFilter(rawSearch: string, includeAge: boolean) {
  const search = cleanSearchTerm(rawSearch);
  if (!search) return null;

  const normalizedSearch = normalizeSearchText(search);
  const categoryMatches = productCategoryOptions
    .filter((category) => {
      const normalizedLabel = normalizeSearchText(category.label);
      const normalizedValue = normalizeSearchText(category.value);
      return normalizedLabel.includes(normalizedSearch) || normalizedValue.includes(normalizedSearch);
    })
    .map((category) => category.value);

  const parts = [
    `nom.ilike.%${search}%`,
    `marque.ilike.%${search}%`,
    `description.ilike.%${search}%`,
    `taille.ilike.%${search}%`,
  ];

  if (includeAge) parts.push(`age.ilike.%${search}%`);
  if (categoryMatches.length > 0) parts.push(`categorie.in.(${categoryMatches.join(",")})`);

  return parts.join(",");
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
    compare_at_price_cents: row.prix_neuf_centimes ?? null,
    currency: SHOP_CURRENCY,
    brand: row.marque,
    condition: row.etat,
    category: row.categorie,
    season: row.saison ?? null,
    age_range: row.age ?? null,
    size_label: row.taille,
    sex: row.genre,
    status: row.statut,
    stock_quantity: row.quantite_stock ?? null,
    stock_location: row.emplacement_stock ?? null,
    featured: Boolean(row.mis_en_avant),
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
  const vetementsTable = supabase.from("vetements") as unknown as SupabaseVetementsTable;
  const limit = options.limit ?? 24;
  const sort = options.sort ?? "newest";

  const runQuery = async (includeAge: boolean, includeReservation: boolean, includeExpansion: boolean) => {
    let query = vetementsTable
      .select(getVetementSelect(includeAge, includeReservation, includeExpansion), {
        count: "exact",
      })
      .eq("statut", "disponible")
      .limit(limit + 1);

    if (options.q) {
      const searchFilter = buildProductSearchFilter(options.q, includeAge);
      if (searchFilter) query = query.or(searchFilter);
    }
    if (options.shop_section === "vetements") {
      query = query.in("categorie", [...productCategoryOptions.map((category) => category.value), "haut", "bas", "robe", "veste", "manteau"]);
    }
    if (options.shop_section === "merch" || options.shop_section === "merche") {
      query = query.in("categorie", ["accessoire", "autre"]);
    }
    if (options.categorie) query = query.eq("categorie", options.categorie);
    if (includeAge && options.age_range) query = query.eq("age", options.age_range);
    if (options.genre) query = query.eq("genre", options.genre);
    if (options.brand) query = query.ilike("marque", `%${options.brand}%`);
    if (options.condition) query = query.eq("etat", options.condition);
    if (includeExpansion && options.saison) query = query.eq("saison", options.saison);
    if (options.size_label) query = query.eq("taille", options.size_label);
    if (typeof options.min_price === "number") query = query.gte("prix_centimes", options.min_price);
    if (typeof options.max_price === "number") query = query.lte("prix_centimes", options.max_price);

    if (options.cursor) {
      if (sort === "newest") query = query.lt("cree_le", options.cursor);
      if (sort === "price_asc") query = query.gt("prix_centimes", Number(options.cursor));
      if (sort === "price_desc") query = query.lt("prix_centimes", Number(options.cursor));
    }

    if (options.featuredFirst && includeExpansion) query = query.order("mis_en_avant", { ascending: false });
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
    const result = await runQuery(includeAge, includeReservation, true);
    data = result.data;
    error = result.error;
    count = result.count;
    if (isMissingProductExpansionColumn(error)) {
      const fallback = await runQuery(includeAge, includeReservation, false);
      data = fallback.data;
      error = fallback.error;
      count = fallback.count;
    }
    if (!isMissingAgeColumn(error) && !isMissingReservedUntilColumn(error)) break;
  }
  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as unknown as VetementRow[]).filter(
    (row) => typeof row.quantite_stock !== "number" || row.quantite_stock > 0,
  );
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
  const vetementsTable = supabase.from("vetements") as unknown as { select: ProductSingleQueryBuilder["select"] };

  const runQuery = (includeAge: boolean, includeReservation: boolean, includeExpansion: boolean) =>
    vetementsTable
      .select(getVetementSelect(includeAge, includeReservation, includeExpansion))
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
    const result = await runQuery(includeAge, includeReservation, true);
    data = result.data;
    error = result.error;
    if (isMissingProductExpansionColumn(error)) {
      const fallback = await runQuery(includeAge, includeReservation, false);
      data = fallback.data;
      error = fallback.error;
    }
    if (!isMissingAgeColumn(error) && !isMissingReservedUntilColumn(error)) break;
  }

  if (error) return null;
  const row = data as unknown as VetementRow;
  if (typeof row.quantite_stock === "number" && row.quantite_stock <= 0) return null;
  return mapVetementToProduct(row);
}

export async function getVisibleProductsByIds(ids: string[]) {
  const uniqueIds = [...new Set(ids)].filter(Boolean);
  if (uniqueIds.length === 0 || !env.supabaseUrl || !env.supabaseAnonKey) {
    return [] as Product[];
  }

  const supabase = createSupabaseAdminClient();
  const vetementsTable = supabase.from("vetements") as unknown as SupabaseVetementsTable;

  const runQuery = (includeAge: boolean, includeReservation: boolean, includeExpansion: boolean) =>
    vetementsTable
      .select(getVetementSelect(includeAge, includeReservation, includeExpansion))
      .in("id", uniqueIds)
      .eq("statut", "disponible");

  let data = null;
  let error = null;
  for (const [includeAge, includeReservation] of [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ] as const) {
    const result = await runQuery(includeAge, includeReservation, true);
    data = result.data;
    error = result.error;
    if (isMissingProductExpansionColumn(error)) {
      const fallback = await runQuery(includeAge, includeReservation, false);
      data = fallback.data;
      error = fallback.error;
    }
    if (!isMissingAgeColumn(error) && !isMissingReservedUntilColumn(error)) break;
  }

  if (error) throw new Error(error.message);
  const products = ((data ?? []) as unknown as VetementRow[])
    .filter((row) => typeof row.quantite_stock !== "number" || row.quantite_stock > 0)
    .map(mapVetementToProduct);
  const order = new Map(uniqueIds.map((id, index) => [id, index]));
  return products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export interface CartProductAvailability {
  id: string;
  title: string;
  price_cents: number;
  brand?: string | null;
  size_label?: string | null;
  age_range?: string | null;
  image_url?: string | null;
  status: Product["status"] | "introuvable";
  available: boolean;
  reserved_until?: string | null;
}

type CartVetementRow = {
  id: string;
  nom: string;
  prix_centimes: number;
  marque?: string | null;
  taille?: string | null;
  age?: string | null;
  statut: Product["status"];
  quantite_stock?: number | null;
  reserved_until?: string | null;
  photos_vetements?: Array<{
    id: string;
    url: string;
    position: number;
    principale: boolean;
  }>;
};

function getPrimaryCartImage(row: CartVetementRow) {
  const images = [...(row.photos_vetements ?? [])].sort((a, b) => {
    if (a.principale !== b.principale) return a.principale ? -1 : 1;
    return a.position - b.position;
  });

  return images[0]?.url ?? null;
}

export async function getCartProductsByIds(ids: string[]) {
  const uniqueIds = [...new Set(ids)].filter(Boolean);
  if (uniqueIds.length === 0 || !env.supabaseUrl || !env.supabaseAnonKey) {
    return [] as CartProductAvailability[];
  }

  const supabase = createSupabaseAdminClient();
  let rows: CartVetementRow[] | null = null;
  let error: { message?: string } | null = null;

  const getCartSelect = (includeAge: boolean, includeReservation: boolean, includeStock = true) =>
    [
      "id",
      "nom",
      "prix_centimes",
      "marque",
      "taille",
      includeAge ? "age" : null,
      "statut",
      includeStock ? "quantite_stock" : null,
      includeReservation ? "reserved_until" : null,
      "photos_vetements(id,url,position,principale)",
    ]
      .filter(Boolean)
      .join(",");

  for (const [includeAge, includeReservation] of [
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ] as const) {
    let result = await supabase.from("vetements").select(getCartSelect(includeAge, includeReservation)).in("id", uniqueIds);
    if (isMissingProductExpansionColumn(result.error)) {
      result = await supabase.from("vetements").select(getCartSelect(includeAge, includeReservation, false)).in("id", uniqueIds);
    }
    rows = result.data as CartVetementRow[] | null;
    error = result.error;
    if (!isMissingAgeColumn(error) && !isMissingReservedUntilColumn(error)) break;
  }

  if (error) throw new Error(error.message);

  const byId = new Map((rows ?? []).map((row) => [row.id, row]));
  return uniqueIds.map((id) => {
    const row = byId.get(id);
    if (!row) {
      return {
        id,
        title: "Article indisponible",
        price_cents: 0,
        brand: null,
        size_label: null,
        age_range: null,
        image_url: null,
        status: "introuvable" as const,
        available: false,
        reserved_until: null,
      };
    }

    return {
      id: row.id,
      title: row.nom,
      price_cents: row.prix_centimes,
      brand: row.marque ?? null,
      size_label: row.taille ?? null,
      age_range: row.age ?? null,
      image_url: getPrimaryCartImage(row),
      status: row.statut,
      available: row.statut === "disponible" && (typeof row.quantite_stock !== "number" || row.quantite_stock > 0),
      reserved_until: row.reserved_until ?? null,
    };
  });
}

export async function getProductsByIds(ids: string[]) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  let productRows: Array<{
    id: string;
    nom: string;
    prix_centimes: number;
    statut: string;
    categorie?: string | null;
    reference_vetement?: string | null;
    emplacement_stock?: string | null;
    quantite_stock?: number | null;
    reserved_until?: string | null;
  }> | null = null;
  let productError: { message?: string } | null = null;
  const result = await supabase
    .from("vetements")
    .select("id,nom,prix_centimes,statut,categorie,reference_vetement,emplacement_stock,quantite_stock,reserved_until")
    .in("id", ids)
    .eq("statut", "disponible");
  productRows = result.data;
  productError = result.error;

  if (isMissingReservedUntilColumn(productError) || isMissingProductExpansionColumn(productError)) {
    const fallback = await supabase
      .from("vetements")
      .select("id,nom,prix_centimes,statut")
      .in("id", ids)
      .eq("statut", "disponible");
    productRows = fallback.data;
    productError = fallback.error;
  }

  if (productError) throw new Error(productError.message);
  return (productRows ?? [])
    .filter((row) => typeof row.quantite_stock !== "number" || row.quantite_stock > 0)
    .map((row) => ({
      id: row.id,
      title: row.nom,
      price_cents: row.prix_centimes,
      status: row.statut,
      category: row.categorie ?? null,
      reference_code: row.reference_vetement ?? null,
      stock_location: row.emplacement_stock ?? null,
      stock_quantity: row.quantite_stock ?? null,
      reserved_until: row.reserved_until,
    }));
}
