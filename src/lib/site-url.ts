function normalizeSiteUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const configuredUrls = [
    process.env.PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]
    .map(normalizeSiteUrl)
    .filter((url): url is string => Boolean(url));

  if (process.env.NODE_ENV === "production") {
    const publicUrl = configuredUrls.find((url) => {
      const hostname = new URL(url).hostname;
      return hostname !== "localhost" && hostname !== "127.0.0.1";
    });
    if (publicUrl) return publicUrl;
  }

  return configuredUrls[0] ?? "http://localhost:3000";
}
