"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { href: "/admin", label: "Tableau de bord", section: "Pilotage", icon: "01" },
  { href: "/admin/products", label: "Vêtements", section: "Boutique", icon: "02" },
  { href: "/admin/merch", label: "Merch", section: "Boutique", icon: "03" },
  { href: "/admin/orders", label: "Commandes", section: "Boutique", icon: "04" },
  { href: "/admin/customers", label: "Clients", section: "Boutique", icon: "05" },
  { href: "/admin/promo-codes", label: "Codes promo", section: "Boutique", icon: "06" },
  { href: "/admin/sell-orders", label: "Rachat", section: "Opérations", icon: "07" },
  { href: "/admin/settings", label: "Réglages", section: "Système", icon: "08" },
];

const navSections = ["Pilotage", "Boutique", "Opérations", "Système"];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const currentItem =
    navItems.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))) ??
    navItems[0];

  return (
    <div className="admin-theme">
      <div className="relative min-h-screen lg:pl-[260px]">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[260px] border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
            isNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-6 py-5">
              <BrandLogo href="/admin" imageClassName="w-20" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Panel admin</p>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-5">
              {navSections.map((section) => {
                const items = navItems.filter((item) => item.section === section);
                return (
                  <div key={section} className="mb-6 last:mb-0">
                    <p className="mb-2 px-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-400">{section}</p>
                    <div className="grid gap-1">
                      {items.map((item) => {
                        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsNavOpen(false)}
                            className={`flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-sm font-semibold transition ${
                              active
                                ? "border-[#cfe2d6] bg-[#e8f2ec] text-[#154d31]"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                            }`}
                          >
                            <span
                              className={`grid h-7 w-7 place-items-center rounded-md text-[0.68rem] font-black ${
                                active ? "bg-white text-[#154d31]" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 px-5 py-4">
              <p className="text-xs font-semibold text-slate-500">Mini Gang</p>
              <Link href="/" className="mt-2 inline-flex text-sm font-semibold text-[#154d31] underline underline-offset-4">
                Ouvrir le site
              </Link>
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
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/92 px-4 py-3 backdrop-blur lg:px-8">
            <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 lg:hidden"
                  onClick={() => setIsNavOpen(true)}
                >
                  Menu
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Admin</p>
                  <p className="text-sm font-bold text-slate-900">{currentItem.label}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Voir le site
                </Link>
                <LogoutButton className="px-2 py-1 text-xs font-semibold text-slate-400 transition hover:text-slate-700 disabled:cursor-wait disabled:opacity-60" />
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
