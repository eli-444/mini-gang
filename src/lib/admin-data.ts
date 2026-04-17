import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SHOP_CURRENCY } from "@/lib/shop-config";

function toIsoDaysAgo(days: number) {
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return from.toISOString();
}

type AdminProductRow = {
  id: string;
  nom: string;
  marque: string | null;
  taille: string;
  categorie: string;
  age?: string | null;
  etat: string;
  prix_centimes: number;
  statut: string;
  cree_le: string;
  photos_vetements?: Array<{ url: string }>;
};

type AdminOrderRow = {
  id: string;
  email: string;
  statut: string;
  total_centimes: number;
  cree_le: string;
  stripe_session_id?: string | null;
  payment_provider?: string | null;
  provider_session_id?: string | null;
  shipments?: Array<{ id: string; status: string; tracking_number?: string | null }>;
};

export async function getDashboardMetrics(periodDays = 30) {
  const supabase = createSupabaseAdminClient();
  const fromIso = toIsoDaysAgo(periodDays);

  const [ordersRes, productsRes, usersRes] = await Promise.all([
    supabase
      .from("commandes")
      .select("id,statut,total_centimes,cree_le")
      .gte("cree_le", fromIso),
    supabase.from("vetements").select("id,statut,cree_le"),
    supabase.from("utilisateurs").select("id,role,cree_le"),
  ]);

  const orders = ordersRes.data ?? [];
  const products = productsRes.data ?? [];
  const users = usersRes.data ?? [];

  const paidOrders = orders.filter((order) => ["payee", "preparee", "envoyee", "livree"].includes(order.statut));
  const revenue = paidOrders.reduce((sum, order) => sum + order.total_centimes, 0);

  const pendingOrders = orders.filter((order) => order.statut === "en_attente").length;
  const paidToPrepare = orders.filter((order) => order.statut === "payee").length;

  const activeProducts = products.filter((product) => product.statut === "disponible").length;
  const soldProducts = products.filter((product) => product.statut === "vendu").length;
  const reservedProducts = products.filter((product) => product.statut === "reserve").length;
  const draftProducts = products.filter((product) => product.statut === "brouillon").length;
  const archivedProducts = products.filter((product) => product.statut === "archive").length;

  return {
    cards: {
      users: users.filter((user) => user.role === "client").length,
      admins: users.filter((user) => user.role === "admin").length,
      revenueCents: revenue,
      aovCents: paidOrders.length > 0 ? Math.round(revenue / paidOrders.length) : 0,
      ordersPaid: paidOrders.length,
      ordersPending: pendingOrders,
      failedPayments: orders.filter((order) => order.statut === "annulee").length,
    },
    stock: {
      active: activeProducts,
      reserved: reservedProducts,
      sold: soldProducts,
      draft: draftProducts,
      archived: archivedProducts,
    },
    alerts: {
      paidToPrepare,
      reservedProducts,
      draftProducts,
    },
    ordersByStatus: {
      en_attente: orders.filter((order) => order.statut === "en_attente").length,
      payee: orders.filter((order) => order.statut === "payee").length,
      preparee: orders.filter((order) => order.statut === "preparee").length,
      envoyee: orders.filter((order) => order.statut === "envoyee").length,
      livree: orders.filter((order) => order.statut === "livree").length,
      annulee: orders.filter((order) => order.statut === "annulee").length,
      remboursee: orders.filter((order) => order.statut === "remboursee").length,
    },
  };
}

