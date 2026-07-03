import { API_URL } from "@/lib/env";

const FRONT_VERSION = process.env.NEXT_PUBLIC_APP_VERSION;

async function fetchApiVersion(): Promise<string | null> {
  try {
    // Revalidation 5 min : la version de l'API ne bouge qu'au déploiement,
    // inutile de taper /health à chaque rendu de page.
    const res = await fetch(`${API_URL}/health`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}

export async function Footer() {
  const apiVersion = await fetchApiVersion();
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-20 pt-2 text-center text-xs text-muted-foreground sm:px-6 md:pb-4">
      <span title={apiVersion ? `API v${apiVersion}` : undefined}>
        PrepaList v{FRONT_VERSION}
      </span>
    </footer>
  );
}
