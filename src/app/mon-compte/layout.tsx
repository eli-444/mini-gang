import { AccountNav } from "@/components/account/account-nav";
import { requireUser } from "@/lib/auth";

export default async function MonCompteLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/auth/login");

  return (
    <div className="mg-container py-9 md:py-12 lg:py-14">
      <header className="mb-7 border-b border-white/18 pb-6 md:mb-9 md:flex md:items-end md:justify-between md:gap-10 md:pb-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black leading-none text-white md:text-6xl">Mon compte</h1>
        </div>
        <div className="mt-6 md:mt-0">
          <AccountNav />
        </div>
      </header>
      {children}
    </div>
  );
}
