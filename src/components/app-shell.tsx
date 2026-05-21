"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  const isLightRoute = pathname.startsWith("/contact");

  return (
    <div className={isLightRoute ? "site-page-light min-h-screen" : "site-page-green min-h-screen"}>
      <Header />
      <main className={`${isLightRoute ? "site-page-light" : "site-page-green"} w-full flex-1`}>{children}</main>
      <Footer variant={isLightRoute ? "light" : "dark"} />
    </div>
  );
}
