import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">
        Page <span className="text-[var(--mg-pop-rose)]">introuvable</span>
      </h1>
      <p className="mt-2 text-sm font-bold text-[var(--mg-on-dark-muted)]">
        Cette page n&apos;existe pas (ou plus). Retournez a la{" "}
        <span className="text-[var(--mg-pop-sun)]">boutique</span> pour continuer.
      </p>
      <Link href="/boutique" className="mt-4 rounded-full bg-[var(--mg-accent)] px-5 py-2 text-sm font-semibold text-white">
        Retourner a la boutique
      </Link>
    </div>
  );
}
