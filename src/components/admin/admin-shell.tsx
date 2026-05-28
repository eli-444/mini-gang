"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { href: "/admin", label: "Accueil" },
  { href: "/admin/products", label: "Vetements" },
  { href: "/admin/orders", label: "Commandes" },
  { href: "/admin/sell-orders", label: "Rachat" },
  { href: "/admin/customers", label: "Clients" },
  { href: "/admin/settings", label: "Reglages" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const currentItem =
    navItems.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))) ??
    navItems[0];

  return (
    <div className="admin-theme">
      <div className="relative min-h-screen lg:pl-[280px]">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-slate-200/70 bg-[rgba(20,17,13,0.97)] backdrop-blur transition-transform duration-300 lg:translate-x-0 ${
            isNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200/70 px-5 py-5">
              <BrandLogo href="/admin" imageClassName="w-24" />
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">Admin Control Panel</p>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-5">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsNavOpen(false)}
                      className={`block rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "border-[#d2c0a5] bg-[linear-gradient(135deg,rgba(255,250,241,0.22),rgba(210,192,165,0.16))] text-[#fff8eb] shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
                          : "border-transparent text-slate-300 hover:border-slate-400/40 hover:bg-white/6 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-slate-200/70 px-4 py-4">
              <p className="text-xs text-slate-400">Workspace</p>
              <BrandLogo href="/" className="mt-2 block w-fit" imageClassName="w-20" />
            </div>
          </div>
        </aside>

        {isNavOpen ? (
          <button
            aria-label="Fermer le menu admin"
            onClick={() => setIsNavOpen(false)}
            className="fixed inset-0 z-40 bg-black/55 lg:hidden"
          />
        ) : null}

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[rgba(248,241,230,0.92)] px-4 py-3 backdrop-blur lg:px-8">
            <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300/60 px-3 py-1.5 text-sm font-semibold text-[#1a1713] lg:hidden"
                  onClick={() => setIsNavOpen(true)}
                >
                  Menu
                </button>
                <p className="text-sm font-semibold text-[#1a1713]">{currentItem.label}</p>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/" className="rounded-lg border border-slate-300/80 px-3 py-1.5 text-sm font-semibold text-[#1a1713]">
                  Voir le site
                </Link>
                <LogoutButton className="px-2 py-1 text-xs font-semibold text-[#1a1713]/55 transition hover:text-[#1a1713] disabled:cursor-wait disabled:opacity-60" />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
