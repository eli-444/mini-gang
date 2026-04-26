"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const leftLinks = [
  { href: "/a-propos", label: "A propos" },
  { href: "/contact", label: "Contact" },
];

const rightLinks = [{ href: "/vendre", label: "Vendre" }];

const boutiqueLinks = [
  { href: "/boutique?shop_section=vetements", label: "Vetements" },
  { href: "/boutique?shop_section=merche", label: "Merche" },
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobileLinks = [
    { href: "/vendre", label: "Vendre" },
    { href: "/a-propos", label: "A propos" },
    { href: "/contact", label: "Contact" },
    { href: "/mon-compte", label: "Mon compte" },
  ];

  const boutiqueIsActive = pathname.startsWith("/boutique");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--mg-ring)] bg-white">
      <div className="relative mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 md:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex w-fit rounded-lg border border-[var(--mg-ring)] px-3 py-2 text-xs font-bold text-[var(--mg-ink)] md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          Menu
        </button>
        <nav className="hidden items-center gap-4 text-xs md:flex">
          {leftLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative pb-1 font-semibold tracking-[0.04em] ${
                pathname.startsWith(link.href) ? "text-[var(--mg-accent-strong)]" : "text-[var(--mg-ink)]/75"
              }`}
            >
              {link.label}
              {pathname.startsWith(link.href) ? (
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[var(--mg-sun)]" />
              ) : null}
            </Link>
          ))}
        </nav>

        <Link href="/" className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <Image src="/brand/logo.png" alt="Le Mini Gang" width={150} height={82} priority className="h-12 w-auto md:h-[4.1rem]" />
        </Link>

        <div className="flex items-center justify-end gap-2 md:gap-5">
          <nav className="hidden items-center gap-4 text-xs md:flex">
            <div className="group relative inline-flex items-center">
              <Link
                href="/boutique"
                className={`relative pb-1 font-semibold tracking-[0.04em] ${
                  boutiqueIsActive ? "text-[var(--mg-accent-strong)]" : "text-[var(--mg-ink)]/75"
                }`}
              >
                Boutique
                {boutiqueIsActive ? (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[var(--mg-sun)]" />
                ) : null}
              </Link>
              <div className="invisible absolute left-0 top-full z-30 w-44 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-lg border border-[var(--mg-ring)] bg-white p-2 shadow-[0_14px_30px_rgba(45,34,64,0.12)]">
                  {boutiqueLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-md px-3 py-2 text-sm font-semibold text-[var(--mg-ink)] hover:bg-[var(--mg-rose-soft)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {rightLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1 font-semibold tracking-[0.04em] ${
                  pathname.startsWith(link.href) ? "text-[var(--mg-accent-strong)]" : "text-[var(--mg-ink)]/75"
                }`}
              >
                {link.label}
                {pathname.startsWith(link.href) ? (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[var(--mg-sun)]" />
                ) : null}
              </Link>
            ))}

            <div className="group relative inline-flex items-center">
              <Link
                href="/mon-compte"
                className={`relative pb-1 font-semibold tracking-[0.04em] ${
                  pathname.startsWith("/mon-compte") || pathname.startsWith("/auth")
                    ? "text-[var(--mg-accent-strong)]"
                    : "text-[var(--mg-ink)]/75"
                }`}
              >
                Mon compte
                {pathname.startsWith("/mon-compte") || pathname.startsWith("/auth") ? (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[var(--mg-sun)]" />
                ) : null}
              </Link>
              <div className="invisible absolute right-0 top-full z-30 w-44 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-lg border border-[var(--mg-ring)] bg-white p-2 shadow-[0_14px_30px_rgba(45,34,64,0.12)]">
                  <Link
                    href="/auth/login"
                    className="block rounded-md px-3 py-2 text-sm font-semibold text-[var(--mg-ink)] hover:bg-[var(--mg-rose-soft)]"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="mt-1 block rounded-md px-3 py-2 text-sm font-semibold text-[var(--mg-ink)] hover:bg-[var(--mg-rose-soft)]"
                  >
                    Inscription
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <Link href="/panier" className="rounded-full bg-[var(--mg-ink)] px-4 py-2 text-xs font-bold text-white">
            Panier
          </Link>
        </div>
      </div>
      {isOpen ? (
        <nav id="mobile-menu" className="border-t border-[var(--mg-ring)] bg-white px-4 py-3 md:hidden">
          <div className="mx-auto grid max-w-6xl gap-2">
            <div className="rounded-lg border border-[var(--mg-ring)] p-2">
              <p className="px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--mg-ink)]/45">Boutique</p>
              {boutiqueLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
                    boutiqueIsActive ? "text-[var(--mg-accent-strong)]" : "text-[var(--mg-ink)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {mobileLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  pathname.startsWith(link.href) ? "bg-[var(--mg-rose-soft)] text-[var(--mg-accent-strong)]" : "text-[var(--mg-ink)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
