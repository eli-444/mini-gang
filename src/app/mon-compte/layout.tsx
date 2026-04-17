import Link from "next/link";
import { requireUser } from "@/lib/auth";

const navItems = [
  { href: "/mon-compte/profil", label: "Profil" },
  { href: "/mon-compte/commandes", label: "Commandes" },
  { href: "/retours", label: "Retours" },
];

export default async function MonCompteLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/auth/login");

  return (
    <div className="space-y-5 pb-10">
      <header className="mg-shell rounded-[18px] bg-white p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--mg-accent-strong)]">Espace client</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--mg-ink)]">Mon compte Mini Gang</h1>
        <nav className="mt-3 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full border border-[var(--mg-ring)] px-3 py-1 text-xs font-semibold text-[var(--mg-ink)]">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
