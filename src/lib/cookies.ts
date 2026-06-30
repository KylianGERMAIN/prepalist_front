/**
 * Constantes et options des cookies d'auth, partagées entre le middleware (Edge runtime)
 * et les helpers serveur (`lib/auth`). Ce module ne dépend PAS de `next/headers` pour rester
 * importable depuis le middleware Edge.
 *
 * Les `maxAge` sont alignés sur les durées de vie JWT du back (access 15m, refresh 7j) :
 * quand le navigateur drope le cookie access à 15m, le middleware refresh via le cookie refresh.
 */
export const ACCESS_COOKIE = "pl_access";
export const REFRESH_COOKIE = "pl_refresh";

export const ACCESS_MAX_AGE = 60 * 15; // 15 min — cf. JWT_ACCESS_EXPIRES_IN
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 j — cf. JWT_REFRESH_EXPIRES_IN

/** Options communes des cookies d'auth : httpOnly (anti-XSS), secure en prod, SameSite Lax. */
export function cookieBase() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}
