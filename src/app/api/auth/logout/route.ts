import { NextResponse, type NextRequest } from "next/server";
import { clearTokens } from "@/lib/auth";

/** Déconnexion explicite (bouton) : purge les cookies, réponse JSON. */
export async function POST() {
  await clearTokens();
  return NextResponse.json({ ok: true });
}

/**
 * Déconnexion par redirection (session invalidée côté back, 401 hors-proxy) :
 * purge les cookies puis renvoie vers /login. Cible du middleware 401 de `serverApi`.
 */
export async function GET(req: NextRequest) {
  await clearTokens();
  return NextResponse.redirect(new URL("/login", req.url));
}
