"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const leftLinks = [
  { href: "/a-propos", label: "A propos" },
  { href: "/contact", label: "Contact" },
];

const rightLinks = [
  { href: "/boutique", label: "Boutique" },
  { href: "/vendre", label: "Vente" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function AccountIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 12.4a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
      <path d="M4.2 21c1.2-4.1 4-6.2 7.8-6.2s6.6 2.1 7.8 6.2" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.4 8.2h9.2l1.1 11.2a1.6 1.6 0 0 1-1.6 1.8H7.9a1.6 1.6 0 0 1-1.6-1.8L7.4 8.2Z" />
      <path d="M9.2 8.2c0-2.4 1.1-4.2 2.8-4.2s2.8 1.8 2.8 4.2" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname() ?? "";
  const [isOpen, setIsOpen] = useState(false);
  const allLinks = [...leftLinks, ...rightLinks, { href: "/mon-compte", label: "Mon compte" }, { href: "/panier", label: "Panier" }];

  return (
    <header className="sticky top-0 z-50 bg-[var(--mg-cream)] text-[var(--mg-ink)]">
      <div className="relative mx-auto grid h-[56px] max-w-[1780px] grid-cols-[1fr_auto_1fr] items-center px-4 md:h-[60px] md:px-12">
        <nav className="hidden items-center gap-10 text-base font-black md:flex">
          {leftLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`pb-1 ${isActive(pathname, link.href) ? "border-b-[3px] border-current" : ""}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="justify-self-start rounded-full border-2 border-[var(--mg-ink)] px-3 py-1.5 text-xs font-black md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          Menu
        </button>

        <Link href="/" className="mg-wordmark justify-self-center text-center text-[1.65rem] text-[var(--mg-ink)] md:text-[2rem]">
          MINI
          <br />
          GANG
        </Link>

        <div className="hidden items-center justify-end gap-9 text-base font-black md:flex">
          <nav className="flex items-center gap-10">
            {rightLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`pb-1 ${isActive(pathname, link.href) ? "border-b-[3px] border-current" : ""}`}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/mon-compte" aria-label="Mon compte" className={isActive(pathname, "/mon-compte") ? "text-[var(--mg-pop-rose)]" : ""}>
              <AccountIcon />
            </Link>
            <Link href="/panier" aria-label="Panier">
              <CartIcon />
            </Link>
          </div>
        </div>

        <Link href="/panier" aria-label="Panier" className="justify-self-end md:hidden">
          <CartIcon />
        </Link>
      </div>

      {isOpen ? (
        <nav id="mobile-menu" className="border-t-2 border-[var(--mg-ink)]/10 bg-[var(--mg-cream)] px-4 py-3 md:hidden">
          <div className="grid gap-2 text-base font-black">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-xl px-3 py-2 ${isActive(pathname, link.href) ? "bg-[var(--mg-pop-rose)] text-[var(--mg-ink)]" : ""}`}
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
