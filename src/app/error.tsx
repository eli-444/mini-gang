"use client";

import { useEffect } from "react";
import { MiniGangErrorPage } from "@/components/mini-gang-error-page";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MiniGangErrorPage
      eyebrow="Erreur"
      title="Petit souci technique"
      message="Un bouton, une page ou une commande a fait un détour. Réessayez dans quelques instants."
      onRetry={reset}
    />
  );
}
