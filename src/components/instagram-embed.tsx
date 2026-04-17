"use client";

import Link from "next/link";
import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
  }
}

const instagramScriptId = "instagram-embed-script";

function processInstagramEmbed() {
  window.instgrm?.Embeds?.process();
}

export function InstagramEmbed() {
  useEffect(() => {
    if (window.instgrm?.Embeds) {
      processInstagramEmbed();
      return;
    }

    const existingScript = document.getElementById(instagramScriptId) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", processInstagramEmbed, { once: true });
      return () => existingScript.removeEventListener("load", processInstagramEmbed);
    }

    const script = document.createElement("script");
    script.id = instagramScriptId;
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = processInstagramEmbed;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  return (
    <blockquote
      className="instagram-media mx-auto min-h-[420px] w-full max-w-[540px]"
      data-instgrm-permalink="https://www.instagram.com/leminigang/"
      data-instgrm-version="14"
    >
      <Link href="https://www.instagram.com/leminigang/" target="_blank" rel="noreferrer" className="text-sm font-semibold underline">
        Voir les derniers posts Instagram
      </Link>
    </blockquote>
  );
}