export async function listAdminProducts(input: {
  page: number;
  pageSize: number;
  query?: string;
  status?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const from = (input.page - 1) * input.pageSize;
  const to = from + input.pageSize - 1;

  const runQuery = async (includeAge: boolean) => {
    let query = supabase
      .from("vetements")
      .select(`id,nom,marque,taille,categorie,${includeAge ? "age," : ""}etat,prix_centimes,statut,cree_le,photos_vetements(url)`, {
        count: "exact",
      })
      .order("cree_le", { ascending: false })
      .range(from, to);

    if (input.query) query = query.or(`nom.ilike.%${input.query}%,marque.ilike.%${input.query}%`);
    if (input.status) query = query.eq("statut", input.status);
    return query;
  };

  let { data, count, error } = await runQuery(true);
  if (error?.message?.toLowerCase().includes("vetements.age")) {
    ({ data, count, error } = await runQuery(false));
  }
  if (error) throw new Error(error.message);

  const products = (data ?? []) as unknown as AdminProductRow[];

  return {
    rows: products.map((product) => ({
      id: product.id,
      title: product.nom,
      brand: product.marque,
      size_label: product.taille,
      age_range: product.age,
      categorie: product.categorie,
      condition: product.etat,
      price_cents: product.prix_centimes,
      currency: SHOP_CURRENCY,
      status: product.statut,
      created_at: product.cree_le,
      product_images: product.photos_vetements,
    })),
    total: count ?? 0,
    page: input.page,
    pageSize: input.pageSize,
  };
}

export async function listAdminOrders(page = 1, pageSize = 20) {
  const supabase = createSupabaseAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const runQuery = (includeProviderColumns: boolean) =>
    supabase
      .from("commandes")
      .select(
        (includeProviderColumns
          ? "id,email,statut,total_centimes,cree_le,stripe_session_id,payment_provider,provider_session_id,shipments(id,status,tracking_number)"
          : "id,email,statut,total_centimes,cree_le,stripe_session_id") as string,
        { count: "exact" },
      )
      .order("cree_le", { ascending: false })
      .range(from, to);

  let { data, count, error } = await runQuery(true);
  if (error?.message?.toLowerCase().includes("payment_provider") || error?.message?.toLowerCase().includes("shipments")) {
    ({ data, count, error } = await runQuery(false));
  }

  if (error) throw new Error(error.message);
  const orders = (data ?? []) as unknown as AdminOrderRow[];

  return {
    rows: orders.map((order) => ({
      id: order.id,
      email: order.email,
      status: order.statut,
      provider: order.payment_provider ?? (order.stripe_session_id ? "stripe" : "-"),
      amount_total_cents: order.total_centimes,
      created_at: order.cree_le,
      shipments: order.shipments ?? [],
    })),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function listShipments() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("id,order_id,carrier,tracking_number,tracking_url,status,shipped_at,delivered_at,created_at")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function listReturns() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("returns")
    .select("id,order_id,status,reason,message,admin_notes,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function listCustomers() {
  const supabase = createSupabaseAdminClient();
  const [{ data: users }, { data: orders }] = await Promise.all([
    supabase.from("utilisateurs").select("id,email,prenom,nom,telephone,role,cree_le").order("cree_le", { ascending: false }),
    supabase.from("commandes").select("utilisateur_id,email,total_centimes,statut,cree_le").order("cree_le", { ascending: false }),
  ]);

  const map = new Map<
    string,
    {
      id: string | null;
      email: string;
      prenom: string | null;
      nom: string | null;
      telephone: string | null;
      role: string;
      orders: number;
      paidOrders: number;
      totalCents: number;
    }
  >();

  for (const user of users ?? []) {
    map.set(user.id, {
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      telephone: user.telephone,
      role: user.role,
      orders: 0,
      paidOrders: 0,
      totalCents: 0,
    });
  }

  for (const order of orders ?? []) {
    const key = order.utilisateur_id ?? order.email;
    if (!map.has(key)) {
      map.set(key, {
        id: order.utilisateur_id,
        email: order.email,
        prenom: null,
        nom: null,
        telephone: null,
        role: "client",
        orders: 0,
        paidOrders: 0,
        totalCents: 0,
      });
    }
    const row = map.get(key)!;
    row.orders += 1;
    if (["payee", "preparee", "envoyee", "livree"].includes(order.statut)) {
      row.paidOrders += 1;
      row.totalCents += order.total_centimes;
    }
  }

  return [...map.values()].sort((a, b) => b.totalCents - a.totalCents);
}

export async function listProcurements() {
  return [] as Array<{
    id: string;
    total_cost_cents: number;
    created_at: string;
    notes?: string | null;
    sellers?: { name?: string | null; email?: string | null } | null;
    procurement_items?: Array<{ id: string; buy_cost_cents?: number | null }>;
  }>;
}
