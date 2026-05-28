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
        "self-center text-sm font-semibold text-white/48 transition hover:text-white/78 disabled:cursor-wait disabled:opacity-60"
      }
    >
      {isLoading ? "Deconnexion..." : "Se deconnecter"}
    </button>
  );
}
