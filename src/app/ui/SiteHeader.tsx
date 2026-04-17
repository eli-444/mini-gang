"use client";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(255,255,255,0.65)] shadow-sm">
      <div className="mg-container flex items-center justify-between py-4">
        
        {/* --- LOGO GEMINI --- */}
        <Link
          href="/"
          className="
            mg-logo
            transition-transform
          "
        >
          MINI<br />GANG
        </Link>

        {/* --- NAVIGATION --- */}
        <nav className="flex gap-6 text-sm font-semibold text-[var(--mg-indigo)]">
          <Link href="/boutique">Boutique</Link>
          <Link href="/vendre">Vendre</Link>
          <Link href="/concept">Concept</Link>
          <Link href="/panier">Panier</Link>
        </nav>
      </div>
    </header>
  );
}
