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

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <Footer />
    </>
  );
}
