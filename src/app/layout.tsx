import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Le Mini Gang",
  description: "E-shop de vetements de seconde main pour enfants.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
