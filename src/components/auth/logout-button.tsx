"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isLoading}
      className={
        className ??
        "border-b-[3px] border-transparent pb-1 text-left text-white/72 transition hover:border-white/45 hover:text-white disabled:cursor-wait disabled:opacity-60"
      }
    >
      {isLoading ? "Deconnexion..." : "Se deconnecter"}
    </button>
  );
}
