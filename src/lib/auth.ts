import "server-only";
import { cookies } from "next/headers";
import { errorText } from "./action-result";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  cookieBase,
} from "./cookies";
import { API_URL } from "./env";

export type TokenPair = { accessToken: string; refreshToken: string };

/** Porte le statut du back pour le relayer tel quel au client. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function postAuth(path: string, body: unknown): Promise<TokenPair> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, errorText(data, "Échec de l'authentification."));
  }
  return res.json() as Promise<TokenPair>;
}

export const login = (email: string, password: string) =>
  postAuth("/auth/login", { email, password });

export const register = (email: string, password: string) =>
  postAuth("/auth/register", { email, password });

export async function setTokens(pair: TokenPair): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, pair.accessToken, { ...cookieBase(), maxAge: ACCESS_MAX_AGE });
  jar.set(REFRESH_COOKIE, pair.refreshToken, { ...cookieBase(), maxAge: REFRESH_MAX_AGE });
}

export async function clearTokens(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export type CurrentUser = { id: string; email: string; role: string };

/**
 * Décode le payload sans vérifier la signature : le cookie httpOnly n'est posé que
 * par notre code serveur, les Route Handlers `/api/auth/*` et `proxy.ts`.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getAccessToken();
  const payload = token?.split(".")[1];
  if (!payload) return null;
  try {
    const { sub, email, role } = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return { id: sub, email, role };
  } catch {
    return null;
  }
}
