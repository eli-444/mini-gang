import type { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

const publicPages = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/boutique", priority: 0.9, changeFrequency: "daily" },
  { path: "/merch", priority: 0.8, changeFrequency: "weekly" },
  { path: "/vendre", priority: 0.7, changeFrequency: "monthly" },
  { path: "/a-propos", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/retours", priority: 0.4, changeFrequency: "yearly" },
  { path: "/cgv", priority: 0.3, changeFrequency: "yearly" },
  { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" },
  { path: "/mentions-legales", priority: 0.3, changeFrequency: "yearly" },
] as const;

type SitemapProduct = {
  id: string;
  cree_le: string;
  quantite_stock?: number | null;
};

async function getAvailableProducts() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return [];

  const supabase = createSupabaseAdminClient();
  const products: SitemapProduct[] = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const result = await supabase
      .from("vetements")
      .select("id,cree_le,quantite_stock")
      .eq("statut", "disponible")
      .order("cree_le", { ascending: false })
      .range(from, from + pageSize - 1);

    let rows = result.data as SitemapProduct[] | null;
    let error = result.error;

    if (error?.message.toLowerCase().includes("quantite_stock")) {
      const fallback = await supabase
        .from("vetements")
        .select("id,cree_le")
        .eq("statut", "disponible")
        .order("cree_le", { ascending: false })
        .range(from, from + pageSize - 1);
      rows = fallback.data as SitemapProduct[] | null;
      error = fallback.error;
    }

    if (error) throw new Error(error.message);

    const page = rows ?? [];
    products.push(...page.filter((product) => product.quantite_stock == null || product.quantite_stock > 0));
    if (page.length < pageSize) break;
  }

  return products;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = publicPages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  try {
    const products = await getAvailableProducts();
    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteUrl}/boutique/${encodeURIComponent(product.id)}`,
      lastModified: new Date(product.cree_le),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...productEntries];
  } catch (error) {
    console.error("Unable to add products to sitemap", error);
    return staticEntries;
  }
}
