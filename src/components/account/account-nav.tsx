"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { href: "/mon-compte/profil", label: "Profil" },
  { href: "/mon-compte/commandes", label: "Commandes" },
  { href: "/mon-compte/favoris", label: "Favoris" },
];

export function AccountNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Navigation du compte" className="flex flex-wrap gap-x-7 gap-y-3 text-lg font-black md:text-xl">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`border-b-[3px] pb-1 transition ${
              isActive
                ? "border-[var(--mg-pop-rose)] text-white"
                : "border-transparent text-white/72 hover:border-white/45 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <LogoutButton />
    </nav>
  );
}
