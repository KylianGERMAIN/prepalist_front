import "server-only";
import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  cookieBase,
} from "./cookies";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

/** Paire de tokens renvoyée par le back (cf. TokenPair côté API). */
export type TokenPair = { accessToken: string; refreshToken: string };

/** Erreur portant le statut HTTP du back pour le relayer tel quel au client. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Extrait un message lisible d'un corps d'erreur NestJS (`message` string ou string[]). */
function errorMessage(data: unknown, fallback: string): string {
  const msg = (data as { message?: unknown } | null)?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  return fallback;
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
    throw new ApiError(res.status, errorMessage(data, "Échec de l'authentification."));
  }
  return res.json() as Promise<TokenPair>;
}

/** Authentifie un utilisateur existant. */
export const login = (email: string, password: string) =>
  postAuth("/auth/login", { email, password });

/** Crée un compte et renvoie une paire de tokens. */
export const register = (email: string, password: string) =>
  postAuth("/auth/register", { email, password });

/** Pose access + refresh en cookies httpOnly. */
export async function setTokens(pair: TokenPair): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, pair.accessToken, { ...cookieBase(), maxAge: ACCESS_MAX_AGE });
  jar.set(REFRESH_COOKIE, pair.refreshToken, { ...cookieBase(), maxAge: REFRESH_MAX_AGE });
}

/** Supprime les cookies d'auth (déconnexion). */
export async function clearTokens(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

/** Token d'accès courant, ou undefined si non connecté. À injecter en Bearer dès F1. */
export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}
