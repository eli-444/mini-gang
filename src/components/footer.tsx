import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

type FooterVariant = "dark" | "light";

const primaryLinks = [
  { href: "/a-propos", label: "A propos" },
  { href: "/contact", label: "Contact" },
  { href: "/boutique", label: "Boutique" },
  { href: "/vendre", label: "Vendre" },
  { href: "/mon-compte", label: "Mon compte" },
];

const secondaryLinks = [
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialites" },
  { href: "/mentions-legales", label: "Mentions-legales" },
  { href: "/retours", label: "Retours" },
];

export function Footer({ variant = "dark" }: { variant?: FooterVariant }) {
  const isLight = variant === "light";

  return (
    <footer className={isLight ? "bg-[var(--mg-cream)] text-[var(--mg-ink)]" : "bg-[var(--mg-bg)] text-[var(--mg-on-dark)]"}>
      <div className="mg-container py-8 md:py-12">
        <div className="mg-footer-line mb-6 md:mb-8" />
        <div className="grid gap-10 md:grid-cols-[1fr_1fr_1fr] md:items-start">
          <div className="space-y-10 md:space-y-16">
            <BrandLogo imageClassName={`w-24 md:w-32 ${isLight ? "" : "brightness-0 invert"}`} />
            <p className="text-sm font-black md:text-lg">(c) 2026 Le Mini Gang</p>
          </div>

          <nav className="grid gap-2 text-base font-black md:gap-3 md:text-xl">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className="w-fit hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="grid gap-10">
            <nav className="grid gap-2 text-base font-black md:gap-3 md:text-xl">
              {secondaryLinks.map((link) => (
                <Link key={link.href} href={link.href} className="w-fit hover:underline">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex gap-4 text-3xl md:justify-start">
              <Link href="https://www.facebook.com/share/1AS4fgVB1Z/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Facebook">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                  <path d="M13.2 22v-8.3h2.8l.4-3.2h-3.2V8.4c0-.9.3-1.6 1.6-1.6h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7v3.2h2.8V22h3.4Z" />
                </svg>
              </Link>
              <Link href="https://www.instagram.com/leminigang/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M17.2 6.8h.1" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
