import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { requireUser } from "@/lib/auth";
import { listFavoriteProducts } from "@/lib/favorites";

export default async function MonCompteFavorisPage() {
  const { user } = await requireUser("/auth/login");
  const products = await listFavoriteProducts(user.id);

  return (
    <section className="bg-[var(--mg-surface)] px-5 py-6 text-[var(--mg-ink)] md:px-8 md:py-8">
      <h2 className="text-2xl font-black leading-tight md:text-3xl">Mes favoris</h2>

      {products.length > 0 ? (
        <div className="mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isFavorite />
          ))}
        </div>
      ) : (
        <div className="mt-8 border-l-4 border-[var(--mg-pop-rose)] py-2 pl-4">
          <p className="text-base font-semibold leading-7 text-[var(--mg-ink)]/72">
            Votre liste est vide pour le moment.
          </p>
          <Link href="/boutique" className="mt-3 inline-flex text-base font-black text-[var(--mg-accent-strong)] underline">
            Voir la boutique
          </Link>
        </div>
      )}
    </section>
  );
}
