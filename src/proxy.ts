import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  cookieBase,
} from "@/lib/cookies";

const API_URL = process.env.API_URL ?? "http://localhost:3000";
const PUBLIC_PATHS = ["/login", "/register"];

/**
 * Garde d'authentification + refresh transparent (Proxy = ex-Middleware, renommé en Next 16).
 * - cookie access présent → laisse passer (et renvoie les pages publiques vers l'accueil).
 * - access absent mais refresh présent → tente un refresh côté back, repose les cookies sur la réponse.
 * - aucun token valide → redirige vers /login (sauf pages publiques).
 *
 * Le refresh vit ici (et pas dans les Server Components) car seul un proxy/Route Handler
 * peut réécrire un cookie : un SC ne peut pas poser de cookie pendant le render.
 *
 * ponytail: refresh = un fetch back quand l'access a expiré (~toutes les 15 min), acceptable.
 * Si la latence proxy gêne, passer à une vérif d'exp locale du JWT (decode sans I/O) avant le fetch.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  if (access) {
    return isPublic ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }

  if (refresh) {
    const refreshed = await tryRefresh(refresh);
    if (refreshed) {
      const res = isPublic
        ? NextResponse.redirect(new URL("/", req.url))
        : NextResponse.next();
      res.cookies.set(ACCESS_COOKIE, refreshed.accessToken, { ...cookieBase(), maxAge: ACCESS_MAX_AGE });
      res.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, { ...cookieBase(), maxAge: REFRESH_MAX_AGE });
      return res;
    }
  }

  if (isPublic) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", req.url));
}

async function tryRefresh(refreshToken: string) {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    return (await res.json()) as { accessToken: string; refreshToken: string };
  } catch {
    return null;
  }
}

export const config = {
  // Tout sauf les Route Handlers (/api), les assets Next et le favicon.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
