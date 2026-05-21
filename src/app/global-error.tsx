"use client";

import { useEffect } from "react";
import { MiniGangErrorPage } from "@/components/mini-gang-error-page";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <MiniGangErrorPage
          eyebrow="Erreur"
          title="Le site s'est emmêlé"
          message="Un problème est arrivé pendant le chargement. Réessayez, et si ça continue, le Mini Gang regardera ça de près."
          onRetry={reset}
        />
      </body>
    </html>
  );
}
