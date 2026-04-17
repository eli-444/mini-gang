import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16">
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <div className="mg-shell flex flex-wrap items-center justify-between gap-3 bg-[linear-gradient(120deg,#fff,#fff6fb)] px-5 py-6 text-sm text-[var(--mg-ink)]/70">
          <p>(c) {new Date().getFullYear()} Le Mini Gang</p>
          <div className="flex gap-4">
            <Link href="/boutique">Boutique</Link>
            <Link href="/a-propos">A propos</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/cgv">CGV</Link>
            <Link href="/retours">Retours</Link>
            <Link href="/confidentialite">Confidentialite</Link>
            <Link href="/mentions-legales">Impressum</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
