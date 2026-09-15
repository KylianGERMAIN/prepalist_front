import { API_URL } from "@/lib/env";

const FRONT_VERSION = process.env.APP_VERSION ?? "?";

async function fetchApiVersion(): Promise<string | null> {
  try {
    // La version ne bouge qu'au déploiement, et une API lente ne doit pas retarder
    // le rendu. `fetch` brut et non `serverApi()` : évite son middleware 401.
    const res = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    return data.version ?? null;
  } catch (err) {
    console.warn("Footer: version API introuvable", err);
    return null;
  }
}

export async function Footer() {
  const apiVersion = await fetchApiVersion();
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-20 pt-2 text-center text-xs text-muted-foreground sm:px-6 md:pb-4">
      {/* Version API en infobulle : bonus desktop (title natif, pas de survol sur mobile). */}
      <span title={apiVersion ? `API v${apiVersion}` : undefined}>
        PrepaList v{FRONT_VERSION}
      </span>
    </footer>
  );
}
