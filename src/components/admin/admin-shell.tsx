"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const navSections = [
  {
    title: "Core",
    items: [
      { href: "/admin", label: "Dashboard", hint: "Vue globale" },
      { href: "/admin/products", label: "Vetements", hint: "Catalogue" },
      { href: "/admin/orders", label: "Commandes", hint: "Paiements" },
    ],
  },
  {
    title: "Business",
    items: [
      { href: "/admin/customers", label: "Clients", hint: "Support" },
      { href: "/admin/analytics", label: "Analytics", hint: "Insights" },
      { href: "/admin/settings", label: "Parametres", hint: "Config" },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = searchParams.get("period") ?? "30d";
  const [isNavOpen, setIsNavOpen] = useState(false);

  const getPeriodHref = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

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
              <Link href="/admin" className="block font-display text-3xl leading-none text-white">
                Mini Gang
              </Link>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">Admin Control Panel</p>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="mb-2 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsNavOpen(false)}
                          className={`group flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
                            active
                              ? "border-[#d2c0a5] bg-[linear-gradient(135deg,rgba(255,250,241,0.22),rgba(210,192,165,0.16))] text-[#fff8eb] shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
                              : "border-transparent text-slate-300 hover:border-slate-400/40 hover:bg-white/6 hover:text-white"
                          }`}
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className={`text-[0.7rem] uppercase tracking-wide ${active ? "text-[#f3e4cf]" : "text-slate-500 group-hover:text-slate-300"}`}>
                            {item.hint}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-slate-200/70 px-4 py-4">
              <p className="text-xs text-slate-400">Workspace</p>
              <p className="mt-1 text-sm font-semibold text-white">Le Mini Gang</p>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300/60 px-3 py-1.5 text-sm font-semibold text-[#1a1713] lg:hidden"
                  onClick={() => setIsNavOpen(true)}
                >
                  Menu
                </button>
                {["7d", "30d", "90d"].map((value) => (
                  <Link
                    key={value}
                    href={getPeriodHref(value)}
                    className={`admin-pill px-3 py-1 text-xs font-semibold ${period === value ? "active" : ""}`}
                  >
                    {value}
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  placeholder="Recherche globale"
                  className="w-52 rounded-lg border border-slate-200 px-3 py-1.5 text-sm md:w-72"
                />
                <Link href="/admin/orders" className="rounded-lg border border-slate-300/80 px-3 py-1.5 text-sm font-semibold text-[#1a1713]">
                  Commandes
                </Link>
                <Link href="/admin/products/new" className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">
                  Ajouter produit
                </Link>
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
